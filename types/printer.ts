/**
 * types/printer.ts
 * 
 * Hardware-level TypeScript type definitions for Thermal POS Printers.
 * Defines profile structures, column metrics, and Bluetooth device representations.
 */

export type PrinterProfileId = 'SC588' | 'EZO80';

export interface PrinterProfile {
  /** Unique profile identifier */
  id: PrinterProfileId;
  /** Human-readable display name (e.g. "SC588 (58mm)") */
  displayName: string;
  /** UI badge text (e.g. "2-Inch • 32 Col") */
  badge: string;
  /** Roll width label (e.g. "58mm Roll") */
  paperWidth: string;
  /** Maximum single-line character count (32 for 58mm, 48 for 80mm) */
  lineWidth: number;
  /** Character limit for item name before wrapping or truncating */
  nameCharLimit: number;
  /** Whether the hardware possesses a motorized guillotine auto-cutter */
  hasAutoCutter: boolean;
  /**
   * ESC/POS Column width distribution.
   * Sum of array values must equal lineWidth (32 or 48).
   * Example: [4, 20, 6, 8, 10] = 48
   */
  gridMetrics: number[];
  /** ESC/POS Column text alignments (0 = LEFT, 1 = CENTER, 2 = RIGHT) */
  gridPositions: number[];
  /** Table header column titles */
  headerColumns: string[];
  /** Summary row column width distribution (Label + Value) */
  totalMetrics: number[];
  /** Summary row alignments */
  totalPositions: number[];
  /**
   * Blank newlines to feed paper past the printer exit slot.
   * Calibrated so the receipt clears the blade before cutting.
   */
  feedLines: string;
}
