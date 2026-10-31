/**
 * types/billing.ts
 * 
 * Business-level TypeScript definitions for Billing, Invoices, Cart Items, and Units.
 */

export interface InvoiceItem {
  /** Serial number in invoice (e.g. "1", "2") */
  sNo: string;
  /** Product name (e.g. "Basmati Rice") */
  name: string;
  /** Quantity sold, decimal or integer (e.g. "2", "0.5") */
  qty: string;
  /** Measurement unit (e.g. "KG", "PCS", "DOZEN", "L", "PKT") */
  unit: string;
  /** Unit price / rate in currency (e.g. "90") */
  price: string;
  /** Optional discount percentage (e.g. "10" for 10%) */
  discountPercent?: string;
  /** Optional discount deduction amount (e.g. "18.00") */
  discountAmount?: string;
  /** Final line amount after discount (qty * price - discount) (e.g. "162.00") */
  amt: string;
}

export interface InvoiceData {
  /** Shop or Header title (default: "Billing Receipt") */
  shopName: string;
  /** Real-time date string (e.g. "30/10/2026") */
  date: string;
  /** Real-time timestamp string (e.g. "04:30 PM") */
  time?: string;
  /** Invoice or receipt number (e.g. "1", "INV-1") */
  invoiceNo: string;
  /** Customer name */
  customerName?: string;
  /** Customer phone number */
  customerPhone?: string;
  /** Array of purchased items with units & discounts */
  items: InvoiceItem[];
  /** Total quantity string across items */
  totalQty: string;
  /** Gross subtotal before discounts */
  subtotal?: string;
  /** Total discount amount saved across all items */
  totalDiscount?: string;
  /** Backward-compatible discount amount */
  discountAmount?: string;
  /** Backward-compatible discount percentage */
  discountPercent?: string;
  /** Final payable amount after all discounts */
  finalAmount?: string;
  /** Alias for backward compatibility */
  grandTotal: string;
  /** Payment status of the invoice: 'PAID' (default) or 'UNPAID' */
  status?: 'PAID' | 'UNPAID';
}
