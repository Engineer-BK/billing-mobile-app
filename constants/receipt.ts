/**
 * constants/receipt.ts
 * 
 * Default invoice payload and mock data used for previews and testing.
 */

import { InvoiceData } from '../types/billing';

export const SAMPLE_INVOICE: InvoiceData = {
  shopName: 'Aftab Rental',
  date: '26/10/2026',
  invoiceNo: '38',
  customerName: 'Aftab Retail Customer',
  items: [
    { sNo: '1', name: 'CHANACHUR', qty: '2', price: '90', amt: '180' },
    { sNo: '2', name: 'S N T RICE', qty: '2', price: '40', amt: '80' },
    { sNo: '3', name: 'SUN R MIRC', qty: '0.4', price: '490', amt: '196' },
    { sNo: '4', name: 'POTATO F', qty: '50', price: '17', amt: '850' },
    { sNo: '5', name: 'BHUJIA-700', qty: '4', price: '65', amt: '260' },
    { sNo: '6', name: 'SUJI', qty: '1', price: '45', amt: '45' },
    { sNo: '7', name: 'LONG-', qty: '0.05', price: '1500', amt: '75' },
    { sNo: '8', name: 'MAIDA', qty: '1', price: '1880', amt: '1880' },
    { sNo: '9', name: 'PLAM OIL 1', qty: '1', price: '2190', amt: '2190' },
    { sNo: '10', name: 'ONION', qty: '1', price: '55', amt: '55' },
    { sNo: '11', name: 'L C', qty: '1', price: '15', amt: '15' },
  ],
  totalQty: '63.45',
  grandTotal: '5826',
};
