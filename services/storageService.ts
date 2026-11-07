/**
 * services/storageService.ts
 * 
 * Centralized Offline Persistence Service for FlashBill POS.
 * Backed by @react-native-async-storage/async-storage.
 * 
 * Features:
 * - Persistent Invoices store: create, delete, update status (PAID/UNPAID)
 * - Auto-incrementing Invoice Number counter across restarts
 * - Paired Printer & Auto-reconnect metadata (MAC address, device name, roll profile)
 * - Active Printer Profile (80mm vs 58mm)
 * - App Theme (Light/Dark) preference
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { InvoiceData, InvoiceItem } from '../types/billing';
import { PrinterProfileId } from '../types/printer';
import { UserProfile } from '../types/auth';
import { LicenseVerificationResult } from '../types/license';
import { DEMO_GUEST_INVOICES } from '../constants/receipt';
import { PresetItem } from '../types/item';
import { DEFAULT_PRESET_ITEMS } from '../constants/presetItems';
import { SavedCustomer } from '../types/customer';
import { formatCustomerName } from '../utils/formatters';

const STORAGE_KEYS = {
  INVOICES: '@flashbill:invoices_v1',
  GUEST_INVOICES: '@flashbill:guest_demo_invoices_v1',
  PRESET_ITEMS: '@flashbill:preset_items_v1',
  GUEST_PRESET_ITEMS: '@flashbill:guest_preset_items_v1',
  NEXT_INVOICE_NUM: '@flashbill:next_invoice_num_v1',
  SAVED_PRINTER: '@flashbill:saved_printer_v1',
  ACTIVE_PROFILE: '@flashbill:active_profile_v1',
  THEME_MODE: '@flashbill:theme_mode_v1',
  USER_SESSION: '@flashbill:user_session_v1',
  STORE_LICENSE: '@flashbill:store_license_v1',
  SALE_DRAFT: '@flashbill:sale_draft_v1',
  RECEIPT_FOOTER: '@flashbill:receipt_footer_v1',
  SAVED_CUSTOMERS: '@flashbill:saved_customers_v1',
  DELETED_CUSTOMERS: '@flashbill:deleted_customers_v1',
} as const;

export interface SaleDraft {
  customerName: string;
  phoneNumber: string;
  items: InvoiceItem[];
}

export interface SavedPrinterInfo {
  address: string;
  name: string;
  profileId: PrinterProfileId;
  lastConnectedAt?: string;
}

// ==========================================
// 7. RECEIPT GREETINGS & FOOTER NOTE
// ==========================================

type FooterChangeListener = (footer: string) => void;
const footerListeners = new Set<FooterChangeListener>();

export const storageService = {
  // ==========================================
  // 1. INVOICE PERSISTENCE
  // ==========================================

  /**
   * Load all saved invoices from local storage.
   * Returns null if no storage record exists yet (allowing caller to seed defaults).
   */
  async loadInvoices(): Promise<InvoiceData[] | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.INVOICES);
      if (!json) return null;
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        return parsed as InvoiceData[];
      }
      return null;
    } catch (err) {
      console.warn('storageService.loadInvoices error:', err);
      return null;
    }
  },

  /**
   * Save complete list of invoices to local storage.
   */
  async saveInvoices(invoices: InvoiceData[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      return true;
    } catch (err) {
      console.warn('storageService.saveInvoices error:', err);
      return false;
    }
  },

  /**
   * Clear all saved invoices from local storage.
   */
  async clearInvoices(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.INVOICES);
      return true;
    } catch (err) {
      console.warn('storageService.clearInvoices error:', err);
      return false;
    }
  },

  // ==========================================
  // 1B. GUEST / DEMO SANDBOX INVOICES (Module 1.2)
  // ==========================================

  /**
   * Load guest demo invoices from isolated storage key.
   * Auto-seeds DEMO_GUEST_INVOICES on first guest session.
   */
  async loadGuestInvoices(): Promise<InvoiceData[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_INVOICES);
      if (!json) {
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_INVOICES, JSON.stringify(DEMO_GUEST_INVOICES));
        return DEMO_GUEST_INVOICES;
      }
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as InvoiceData[];
      }
      return DEMO_GUEST_INVOICES;
    } catch (err) {
      console.warn('storageService.loadGuestInvoices error:', err);
      return DEMO_GUEST_INVOICES;
    }
  },

  /**
   * Save guest demo invoices to isolated storage key.
   */
  async saveGuestInvoices(invoices: InvoiceData[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_INVOICES, JSON.stringify(invoices));
      return true;
    } catch (err) {
      console.warn('storageService.saveGuestInvoices error:', err);
      return false;
    }
  },

  /**
   * Clear guest demo invoices when exiting or resetting.
   */
  async clearGuestInvoices(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_INVOICES);
      return true;
    } catch (err) {
      console.warn('storageService.clearGuestInvoices error:', err);
      return false;
    }
  },

  // ==========================================
  // 2. SEQUENTIAL INVOICE NUMBER COUNTER
  // ==========================================

  /**
   * Load the next sequential invoice number.
   */
  async loadNextInvoiceNumber(): Promise<number | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.NEXT_INVOICE_NUM);
      if (!val) return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    } catch (err) {
      console.warn('storageService.loadNextInvoiceNumber error:', err);
      return null;
    }
  },

  /**
   * Save the next sequential invoice number.
   */
  async saveNextInvoiceNumber(nextNum: number): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NEXT_INVOICE_NUM, nextNum.toString());
      return true;
    } catch (err) {
      console.warn('storageService.saveNextInvoiceNumber error:', err);
      return false;
    }
  },

  /**
   * Reset the sequential invoice counter.
   */
  async clearNextInvoiceNumber(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NEXT_INVOICE_NUM);
      return true;
    } catch (err) {
      console.warn('storageService.clearNextInvoiceNumber error:', err);
      return false;
    }
  },

  // ==========================================
  // 3. THERMAL PRINTER HARDWARE CONFIG
  // ==========================================

  /**
   * Load the last paired/connected Bluetooth printer.
   */
  async loadSavedPrinter(): Promise<SavedPrinterInfo | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PRINTER);
      if (!json) return null;
      return JSON.parse(json) as SavedPrinterInfo;
    } catch (err) {
      console.warn('storageService.loadSavedPrinter error:', err);
      return null;
    }
  },

  /**
   * Save paired printer details for automatic reconnection on app launch.
   */
  async saveSavedPrinter(info: SavedPrinterInfo): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PRINTER, JSON.stringify(info));
      return true;
    } catch (err) {
      console.warn('storageService.saveSavedPrinter error:', err);
      return false;
    }
  },

  /**
   * Clear the saved printer when user explicitly disconnects/unlinks.
   */
  async clearSavedPrinter(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_PRINTER);
      return true;
    } catch (err) {
      console.warn('storageService.clearSavedPrinter error:', err);
      return false;
    }
  },

  /**
   * Load active roll profile (EZO80 vs SC588).
   */
  async loadActiveProfile(): Promise<PrinterProfileId | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
      if (val === 'EZO80' || val === 'SC588') {
        return val;
      }
      return null;
    } catch (err) {
      console.warn('storageService.loadActiveProfile error:', err);
      return null;
    }
  },

  /**
   * Save active roll profile.
   */
  async saveActiveProfile(profileId: PrinterProfileId): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
      return true;
    } catch (err) {
      console.warn('storageService.saveActiveProfile error:', err);
      return false;
    }
  },

  // ==========================================
  // 4. THEME MODE PREFERENCE
  // ==========================================

  /**
   * Load user's theme choice ('light' or 'dark').
   */
  async loadTheme(): Promise<'light' | 'dark' | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (val === 'light' || val === 'dark') {
        return val;
      }
      return null;
    } catch (err) {
      console.warn('storageService.loadTheme error:', err);
      return null;
    }
  },

  /**
   * Persist user's theme choice.
   */
  async saveTheme(mode: 'light' | 'dark'): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      return true;
    } catch (err) {
      console.warn('storageService.saveTheme error:', err);
      return false;
    }
  },

  // ==========================================
  // 5. USER AUTH SESSION PERSISTENCE
  // ==========================================

  /**
   * Load active user session from local storage.
   */
  async loadUserSession(): Promise<UserProfile | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (!json) return null;
      return JSON.parse(json) as UserProfile;
    } catch (err) {
      console.warn('storageService.loadUserSession error:', err);
      return null;
    }
  },

  /**
   * Save active user session on login or registration.
   */
  async saveUserSession(user: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
      return true;
    } catch (err) {
      console.warn('storageService.saveUserSession error:', err);
      return false;
    }
  },

  /**
   * Clear active user session on sign out.
   */
  async clearUserSession(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      return true;
    } catch (err) {
      console.warn('storageService.clearUserSession error:', err);
      return false;
    }
  },

  // ==========================================
  // 6. STORE LICENSING & ACTIVATION (Module 2)
  // ==========================================

  /**
   * Save store activation metadata to local offline cache.
   */
  async saveLocalLicense(license: LicenseVerificationResult): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STORE_LICENSE, JSON.stringify(license));
      return true;
    } catch (err) {
      console.warn('storageService.saveLocalLicense error:', err);
      return false;
    }
  },

  /**
   * Load store activation metadata from local offline cache.
   */
  async loadLocalLicense(): Promise<LicenseVerificationResult | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.STORE_LICENSE);
      if (!json) return null;
      return JSON.parse(json) as LicenseVerificationResult;
    } catch (err) {
      console.warn('storageService.loadLocalLicense error:', err);
      return null;
    }
  },

  /**
   * Clear local store license cache.
   */
  async clearLocalLicense(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.STORE_LICENSE);
      return true;
    } catch (err) {
      console.warn('storageService.clearLocalLicense error:', err);
      return false;
    }
  },

  // ==========================================
  // 7. MULTI-TENANT LOGOUT PURGE
  // ==========================================

  /**
   * Purge all user-specific data upon logout or account switch.
   * Clears: user session, invoices, invoice sequence counter, and cached store license.
   * Safely preserves device hardware settings (paired printer, roll profile, theme).
   */
  async purgeUserData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.INVOICES,
        STORAGE_KEYS.NEXT_INVOICE_NUM,
        STORAGE_KEYS.STORE_LICENSE,
        STORAGE_KEYS.SAVED_CUSTOMERS,
      ]);
      return true;
    } catch (err) {
      console.warn('storageService.purgeUserData error:', err);
      return false;
    }
  },
  // ==========================================
  // 8. SALE DRAFT PERSISTENCE
  // ==========================================

  /**
   * Load active unsaved sale draft from local cache.
   */
  async loadSaleDraft(): Promise<SaleDraft | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SALE_DRAFT);
      if (!json) return null;
      return JSON.parse(json) as SaleDraft;
    } catch (err) {
      console.warn('storageService.loadSaleDraft error:', err);
      return null;
    }
  },

  /**
   * Save active unsaved sale draft.
   */
  async saveSaleDraft(draft: SaleDraft): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SALE_DRAFT, JSON.stringify(draft));
      return true;
    } catch (err) {
      console.warn('storageService.saveSaleDraft error:', err);
      return false;
    }
  },

  /**
   * Clear active sale draft (on save or clear form).
   */
  async clearSaleDraft(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SALE_DRAFT);
      return true;
    } catch (err) {
      console.warn('storageService.clearSaleDraft error:', err);
      return false;
    }
  },

  // ==========================================
  // 6. CATALOG PRESET ITEMS PERSISTENCE
  // ==========================================

  /**
   * Load real store preset items from local storage.
   * If fresh (null), seeds with default preset items.
   */
  async loadPresetItems(): Promise<PresetItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.PRESET_ITEMS);
      if (!json) {
        // Seed default items for initial smooth experience
        await AsyncStorage.setItem(STORAGE_KEYS.PRESET_ITEMS, JSON.stringify(DEFAULT_PRESET_ITEMS));
        return DEFAULT_PRESET_ITEMS;
      }
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? (parsed as PresetItem[]) : DEFAULT_PRESET_ITEMS;
    } catch (err) {
      console.warn('storageService.loadPresetItems error:', err);
      return DEFAULT_PRESET_ITEMS;
    }
  },

  /**
   * Save complete list of preset items to local storage.
   */
  async savePresetItems(items: PresetItem[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRESET_ITEMS, JSON.stringify(items));
      return true;
    } catch (err) {
      console.warn('storageService.savePresetItems error:', err);
      return false;
    }
  },

  /**
   * Load guest demo preset items (isolated sandbox).
   */
  async loadGuestPresetItems(): Promise<PresetItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_PRESET_ITEMS);
      if (!json) {
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_PRESET_ITEMS, JSON.stringify(DEFAULT_PRESET_ITEMS));
        return DEFAULT_PRESET_ITEMS;
      }
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? (parsed as PresetItem[]) : DEFAULT_PRESET_ITEMS;
    } catch (err) {
      console.warn('storageService.loadGuestPresetItems error:', err);
      return DEFAULT_PRESET_ITEMS;
    }
  },

  /**
   * Save guest demo preset items to local storage.
   */
  async saveGuestPresetItems(items: PresetItem[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_PRESET_ITEMS, JSON.stringify(items));
      return true;
    } catch (err) {
      console.warn('storageService.saveGuestPresetItems error:', err);
      return false;
    }
  },

  // ==========================================
  // 7. RECEIPT GREETINGS & FOOTER NOTE
  // ==========================================

  /**
   * Subscribe to real-time updates when receipt footer greeting changes.
   */
  onFooterChange(listener: FooterChangeListener): () => void {
    footerListeners.add(listener);
    return () => footerListeners.delete(listener);
  },

  /**
   * Load saved receipt footer greeting note.
   * If never saved yet (null), returns default "Thank you! Visit again.".
   * If merchant intentionally cleared/removed it (empty string ""), returns "".
   */
  async loadReceiptFooter(): Promise<string> {
    try {
      const footer = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPT_FOOTER);
      if (footer === null) {
        return 'Thank you! Visit again.';
      }
      return footer;
    } catch (err) {
      console.warn('storageService.loadReceiptFooter error:', err);
      return 'Thank you! Visit again.';
    }
  },

  /**
   * Save custom receipt footer greeting note (with festive wish).
   */
  async saveReceiptFooter(footer: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPT_FOOTER, footer);
      // Immediately notify all mounted receipt previews across the app
      footerListeners.forEach((listener) => {
        try {
          listener(footer);
        } catch (e) {
          console.warn('footerListener error:', e);
        }
      });
      return true;
    } catch (err) {
      console.warn('storageService.saveReceiptFooter error:', err);
      return false;
    }
  },

  // ==========================================
  // 9. SAVED STORE CUSTOMERS PERSISTENCE
  // ==========================================

  /**
   * Load saved store customers from local offline cache.
   */
  async loadSavedCustomers(): Promise<SavedCustomer[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CUSTOMERS);
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? (parsed as SavedCustomer[]) : [];
    } catch (err) {
      console.warn('storageService.loadSavedCustomers error:', err);
      return [];
    }
  },

  /**
   * Load list of customer names that were explicitly deleted by the user.
   */
  async loadDeletedCustomerNames(): Promise<string[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_CUSTOMERS);
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch (err) {
      console.warn('storageService.loadDeletedCustomerNames error:', err);
      return [];
    }
  },

  /**
   * Save complete list of saved customers to local offline cache.
   */
  async saveSavedCustomers(customers: SavedCustomer[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CUSTOMERS, JSON.stringify(customers));
      return true;
    } catch (err) {
      console.warn('storageService.saveSavedCustomers error:', err);
      return false;
    }
  },

  /**
   * Save or update an individual customer record.
   * If customer exists by case-insensitive name match, updates phone & timestamp.
   * If new, adds to list. Also removes from deleted list if present.
   */
  async saveCustomer(name: string, phone?: string): Promise<SavedCustomer[]> {
    const formattedName = formatCustomerName(name);
    if (!formattedName || formattedName.toLowerCase() === 'cash' || formattedName.toLowerCase() === 'walk-in customer') {
      return this.loadSavedCustomers();
    }

    try {
      const current = await this.loadSavedCustomers();
      const deletedNames = await this.loadDeletedCustomerNames();

      // Remove from deleted list if previously deleted
      const updatedDeleted = deletedNames.filter(
        (n) => n.toLowerCase() !== formattedName.toLowerCase()
      );
      if (updatedDeleted.length !== deletedNames.length) {
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_CUSTOMERS, JSON.stringify(updatedDeleted));
      }

      const existingIndex = current.findIndex(
        (c) => c.name.toLowerCase() === formattedName.toLowerCase()
      );

      const now = Date.now();
      let updatedList: SavedCustomer[];

      if (existingIndex >= 0) {
        // Update existing customer
        const existing = current[existingIndex];
        const updatedCustomer: SavedCustomer = {
          ...existing,
          name: formattedName,
          phone: phone ? phone.trim() : existing.phone,
          updatedAt: now,
        };
        updatedList = [
          updatedCustomer,
          ...current.filter((_, idx) => idx !== existingIndex),
        ];
      } else {
        // Create new customer
        const newCustomer: SavedCustomer = {
          id: `cust_${now}_${Math.random().toString(36).substr(2, 4)}`,
          name: formattedName,
          phone: phone ? phone.trim() : undefined,
          createdAt: now,
          updatedAt: now,
        };
        updatedList = [newCustomer, ...current];
      }

      await this.saveSavedCustomers(updatedList);
      return updatedList;
    } catch (err) {
      console.warn('storageService.saveCustomer error:', err);
      return this.loadSavedCustomers();
    }
  },

  /**
   * Delete a customer by id or name. Also records in deleted list so
   * automatic invoice history sync won't resurrect it.
   */
  async deleteCustomer(nameOrId: string): Promise<SavedCustomer[]> {
    const trimmed = nameOrId.trim();
    if (!trimmed) return this.loadSavedCustomers();

    try {
      const current = await this.loadSavedCustomers();
      const target = current.find(
        (c) => c.id === trimmed || c.name.toLowerCase() === trimmed.toLowerCase()
      );

      const updatedList = current.filter(
        (c) => c.id !== trimmed && c.name.toLowerCase() !== trimmed.toLowerCase()
      );

      // Record in deleted names list
      const deletedNames = await this.loadDeletedCustomerNames();
      const nameToAdd = target ? target.name.toLowerCase() : trimmed.toLowerCase();
      if (!deletedNames.includes(nameToAdd)) {
        deletedNames.push(nameToAdd);
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_CUSTOMERS, JSON.stringify(deletedNames));
      }

      await this.saveSavedCustomers(updatedList);
      return updatedList;
    } catch (err) {
      console.warn('storageService.deleteCustomer error:', err);
      return this.loadSavedCustomers();
    }
  },
};

