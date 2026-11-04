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
    badge: '2-Inch • 42 Col • Font B',
    paperWidth: '58mm Roll',
    lineWidth: 42,
    nameCharLimit: 14,
    hasAutoCutter: false,
    // 5-Column layout: # (3) + Name (14) + Gap (2) + Qty (7) + Gap (2) + Price (6) + Gap (2) + Amount (6) = 42
    gridMetrics: [3, 14, 8, 8, 9],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Name', 'Qty', 'Price', 'Amount'],
    // Summary row: Label (26) + Value (16) = 42
    totalMetrics: [26, 16],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    // Clean margin without paper waste
    feedLines: {
      topSpace: 10,    // 0 lines at top: starts at top edge without paper waste
      bottomSpace: 10, // 4 lines at bottom: clears manual tear bar
    },
  },
  EZO80: {
    id: 'EZO80',
    displayName: '80mm Thermal (3-Inch)',
    badge: '3-Inch • 48 Col • Auto-Cut',
    paperWidth: '80mm Roll',
    lineWidth: 48,
    nameCharLimit: 18,
    hasAutoCutter: true,
    // 5-Column layout: # (3) + Name (18) + Gap (2) + Qty (7) + Gap (2) + Price (7) + Gap (2) + Amount (7) = 48
    gridMetrics: [3, 18, 9, 9, 9],
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
    // Clean margin without paper waste
    feedLines: {
      topSpace: 4,    // 0 lines at top: starts at top edge without paper waste
      bottomSpace: 10, // 4 lines at bottom: clears motorized auto-cutter blade
    },
  },
};
