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

/**
 * Rounds monetary amounts (prices, subtotals, discounts) to clean integers.
 * Frees up horizontal space, prevents number clipping, and matches retail POS style.
 */
export function roundMoney(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '0';
  return String(Math.round(num));
}

/**
 * Padded cell helper: guarantees exact width with alignment.
 */
export function padCell(text: string, width: number, align: 'left' | 'right'): string {
  const str = text || '';
  if (str.length >= width) {
    return str.substring(0, width);
  }
  const pad = ' '.repeat(width - str.length);
  return align === 'right' ? pad + str : str + pad;
}

export interface ReceiptRowParams {
  sNo: string;
  name: string;
  qty: string;
  price: string;
  amount: string;
  is80mm: boolean;
  isHeader?: boolean;
}

/**
 * Builds a single 5-column receipt line with hardcoded, guaranteed empty spacer gaps
 * between EVERY column:
 * 58mm: [# (3)] + [Name (14)] + [GAP 1 (2)] + [Qty (7)] + [GAP 2 (2)] + [Price (6)] + [GAP 3 (2)] + [Amount (6)] = 42 cols
 * 80mm: [# (3)] + [Name (20)] + [GAP 1 (2)] + [Qty (8)] + [GAP 2 (3)] + [Price (8)] + [GAP 3 (3)] + [Amount (9)] = 56 cols
 */
export function formatReceiptRow(params: ReceiptRowParams): string {
  const { sNo, name, qty, price, amount, is80mm } = params;

  if (is80mm) {
    // 80mm Layout (56 Columns total)
    const sNoCol = padCell(sNo, 3, 'left');
    const nameCol = padCell(name, 20, 'left');
    const gap1 = '  '; // 2 spaces
    const qtyCol = padCell(qty, 8, 'right');
    const gap2 = '   '; // 3 spaces
    const priceCol = padCell(price, 8, 'right');
    const gap3 = '   '; // 3 spaces
    const amtCol = padCell(amount, 9, 'right');
    return `${sNoCol}${nameCol}${gap1}${qtyCol}${gap2}${priceCol}${gap3}${amtCol}\n`;
  } else {
    // 58mm Layout (42 Columns total)
    const sNoCol = padCell(sNo, 3, 'left');
    const nameCol = padCell(name, 14, 'left');
    const gap1 = '  '; // 2 spaces
    const qtyCol = padCell(qty, 7, 'right');
    const gap2 = '  '; // 2 spaces
    const priceCol = padCell(price, 6, 'right');
    const gap3 = '  '; // 2 spaces
    const amtCol = padCell(amount, 6, 'right');
    return `${sNoCol}${nameCol}${gap1}${qtyCol}${gap2}${priceCol}${gap3}${amtCol}\n`;
  }
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

    // Guaranteed suitable vertical line spacing: 32 dots (~4mm) prevents lines from touching
    try {
      await BluetoothEscposPrinter.printerLineSpace(32);
    } catch {
      // Safe fallback if printer does not support variable line spacing
    }

    // Top paper feed: Set to 0 to prevent 2.5-inch wasted paper
    if (activeConfig.feedLines.topSpace > 0) {
      await BluetoothEscposPrinter.printText('\n'.repeat(activeConfig.feedLines.topSpace), {});
    }

    // --- 3. Header Region: "Delivery Slip" (Centered, Font B condensed small font) ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText('Delivery Slip\n', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,
      heigthtimes: 0,
      fonttype: 1, // Font B condensed small font
    });
    await BluetoothEscposPrinter.printText(dividerLine, { fonttype: 1 });

    // --- 4. Metadata Block ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    if (is80mm) {
      // 80mm layout (56 Columns)
      const line1 = formatTwoColumns(
        `Invoice No: ${invoice.invoiceNo}`,
        `Date: ${liveDate}`,
        56
      );
      const line2 = formatTwoColumns(
        `Customer: ${customer}`,
        `Time: ${liveTime}`,
        56
      );
      await BluetoothEscposPrinter.printText(line1, { fonttype: 1 });
      await BluetoothEscposPrinter.printText(line2, { fonttype: 1 });
    } else {
      // 58mm layout (42 Columns)
      const shortYear = String(year).slice(-2);
      const shortDate = `${day}/${month}/${shortYear}`;
      const line1 = formatTwoColumns(
        `Inv No: ${invoice.invoiceNo}`,
        `Date: ${shortDate}`,
        42
      );
      await BluetoothEscposPrinter.printText(line1, { fonttype: 1 });

      if (customer.length > 18) {
        await BluetoothEscposPrinter.printText(`Cust: ${customer}\n`, { fonttype: 1 });
        await BluetoothEscposPrinter.printText(`Time: ${liveTime}\n`, { fonttype: 1 });
      } else {
        const line2 = formatTwoColumns(
          `Cust: ${customer}`,
          `Time: ${liveTime}`,
          42
        );
        await BluetoothEscposPrinter.printText(line2, { fonttype: 1 });
      }
    }
    await BluetoothEscposPrinter.printText(dividerLine, { fonttype: 1 });

    // --- 5. Table Header (#, Name, Qty, Price, Amount) with Guaranteed Spacers ---
    const tableHeader = formatReceiptRow({
      sNo: '#',
      name: 'Name',
      qty: 'Qty',
      price: 'Price',
      amount: 'Amount',
      is80mm,
      isHeader: true,
    });
    await BluetoothEscposPrinter.printText(tableHeader, { fonttype: 1 });
    await BluetoothEscposPrinter.printText(dividerLine, { fonttype: 1 });

    // --- 6. Items List Loop (Alphabetical A-Z, Multi-Line Word Wrap & Per-Item Dashed Divider) ---
    const sortedItems = [...invoice.items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    const nameColWidth = is80mm ? 20 : 14;

    for (let i = 0; i < sortedItems.length; i++) {
      const record = sortedItems[i];
      const sNo = String(i + 1);
      const formattedQty = String(record.qty).trim();
      const unitText = record.unit ? ` ${record.unit.trim()}` : '';
      const qtyWithUnit = `${formattedQty}${unitText}`.trim();

      // Clean whole-number representation to fit columns neatly & free up space
      const cleanPrice = roundMoney(record.price);
      const q = parseFloat(record.qty) || 0;
      const p = parseFloat(record.price) || 0;
      const grossAmt = roundMoney(q * p);

      // Word-wrap item name without breaking words mid-character
      const nameLines = wrapTextToWords(record.name, nameColWidth);

      // Line 1: SNo + First line of Name + Qty + Price + Amount
      const firstRow = formatReceiptRow({
        sNo,
        name: nameLines[0] || '',
        qty: qtyWithUnit,
        price: cleanPrice,
        amount: grossAmt,
        is80mm,
      });
      await BluetoothEscposPrinter.printText(firstRow, { fonttype: 1 });

      // Continuation lines for Name (indented by 3 spaces directly under Name column)
      for (let k = 1; k < nameLines.length; k++) {
        const continuationRow = '   ' + nameLines[k] + '\n';
        await BluetoothEscposPrinter.printText(continuationRow, { fonttype: 1 });
      }

      // Client receipt style discount breakdown (matching client's Item #6)
      const discPct = parseFloat(record.discountPercent || '0') || 0;
      const discAmt = parseFloat(record.discountAmount || '0') || 0;
      if (discPct > 0 || discAmt > 0) {
        const grossVal = Math.round(q * p);
        const calcPct = discPct > 0 ? discPct : (grossVal > 0 ? Math.round((discAmt / (q * p)) * 100) : 0);
        const calcAmt = discAmt > 0 ? discAmt : ((q * p) * (discPct / 100));
        const roundedDiscAmt = Math.round(calcAmt);
        const finalItemAmt = Math.round(grossVal - roundedDiscAmt);

        const pctLabel = `     Disc.(${calcPct}%)`;
        const discValStr = `-${roundedDiscAmt}`;
        const finalAmtStr = `${finalItemAmt}`;

        if (is80mm) {
          const discLine = formatTwoColumns(
            padCell(pctLabel, 30, 'left') + ':',
            discValStr,
            56
          );
          const finalLine = formatTwoColumns(
            padCell('     Final Amount', 30, 'left') + ':',
            finalAmtStr,
            56
          );
          await BluetoothEscposPrinter.printText(discLine, { fonttype: 1 });
          await BluetoothEscposPrinter.printText(finalLine, { fonttype: 1 });
        } else {
          const discLine = formatTwoColumns(
            padCell(pctLabel, 24, 'left') + ':',
            discValStr,
            42
          );
          const finalLine = formatTwoColumns(
            padCell('     Final Amount', 24, 'left') + ':',
            finalAmtStr,
            42
          );
          await BluetoothEscposPrinter.printText(discLine, { fonttype: 1 });
          await BluetoothEscposPrinter.printText(finalLine, { fonttype: 1 });
        }
      }

      // Separator dashed line between each item (as requested by user)
      await BluetoothEscposPrinter.printText(dividerLine, { fonttype: 1 });
    }

    // --- 7. Summary Totals (Clean integer rounding) ---
    const subtotalValue = roundMoney(invoice.subtotal || invoice.grandTotal);
    const rawDisc = invoice.totalDiscount || invoice.discountAmount;
    const discountNum = parseFloat(String(rawDisc || '0').replace(/[^0-9.-]/g, '')) || 0;
    const discountValue = Math.round(Math.abs(discountNum));
    const finalAmountValue = roundMoney(invoice.finalAmount || invoice.grandTotal);

    // Exact quantity (fractional allowed, e.g. 0.5 ml)
    const lineQty = formatTwoColumns('Total Items/Qty:', String(invoice.totalQty), activeConfig.lineWidth);
    const lineSub = formatTwoColumns('Subtotal:', subtotalValue, activeConfig.lineWidth);
    const lineDisc = formatTwoColumns('Total Discount:', discountValue > 0 ? `-${discountValue}` : '0', activeConfig.lineWidth);
    const lineFinal = formatTwoColumns('Final Amount:', finalAmountValue, activeConfig.lineWidth);

    await BluetoothEscposPrinter.printText(lineQty, { fonttype: 1 });
    await BluetoothEscposPrinter.printText(lineSub, { fonttype: 1 });
    await BluetoothEscposPrinter.printText(lineDisc, { fonttype: 1 });
    await BluetoothEscposPrinter.printText(lineFinal, { fonttype: 1 });
    await BluetoothEscposPrinter.printText(dividerLine, { fonttype: 1 });

    // Centered Festive / Custom Footer Greeting (if configured)
    const customFooter = await storageService.loadReceiptFooter();
    if (customFooter.trim().length > 0) {
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printText(`${customFooter.trim()}\n`, { fonttype: 1 });
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
