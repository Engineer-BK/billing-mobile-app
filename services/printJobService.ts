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

    // --- 3. Header Region: "Billing Receipt" (Centered, crisp 1x font) ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText('Billing Receipt\n', {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 0,  // Standard 1x width: prevents oversized horizontal stretching
      heigthtimes: 0, // Standard 1x height: crisp, clean, and proportional
      fonttype: 0,    // Standard Font A
    });
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 4. Metadata Block ---
    // Left: Invoice No (up) & Customer (below)
    // Right: Date (up) & Time (below)
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    if (is80mm) {
      // 80mm layout (48 Columns):
      // Line 1: Invoice No: 1                                Date: 30/10/2026
      // Line 2: Customer: Basir Khan                           Time: 04:30 PM
      const line1 = formatTwoColumns(
        `Invoice No: ${invoice.invoiceNo}`,
        `Date: ${liveDate}`,
        activeConfig.lineWidth
      );
      const line2 = formatTwoColumns(
        `Customer: ${customer}`,
        `Time: ${liveTime}`,
        activeConfig.lineWidth
      );
      await BluetoothEscposPrinter.printText(line1, {});
      await BluetoothEscposPrinter.printText(line2, {});
    } else {
      // 58mm layout (32 Columns):
      // Line 1: Inv No: 1               Date: 30/10/26
      // Line 2: Cust: Basir Khan        Time: 04:30 PM
      const shortYear = String(year).slice(-2);
      const shortDate = `${day}/${month}/${shortYear}`;
      const line1 = formatTwoColumns(
        `Inv No: ${invoice.invoiceNo}`,
        `Date: ${shortDate}`,
        activeConfig.lineWidth
      );
      const line2 = formatTwoColumns(
        `Cust: ${customer}`,
        `Time: ${liveTime}`,
        activeConfig.lineWidth
      );
      await BluetoothEscposPrinter.printText(line1, {});
      await BluetoothEscposPrinter.printText(line2, {});
    }
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 5. Table Header (#, Item Description, Qty/Unit, Price, Amount) ---
    await BluetoothEscposPrinter.printColumn(
      activeConfig.gridMetrics,
      activeConfig.gridPositions,
      activeConfig.headerColumns,
      {}
    );
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 6. Items List Loop (Includes Unit e.g. "2 KG") ---
    for (const record of invoice.items) {
      const unitText = record.unit ? ` ${record.unit}` : '';
      const qtyWithUnit = `${record.qty}${unitText}`.trim();

      await BluetoothEscposPrinter.printColumn(
        activeConfig.gridMetrics,
        activeConfig.gridPositions,
        [
          record.sNo,
          record.name.substring(0, activeConfig.nameCharLimit),
          qtyWithUnit,
          record.price,
          record.amt,
        ],
        {}
      );
    }
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- 7. Summary Totals (Total Items/Qty, Subtotal, Total Discount, Final Amount) ---
    const subtotalValue = invoice.subtotal || invoice.grandTotal;
    const discountValue = invoice.totalDiscount || (invoice.discountAmount ? invoice.discountAmount : '0.00');
    const finalAmountValue = invoice.finalAmount || invoice.grandTotal;

    // Line A: Total Items/Qty
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Total Items/Qty:', invoice.totalQty],
      {}
    );

    // Line B: Subtotal
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Subtotal:', subtotalValue],
      {}
    );

    // Line C: Total Discount
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Total Discount:', `-${discountValue}`],
      {}
    );

    // Line D: Final Amount
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Final Amount:', finalAmountValue],
      {}
    );

    // Closing divider line
    await BluetoothEscposPrinter.printText(dividerLine, {});

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
      message: `Billing Receipt dispatched to ${activeConfig.displayName} at ${liveTime} successfully.${
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
    shopName: 'Billing Receipt',
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
