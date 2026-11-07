/**
 * types/customer.ts
 * 
 * TypeScript definitions for Store Customers in CounterPress POS.
 */

export interface SavedCustomer {
  id: string;
  name: string;
  phone?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerSuggestionItem {
  id?: string;
  name: string;
  phone?: string;
  isPreset?: boolean;
  canDelete: boolean;
}

