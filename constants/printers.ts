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
    displayName: '58mm Thermal (2-Inch)',
    badge: '2-Inch • 32 Col',
    paperWidth: '58mm Roll',
    lineWidth: 32,
    nameCharLimit: 11,
    hasAutoCutter: false,
    // 5-Column layout: # (3) + Name (11) + Qty (6) + Price (6) + Amount (6) = 32
    gridMetrics: [3, 11, 6, 6, 6],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Name', 'Qty', 'Price', 'Amount'],
    // Summary row: Label (18) + Value (14) = 32
    totalMetrics: [18, 14],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    // 1.5 Inch paper feed spacing (~38mm / 304 dots)
    feedLines: {
      topSpace: 10,    // 10 lines at top: 1.5-inch clean blank margin
      bottomSpace: 12, // 12 lines at bottom: 1.5-inch margin clearing manual tear bar
    },
  },
  EZO80: {
    id: 'EZO80',
    displayName: '80mm Thermal (3-Inch)',
    badge: '3-Inch • 48 Col • Auto-Cut',
    paperWidth: '80mm Roll',
    lineWidth: 48,
    nameCharLimit: 21,
    hasAutoCutter: true,
    // 5-Column layout: # (3) + Name (21) + Qty (8) + Price (8) + Amount (8) = 48
    gridMetrics: [3, 21, 8, 8, 8],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Name', 'Qty', 'Price', 'Amount'],
    // Summary row: Label (30) + Value (18) = 48
    totalMetrics: [30, 18],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    // 1.5 Inch paper feed spacing (~38mm / 304 dots)
    feedLines: {
      topSpace: 10,    // 10 lines at top: 1.5-inch clean blank margin
      bottomSpace: 14, // 14 lines at bottom: 1.5-inch margin clearing motorized auto-cutter blade
    },
  },
};
