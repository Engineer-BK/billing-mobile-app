/**
 * types/item.ts
 * 
 * TypeScript definitions for FlashBill Catalog Preset Items.
 * Supports:
 * - Basic product details (Name, Unit Rate, Unit, Default Discount %, Category)
 * - Historical Price Trend Tracking (Previous Price, Changed Timestamp, Delta %)
 * - Barcode / SKU metadata
 */

export interface PresetItem {
  id: string;               // Unique ID (UUID or Firestore document ID)
  name: string;             // Item name e.g. "Basmati Rice"
  price: string;            // Current selling rate (Sale Price) e.g. "38.00"
  purchasePrice?: string;   // Cost / acquisition rate (Purchase Price) e.g. "32.00"
  stockQuantity?: number;   // Current inventory quantity (In Stock) e.g. 50, -2, 0
  previousPrice?: string;   // Historical rate before last update e.g. "35.00"
  priceChangedAt?: number;  // Epoch timestamp when price was last updated
  unit: string;             // Measurement unit e.g. "KG", "PCS", "L", "PKT"
  defaultDiscount?: string; // Default percentage discount e.g. "3"
  category?: string;        // Category e.g. "Rice & Grains", "Oil & Ghee"
  barcode?: string;         // Optional barcode / SKU code
  updatedAt: number;        // Epoch timestamp for sync ordering
}

export type ItemFilterType = 'ALL' | 'PRICE_UP' | 'PRICE_DOWN' | 'DISCOUNT' | 'LOW_STOCK' | string;

