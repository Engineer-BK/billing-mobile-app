/**
 * constants/printers.ts
 * 
 * Hardware profile specifications for supported thermal POS printers.
 * - SC588: 58mm (2-Inch) mobile Bluetooth printer (32 columns, manual tear)
 * - EZO 80UB: 80mm (3-Inch) desktop thermal printer (48 columns, auto-cutter)
 */

import { BluetoothEscposPrinter } from '../services/bluetoothPrinter';
import { PrinterProfileId, PrinterProfile } from '../types/printer';

export const PRINTER_PROFILES: Record<PrinterProfileId, PrinterProfile> = {
  SC588: {
    id: 'SC588',
    displayName: 'SC588 (58mm)',
    badge: '2-Inch • 32 Col',
    paperWidth: '58mm Roll',
    lineWidth: 32,
    nameCharLimit: 11,
    hasAutoCutter: false,
    // Column layout: # (3) + Name (11) + Qty (5) + Price (6) + Amount (7) = 32
    gridMetrics: [3, 11, 5, 6, 7],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Name', 'Qty', 'Pri', 'Amt'],
    // Summary row: Label (20) + Value (12) = 32
    totalMetrics: [20, 12],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    // 5 blank lines: feeds bill past physical manual tear teeth
    feedLines: '\n\n\n\n\n',
  },
  EZO80: {
    id: 'EZO80',
    displayName: 'EZO 80UB (80mm)',
    badge: '3-Inch • 48 Col • Auto-Cut',
    paperWidth: '80mm Roll',
    lineWidth: 48,
    nameCharLimit: 20,
    hasAutoCutter: true,
    // Column layout: # (4) + Item Description (20) + Qty (6) + Price (8) + Amount (10) = 48
    gridMetrics: [4, 20, 6, 8, 10],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Item Description', 'Qty', 'Price', 'Amount'],
    // Summary row: Label (30) + Value (18) = 48
    totalMetrics: [30, 18],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    // 8 blank lines (~28mm): feeds paper so bottom margin matches the physical 28mm top margin
    feedLines: '\n\n\n\n\n\n\n\n',
  },
};
