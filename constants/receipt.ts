/**
 * constants/receipt.ts
 * 
 * Default invoice payload and mock data used for previews and testing.
 */

import { InvoiceData } from '../types/billing';

export const SAMPLE_INVOICE: InvoiceData = {
  shopName: 'Billing Receipt',
  date: '30/10/2026',
  time: '04:30 PM',
  invoiceNo: '1',
  customerName: 'Basir Ahmed Khan',
  items: [
    { sNo: '1', name: 'CHANACHUR', qty: '2', unit: 'KG', price: '90', discountPercent: '0', discountAmount: '0', amt: '180' },
    { sNo: '2', name: 'S N T RICE', qty: '2', unit: 'KG', price: '40', discountPercent: '0', discountAmount: '0', amt: '80' },
    { sNo: '3', name: 'SUN R MIRC', qty: '0.4', unit: 'KG', price: '490', discountPercent: '0', discountAmount: '0', amt: '196' },
    { sNo: '4', name: 'POTATO F', qty: '50', unit: 'KG', price: '17', discountPercent: '0', discountAmount: '0', amt: '850' },
    { sNo: '5', name: 'BHUJIA-700', qty: '4', unit: 'PKT', price: '65', discountPercent: '0', discountAmount: '0', amt: '260' },
    { sNo: '6', name: 'SUJI', qty: '1', unit: 'KG', price: '45', discountPercent: '0', discountAmount: '0', amt: '45' },
    { sNo: '7', name: 'LONG-', qty: '0.05', unit: 'KG', price: '1500', discountPercent: '0', discountAmount: '0', amt: '75' },
    { sNo: '8', name: 'MAIDA', qty: '1', unit: 'BAG', price: '1880', discountPercent: '0', discountAmount: '0', amt: '1880' },
    { sNo: '9', name: 'PLAM OIL 1', qty: '1', unit: 'TIN', price: '2190', discountPercent: '0', discountAmount: '0', amt: '2190' },
    { sNo: '10', name: 'ONION', qty: '1', unit: 'KG', price: '55', discountPercent: '0', discountAmount: '0', amt: '55' },
    { sNo: '11', name: 'L C', qty: '1', unit: 'PCS', price: '15', discountPercent: '0', discountAmount: '0', amt: '15' },
  ],
  totalQty: '63.45',
  subtotal: '5826',
  totalDiscount: '0.00',
  finalAmount: '5826',
  grandTotal: '5826',
};
