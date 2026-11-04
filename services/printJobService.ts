/**
 * services/printJobService.ts
 * 
 * Hardware ESC/POS Print Stream Dispatcher for FlashBill.
 * Converts invoice data into high-speed ESC/POS thermal control codes and transmits them
 * over Bluetooth RFCOMM to 58mm (SC588) or 80mm (EZO 80UB) POS printers.
 * 
 * Features:
 * - "Billing Receipt" header banner (no store name)
 * - Automatic real-time date (DD/MM/YYYY) and live time (hh:mm AM/PM) detection at print moment
 * - 80mm layout: "Invoice No" (up) & "Customer" (below) on Left, "Date" (up) & "Time" (below) on Right
 * - 58mm layout: Compact proportional metadata layout fitting 32 columns
 * - Qty/Unit column with units (e.g. "2 KG", "1.5 L", "12 DZ")
 * - Summary footer with Total Items/Qty, Subtotal, Total Discount, and Final Amount
 * - Preserves auto-cut and feed lines customization
 */

import { BluetoothEscposPrinter } from './bluetoothPrinter';
import { PrinterProfile } from '../types/printer';
import { InvoiceData } from '../types/billing';
import { storageService } from './storageService';

export interface PrintJobResult {
  success: boolean;
  message?: string;
}

/**
 * Pads two strings across a fixed monospace line width (Left aligned + Right aligned).
 */
function formatTwoColumns(left: string, right: string, width: number): string {
  const maxLeft = Math.max(1, width - right.length - 1);
  const trimmedLeft = left.length > maxLeft ? left.substring(0, maxLeft) : left;
  const spaces = Math.max(1, width - trimmedLeft.length - right.length);
  return `${trimmedLeft}${' '.repeat(spaces)}${right}\n`;
}

export interface ColumnSpec {
  text: string;
  width: number;
  align: 'left' | 'right';
}

/**
 * Formats a single line into fixed-width monospace columns.
 */
export function formatColumns(cols: ColumnSpec[]): string {
  let line = '';
  for (const col of cols) {
    const txt = col.text || '';
    if (txt.length >= col.width) {
      line += txt.substring(0, col.width);
    } else {
      const pad = ' '.repeat(col.width - txt.length);
      if (col.align === 'right') {
        line += pad + txt;
      } else {
        line += txt + pad;
      }
    }
  }
  return line + '\n';
}

/**
 * Wraps text strictly along whitespace boundaries without breaking words mid-character.
 * Extends across as many lines as necessary without arbitrary line-count limits.
 */
export function wrapTextToWords(text: string, maxChars: number): string[] {
  if (!text || text.trim().length === 0) return [''];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      if (word.length <= maxChars) {
        currentLine = word;
      } else {
        // Individual word exceeds maxChars: split chunks safely
        let remaining = word;
        while (remaining.length > maxChars) {
          lines.push(remaining.substring(0, maxChars));
          remaining = remaining.substring(maxChars);
        }
        currentLine = remaining;
      }
    } else {
      if (currentLine.length + 1 + word.length <= maxChars) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        if (word.length <= maxChars) {
          currentLine = word;
        } else {
          let remaining = word;
          while (remaining.length > maxChars) {
            lines.push(remaining.substring(0, maxChars));
            remaining = remaining.substring(maxChars);
          }
          currentLine = remaining;
        }
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Dispatches a complete formatted receipt job to the connected printer.
 * 
 * @param activeConfig - Target printer profile specs (SC588 or EZO80)
 * @param invoice - Invoice payload to print
 */
export async function dispatchPrintReceipt(
  activeConfig: PrinterProfile,
  invoice: InvoiceData
): Promise<PrintJobResult> {
  try {
    const is80mm = activeConfig.lineWidth >= 48;
    const dividerLine = `${'-'.repeat(activeConfig.lineWidth)}\n`;

    // 1. Automatically detect real-time date and live time at print dispatch moment
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const liveDate = `${day}/${month}/${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const liveTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    // Customer name fallback
    const customer = (invoice.customerName && invoice.customerName.trim()) 
      ? invoice.customerName.trim() 
      : 'Walk-in Customer';

    // 2. Hardware Initialization: ESC @ resets buffer, clears line spacing & cancels error states
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.printerLeftSpace(0);

    // Top paper feed: Customizable via activeConfig.feedLines.topSpace
    if (activeConfig.feedLines.topSpace > 0) {
      await BluetoothEscposPrinter.printText('\n'.repeat(activeConfig.feedLines.topSpace), {});
    }

    // --- 3. Header Region: "Delivery Slip" (Centered, crisp 1x font) ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText('Delivery Slip\n', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,  // Standard 1x width: prevents oversized horizontal stretching
      heigthtimes: 0, // Standard 1x height: crisp, clean, and proportional
      fonttype: 0,    // Standard Font A
    });
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 4. Metadata Block ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    if (is80mm) {
      // 80mm layout (48 Columns)
      const line1 = formatTwoColumns(
        `Invoice No: ${invoice.invoiceNo}`,
        `Date: ${liveDate}`,
        48
      );
      const line2 = formatTwoColumns(
        `Customer: ${customer}`,
        `Time: ${liveTime}`,
        48
      );
      await BluetoothEscposPrinter.printText(line1, {});
      await BluetoothEscposPrinter.printText(line2, {});
    } else {
      // 58mm layout (32 Columns)
      const shortYear = String(year).slice(-2);
      const shortDate = `${day}/${month}/${shortYear}`;
      const line1 = formatTwoColumns(
        `Inv No: ${invoice.invoiceNo}`,
        `Date: ${shortDate}`,
        32
      );
      await BluetoothEscposPrinter.printText(line1, {});

      if (customer.length > 11) {
        await BluetoothEscposPrinter.printText(`Cust: ${customer}\n`, {});
        await BluetoothEscposPrinter.printText(`Time: ${liveTime}\n`, {});
      } else {
        const line2 = formatTwoColumns(
          `Cust: ${customer}`,
          `Time: ${liveTime}`,
          32
        );
        await BluetoothEscposPrinter.printText(line2, {});
      }
    }
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 5. Table Header (#, Name, Qty, Price, Amount) ---
    const sNoWidth = 3;
    const nameColWidth = is80mm ? 21 : 11;
    const qtyColWidth = is80mm ? 8 : 6;
    const priceColWidth = is80mm ? 8 : 6;
    const amtColWidth = is80mm ? 8 : 6;

    const tableHeader = formatColumns([
      { text: '#', width: sNoWidth, align: 'left' },
      { text: 'Name', width: nameColWidth, align: 'left' },
      { text: 'Qty', width: qtyColWidth, align: 'right' },
      { text: 'Price', width: priceColWidth, align: 'right' },
      { text: 'Amount', width: amtColWidth, align: 'right' },
    ]);
    await BluetoothEscposPrinter.printText(tableHeader, {});
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // Compact line spacing (26 dots) inside multi-line items
    try {
      await BluetoothEscposPrinter.printerLineSpace(26);
    } catch {
      // Safe fallback if printer does not support variable line spacing
    }

    // --- 6. Items List Loop (Alphabetical A-Z, Multi-Line Word Wrap & Per-Item Dashed Divider) ---
    const sortedItems = [...invoice.items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    for (let i = 0; i < sortedItems.length; i++) {
      const record = sortedItems[i];
      const sNo = String(i + 1);
      const unitText = record.unit ? ` ${record.unit}` : '';
      const qtyWithUnit = `${record.qty}${unitText}`.trim();

      // Clean whole-number representation to fit columns neatly
      const cleanPrice = String(record.price || '').replace(/\.00$/, '');
      const cleanAmt = String(record.amt || '').replace(/\.00$/, '');

      // Word-wrap item name without breaking words mid-character
      const nameLines = wrapTextToWords(record.name, nameColWidth);

      // Line 1: SNo + First line of Name + Qty + Price + Amount
      const firstRow = formatColumns([
        { text: sNo, width: sNoWidth, align: 'left' },
        { text: nameLines[0] || '', width: nameColWidth, align: 'left' },
        { text: qtyWithUnit, width: qtyColWidth, align: 'right' },
        { text: cleanPrice, width: priceColWidth, align: 'right' },
        { text: cleanAmt, width: amtColWidth, align: 'right' },
      ]);
      await BluetoothEscposPrinter.printText(firstRow, {});

      // Continuation lines for Name (indented by 3 spaces directly under Name column)
      for (let k = 1; k < nameLines.length; k++) {
        const continuationRow = '   ' + nameLines[k] + '\n';
        await BluetoothEscposPrinter.printText(continuationRow, {});
      }

      // Dedicated discount line (if configured)
      const discPct = parseFloat(record.discountPercent || '0') || 0;
      const discAmt = parseFloat(record.discountAmount || '0') || 0;
      if (discPct > 0 || discAmt > 0) {
        const q = parseFloat(record.qty) || 0;
        const p = parseFloat(record.price) || 0;
        const gross = q * p;
        const calcPct = discPct > 0 ? discPct : (gross > 0 ? Math.round((discAmt / gross) * 100) : 0);
        const calcAmt = discAmt > 0 ? discAmt : (gross * (discPct / 100));
        const amtStr = calcAmt > 0 ? `(-Rs.${calcAmt.toFixed(2).replace(/\.00$/, '')})` : '';
        const pctStr = calcPct > 0 ? `${calcPct}%` : '';
        const discDetails = [pctStr, amtStr].filter(Boolean).join(' ');
        const discountLine = `   * Dis: ${discDetails}\n`;
        await BluetoothEscposPrinter.printText(discountLine, {});
      }

      // Separator dashed line between each item (as requested by store manager)
      await BluetoothEscposPrinter.printText(dividerLine, {});
    }

    // Reset to standard line spacing for totals
    try {
      await BluetoothEscposPrinter.printerLineSpace(0);
    } catch {
      // ignore
    }

    // --- 7. Summary Totals ---
    const subtotalValue = String(invoice.subtotal || invoice.grandTotal).replace(/\.00$/, '');
    const discountValue = String(invoice.totalDiscount || (invoice.discountAmount ? invoice.discountAmount : '0.00')).replace(/\.00$/, '');
    const finalAmountValue = String(invoice.finalAmount || invoice.grandTotal).replace(/\.00$/, '');

    const lineQty = formatTwoColumns('Total Items/Qty:', invoice.totalQty, activeConfig.lineWidth);
    const lineSub = formatTwoColumns('Subtotal:', subtotalValue, activeConfig.lineWidth);
    const lineDisc = formatTwoColumns('Total Discount:', `-${discountValue}`, activeConfig.lineWidth);
    const lineFinal = formatTwoColumns('Final Amount:', finalAmountValue, activeConfig.lineWidth);

    await BluetoothEscposPrinter.printText(lineQty, {});
    await BluetoothEscposPrinter.printText(lineSub, {});
    await BluetoothEscposPrinter.printText(lineDisc, {});
    await BluetoothEscposPrinter.printText(lineFinal, {});
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // Centered Festive / Custom Footer Greeting (if configured)
    const customFooter = await storageService.loadReceiptFooter();
    if (customFooter.trim().length > 0) {
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printText(`${customFooter.trim()}\n`, {});
    }

    // --- 8. Paper Feed & Auto-Cut ---
    if (activeConfig.feedLines.bottomSpace > 0) {
      await BluetoothEscposPrinter.printText(
        '\n'.repeat(activeConfig.feedLines.bottomSpace),
        {}
      );
    }

    if (activeConfig.hasAutoCutter) {
      // ESC/POS Command: GS V 0 (0x1D 0x56 0x00) = Motorized Full Cut
      await BluetoothEscposPrinter.printText('\x1D\x56\x00', {});
    }

    return {
      success: true,
      message: `Delivery Slip dispatched to ${activeConfig.displayName} at ${liveTime} successfully.${
        activeConfig.hasAutoCutter ? '\n✂️ Auto-cutter blade triggered.' : ''
      }`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Print Failed: ${errorMsg}`,
    };
  }
}

/**
 * Dispatches a diagnostic test receipt to verify printer connectivity,
 * column alignment (32 cols for 58mm vs 48 cols for 80mm), and auto-cutter.
 */
export async function dispatchTestPrint(
  activeConfig: PrinterProfile
): Promise<PrintJobResult> {
  const is80mm = activeConfig.lineWidth >= 48;
  const testInvoice: InvoiceData = {
    shopName: 'Delivery Slip',
    date: '31/10/2026',
    time: '02:30 PM',
    invoiceNo: 'TEST-01',
    customerName: 'Thermal Diagnostics',
    items: [
      {
        sNo: '1',
        name: is80mm ? '80MM HIGH-DENSITY LINE' : '58MM STANDARD LINE',
        qty: '1',
        unit: 'PCS',
        price: '50.00',
        amt: '50.00',
      },
      {
        sNo: '2',
        name: 'FONT & CUTTER CHECK',
        qty: '2',
        unit: 'KG',
        price: '25.00',
        amt: '50.00',
      },
    ],
    totalQty: '3',
    subtotal: '100.00',
    totalDiscount: '0.00',
    finalAmount: '100.00',
    grandTotal: '100.00',
  };

  return dispatchPrintReceipt(activeConfig, testInvoice);
}

/**
 * Feeds empty paper lines through the thermal mechanism.
 */
export async function dispatchPaperFeed(lines = 3): Promise<PrintJobResult> {
  try {
    await BluetoothEscposPrinter.printText('\n'.repeat(lines), {});
    return {
      success: true,
      message: `Fed ${lines} lines of thermal paper.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Feed Failed: ${errorMsg}`,
    };
  }
}
