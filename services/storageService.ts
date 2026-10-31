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
import { InvoiceData } from '../types/billing';
import { PrinterProfileId } from '../types/printer';

const STORAGE_KEYS = {
  INVOICES: '@flashbill:invoices_v1',
  NEXT_INVOICE_NUM: '@flashbill:next_invoice_num_v1',
  SAVED_PRINTER: '@flashbill:saved_printer_v1',
  ACTIVE_PROFILE: '@flashbill:active_profile_v1',
  THEME_MODE: '@flashbill:theme_mode_v1',
} as const;

export interface SavedPrinterInfo {
  address: string;
  name: string;
  profileId: PrinterProfileId;
  lastConnectedAt?: string;
}

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
};

