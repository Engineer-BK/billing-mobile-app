/**
 * types/billing.ts
 * 
 * Business-level TypeScript definitions for Billing, Invoices, and Cart Items.
 */

export interface InvoiceItem {
  /** Serial number in invoice (e.g. "1", "2") */
  sNo: string;
  /** Product name (e.g. "Basmati Rice") */
  name: string;
  /** Quantity sold, can be decimal or integer (e.g. "2", "0.5") */
  qty: string;
  /** Unit price in currency (e.g. "90") */
  price: string;
  /** Line amount (qty * price) (e.g. "180") */
  amt: string;
}

export interface InvoiceData {
  /** Shop or Business Name header */
  shopName: string;
  /** Formatted date string (e.g. "29/10/2026") */
  date: string;
  /** Invoice or receipt number (e.g. "38", "1001") */
  invoiceNo: string;
  /** Array of purchased items */
  items: InvoiceItem[];
  /** Total quantity count across all items */
  totalQty: string;
  /** Grand total payable amount after discounts */
  grandTotal: string;
  /** Optional customer name */
  customerName?: string;
  /** Optional discount percentage applied (e.g. "5%") */
  discountPercent?: string;
  /** Optional discount deduction amount (e.g. "50") */
  discountAmount?: string;
}
