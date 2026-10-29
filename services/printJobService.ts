/**
 * services/printJobService.ts
 * 
 * Hardware ESC/POS Print Stream Dispatcher.
 * Converts invoice data into ESC/POS thermal control codes and transmits them
 * over Bluetooth RFCOMM to the target printer (58mm or 80mm).
 */

import { BluetoothEscposPrinter } from './bluetoothPrinter';
import { PrinterProfile } from '../types/printer';
import { InvoiceData } from '../types/billing';

export interface PrintJobResult {
  success: boolean;
  message?: string;
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
    // Single-line divider dash string matching the hardware column width (32 or 48)
    const dividerLine = `${'-'.repeat(activeConfig.lineWidth)}\n`;

    // 1. Hardware Initialization: ESC @ resets buffer, clears line spacing & cancels error states
    await BluetoothEscposPrinter.printerInit();
    // 2. Set left margin to 0 for maximum printable width
    await BluetoothEscposPrinter.printerLeftSpace(0);

    // --- Header Region ---
    // Align center for bold shop banner
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText(`${invoice.shopName}\n`, {
      encoding: 'GBK',
      codepage: 0,
      widthtimes: 1,  // 2x character width
      heigthtimes: 1, // 2x character height
      fonttype: 0,    // Standard Font A (12x24)
    });
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- Metadata Block (Left Aligned) ---
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Date: ${invoice.date}\n`, {});
    await BluetoothEscposPrinter.printText(`Invoice No: ${invoice.invoiceNo}\n`, {});
    if (invoice.customerName) {
      await BluetoothEscposPrinter.printText(`Customer: ${invoice.customerName}\n`, {});
    }
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- Table Header ---
    // Prints proportional table headers according to gridMetrics
    await BluetoothEscposPrinter.printColumn(
      activeConfig.gridMetrics,
      activeConfig.gridPositions,
      activeConfig.headerColumns,
      {}
    );
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- Items List Loop ---
    for (const record of invoice.items) {
      await BluetoothEscposPrinter.printColumn(
        activeConfig.gridMetrics,
        activeConfig.gridPositions,
        [
          record.sNo,
          record.name.substring(0, activeConfig.nameCharLimit),
          record.qty,
          record.price,
          record.amt,
        ],
        {}
      );
    }
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- Summary Totals ---
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Total Items/Qty:', invoice.totalQty],
      {}
    );

    if (invoice.discountAmount && Number(invoice.discountAmount) > 0) {
      await BluetoothEscposPrinter.printColumn(
        activeConfig.totalMetrics,
        activeConfig.totalPositions,
        [`Discount (${invoice.discountPercent || ''}):`, `-${invoice.discountAmount}`],
        {}
      );
    }

    // Standard font for Grand Total (avoid fonttype: 1 which triggers tiny Font B)
    await BluetoothEscposPrinter.printColumn(
      activeConfig.totalMetrics,
      activeConfig.totalPositions,
      ['Total Amount:', invoice.grandTotal],
      {}
    );

    // Closing divider line
    await BluetoothEscposPrinter.printText(dividerLine, {});

    // --- Paper Feed & Auto-Cut ---
    // Feeds paper ~28mm so the entire receipt exits past the cutter blade
    await BluetoothEscposPrinter.printText(activeConfig.feedLines, {});

    if (activeConfig.hasAutoCutter) {
      // ESC/POS Command: GS V 0 (0x1D 0x56 0x00) = Motorized Full Cut
      await BluetoothEscposPrinter.printText('\x1D\x56\x00', {});
    }

    return {
      success: true,
      message: `Receipt dispatched to ${activeConfig.displayName} successfully.${
        activeConfig.hasAutoCutter ? '\n✂️ Auto-cutter blade triggered.' : ''
      }`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: errorMsg,
    };
  }
}
