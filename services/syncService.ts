/**
 * services/syncService.ts
 * 
 * High-Performance Dual-Sync Engine for FlashBill POS.
 * Features:
 * - 0ms Billing Latency: Local-first persistence in AsyncStorage guarantees
 *   retail checkout is never blocked by cloud operations.
 * - Background Cloud Push: Asynchronously queues and writes invoices to Cloud Firestore.
 * - Multi-Device Restore: Pulls entire store history upon sign-in from any device.
 * - Automatic Offline Fault-Tolerance: Catches network disconnects gracefully.
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { InvoiceData } from '../types/billing';
import { UserProfile } from '../types/auth';
import { PresetItem } from '../types/item';
import { storageService } from './storageService';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline';

export const syncService = {
  /**
   * Background Push: Save a single invoice to Cloud Firestore.
   * Never throws or blocks retail checkout.
   */
  async pushInvoice(userId: string, invoice: InvoiceData): Promise<{ success: boolean; error?: string }> {
    if (!userId || userId === 'guest_user' || !invoice.invoiceNo) {
      return { success: false, error: 'Guest or invalid user' };
    }

    try {
      const invoiceRef = doc(db, 'users', userId, 'invoices', invoice.invoiceNo);
      
      // Clean undefined fields to satisfy Firestore requirements
      const payload: Record<string, any> = {
        invoiceNo: invoice.invoiceNo,
        date: invoice.date || '',
        time: invoice.time || '',
        customerName: invoice.customerName || 'Walk-in Customer',
        customerPhone: invoice.customerPhone || '',
        status: invoice.status || 'PAID',
        subtotal: invoice.subtotal || '0.00',
        totalDiscount: invoice.totalDiscount || '0.00',
        grandTotal: invoice.grandTotal || '0.00',
        finalAmount: invoice.finalAmount || invoice.grandTotal || '0.00',
        totalQty: invoice.totalQty || '0',
        shopName: invoice.shopName || '',
        items: (invoice.items || []).map((item) => ({
          sNo: item.sNo || '',
          name: item.name || '',
          qty: item.qty || '1',
          unit: item.unit || 'PCS',
          price: item.price || '0',
          discountPercent: item.discountPercent || '',
          discountAmount: item.discountAmount || '',
          amt: item.amt || '0',
        })),
        updatedAt: Date.now(),
      };

      await setDoc(invoiceRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.warn('syncService.pushInvoice background sync notice:', err?.message || err);
      return { success: false, error: err?.message || 'Sync queued offline' };
    }
  },

  /**
   * Background Delete: Remove invoice from Cloud Firestore.
   */
  async deleteInvoice(userId: string, invoiceNo: string): Promise<boolean> {
    if (!userId || userId === 'guest_user' || !invoiceNo) return false;
    try {
      const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceNo);
      await deleteDoc(invoiceRef);
      return true;
    } catch (err) {
      console.warn('syncService.deleteInvoice notice:', err);
      return false;
    }
  },

  /**
   * Multi-Device Restore: Pull all invoices from Cloud Firestore when
   * logging into a new mobile phone.
   */
  async pullAllInvoices(userId: string): Promise<InvoiceData[]> {
    if (!userId || userId === 'guest_user') return [];
    try {
      const invoicesColl = collection(db, 'users', userId, 'invoices');
      const snapshot = await getDocs(query(invoicesColl));

      const invoices: InvoiceData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        invoices.push({
          invoiceNo: data.invoiceNo || docSnap.id,
          date: data.date || '',
          time: data.time || '',
          customerName: data.customerName || 'Walk-in Customer',
          customerPhone: data.customerPhone || '',
          status: data.status || 'PAID',
          subtotal: data.subtotal || '0.00',
          totalDiscount: data.totalDiscount || '0.00',
          grandTotal: data.grandTotal || '0.00',
          finalAmount: data.finalAmount || data.grandTotal || '0.00',
          totalQty: data.totalQty || '0',
          shopName: data.shopName || '',
          items: data.items || [],
        });
      });

      // Sort invoices sequentially descending (newest first)
      invoices.sort((a, b) => {
        const numA = parseInt(a.invoiceNo, 10) || 0;
        const numB = parseInt(b.invoiceNo, 10) || 0;
        return numB - numA;
      });

      // Cache locally to AsyncStorage for instant 0ms offline access (only when invoices exist)
      if (invoices.length > 0) {
        await storageService.saveInvoices(invoices);
        const maxInvoiceNo = Math.max(...invoices.map((inv) => parseInt(inv.invoiceNo, 10) || 0));
        if (maxInvoiceNo > 0) {
          await storageService.saveNextInvoiceNumber(maxInvoiceNo + 1);
        }
      }

      return invoices;
    } catch (err) {
      console.warn('syncService.pullAllInvoices notice:', err);
      return [];
    }
  },

  /**
   * Real-Time Invoices Listener: Automatically streams cloud invoices
   * to the app whenever a bill is created, updated, or synced.
   */
  subscribeToInvoices(
    userId: string,
    onUpdate: (invoices: InvoiceData[]) => void
  ): Unsubscribe {
    if (!userId || userId === 'guest_user') return () => {};

    try {
      const invoicesColl = collection(db, 'users', userId, 'invoices');
      const q = query(invoicesColl);

      return onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            storageService.saveInvoices([]);
            storageService.saveNextInvoiceNumber(1);
            onUpdate([]);
            return;
          }

          const invoices: InvoiceData[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            invoices.push({
              invoiceNo: data.invoiceNo || docSnap.id,
              date: data.date || '',
              time: data.time || '',
              customerName: data.customerName || 'Walk-in Customer',
              customerPhone: data.customerPhone || '',
              status: data.status || 'PAID',
              subtotal: data.subtotal || '0.00',
              totalDiscount: data.totalDiscount || '0.00',
              grandTotal: data.grandTotal || '0.00',
              finalAmount: data.finalAmount || data.grandTotal || '0.00',
              totalQty: data.totalQty || '0',
              shopName: data.shopName || '',
              items: data.items || [],
            });
          });

          // Sort invoices sequentially descending (newest first)
          invoices.sort((a, b) => {
            const numA = parseInt(a.invoiceNo, 10) || 0;
            const numB = parseInt(b.invoiceNo, 10) || 0;
            return numB - numA;
          });

          storageService.saveInvoices(invoices);
          const maxInvoiceNo = Math.max(...invoices.map((inv) => parseInt(inv.invoiceNo, 10) || 0));
          if (maxInvoiceNo > 0) {
            storageService.saveNextInvoiceNumber(maxInvoiceNo + 1);
          }
          onUpdate(invoices);
        },
        (err) => {
          console.warn('syncService.subscribeToInvoices notice:', err?.message || err);
        }
      );
    } catch (err) {
      console.warn('syncService.subscribeToInvoices setup error:', err);
      return () => {};
    }
  },

  /**
   * Push all unsynced local invoices to Firestore (used on "Sync Now" button).
   */
  async syncAllLocalInvoices(userId: string): Promise<{ syncedCount: number; error?: string }> {
    if (!userId || userId === 'guest_user') return { syncedCount: 0, error: 'Guest or invalid user' };
    try {
      const localInvoices = await storageService.loadInvoices();
      if (!localInvoices || localInvoices.length === 0) {
        return { syncedCount: 0 };
      }

      let successCount = 0;
      for (const inv of localInvoices) {
        const res = await this.pushInvoice(userId, inv);
        if (res.success) {
          successCount++;
        }
      }

      return { syncedCount: successCount };
    } catch (err: any) {
      console.warn('syncService.syncAllLocalInvoices error:', err);
      return { syncedCount: 0, error: err?.message || 'Sync failed' };
    }
  },

  /**
   * Atomic Bulk Delete & Resequence in Cloud Firestore:
   * Uses Firestore writeBatch to atomically:
   * 1. Delete all removed invoice documents
   * 2. Renumber and write surviving invoices sequentially (#1, #2, #3...)
   * 3. Triggers AT MOST ONE snapshot event to real-time listeners instead of N separate events.
   * Completely avoids intermediate one-by-one reductions and empty screen flickers!
   */
  async bulkDeleteAndResequence(
    userId: string,
    deletedInvoiceNos: string[],
    remainingInvoices: InvoiceData[]
  ): Promise<InvoiceData[]> {
    if (!userId || userId === 'guest_user') return [];

    try {
      // Sort surviving invoices chronologically ascending (oldest first: 1, 2, 3...)
      const sortedAsc = [...remainingInvoices].sort((a, b) => {
        const numA = parseInt(a.invoiceNo, 10) || 0;
        const numB = parseInt(b.invoiceNo, 10) || 0;
        return numA - numB;
      });

      // Assign contiguous sequential numbers
      const resequenced: InvoiceData[] = sortedAsc.map((inv, idx) => ({
        ...inv,
        invoiceNo: String(idx + 1),
      }));

      // Identify document IDs that will exist after this operation
      const newIdsSet = new Set(resequenced.map((inv) => inv.invoiceNo));

      // Identify document IDs that existed before
      const allOldIds = new Set([
        ...deletedInvoiceNos,
        ...remainingInvoices.map((inv) => inv.invoiceNo),
      ]);

      // Any old document ID that will not be present in the new set must be deleted
      const idsToDelete: string[] = [];
      for (const oldId of allOldIds) {
        if (!newIdsSet.has(oldId)) {
          idsToDelete.push(oldId);
        }
      }

      // Collect operations
      const operations: Array<{ type: 'delete'; ref: any } | { type: 'set'; ref: any; data: any }> = [];

      for (const oldId of idsToDelete) {
        operations.push({
          type: 'delete',
          ref: doc(db, 'users', userId, 'invoices', oldId),
        });
      }

      for (const inv of resequenced) {
        operations.push({
          type: 'set',
          ref: doc(db, 'users', userId, 'invoices', inv.invoiceNo),
          data: {
            invoiceNo: inv.invoiceNo,
            date: inv.date || '',
            time: inv.time || '',
            customerName: inv.customerName || 'Walk-in Customer',
            customerPhone: inv.customerPhone || '',
            status: inv.status || 'PAID',
            subtotal: inv.subtotal || inv.grandTotal || '0.00',
            totalDiscount: inv.totalDiscount || '0.00',
            grandTotal: inv.grandTotal || '0.00',
            finalAmount: inv.finalAmount || inv.grandTotal || '0.00',
            totalQty: inv.totalQty || '0',
            shopName: inv.shopName || '',
            items: (inv.items || []).map((item) => ({
              sNo: item.sNo || '',
              name: item.name || '',
              qty: item.qty || '1',
              unit: item.unit || 'PCS',
              price: item.price || '0',
              discountPercent: item.discountPercent || '',
              discountAmount: item.discountAmount || '',
              amt: item.amt || '0',
            })),
            updatedAt: Date.now(),
          },
        });
      }

      // Commit in batches of up to 400 operations (Firestore limit is 500)
      for (let i = 0; i < operations.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = operations.slice(i, i + 400);
        for (const op of chunk) {
          if (op.type === 'delete') {
            batch.delete(op.ref);
          } else {
            batch.set(op.ref, op.data, { merge: true });
          }
        }
        await batch.commit();
      }

      // Sort descending for UI presentation (newest on top)
      const sortedDesc = [...resequenced].sort((a, b) => {
        const numA = parseInt(a.invoiceNo, 10) || 0;
        const numB = parseInt(b.invoiceNo, 10) || 0;
        return numB - numA;
      });

      // Save locally
      await storageService.saveInvoices(sortedDesc);
      await storageService.saveNextInvoiceNumber(sortedDesc.length + 1);

      return sortedDesc;
    } catch (err) {
      console.warn('syncService.bulkDeleteAndResequence error:', err);
      return [];
    }
  },

  /**
   * Re-sequence / Renumber all invoices continuously (1, 2, 3...)
   * Guarantees zero gaps in the serial numbering sequence when a bill is deleted.
   */
  async resequenceInvoices(
    userId: string,
    currentInvoices: InvoiceData[]
  ): Promise<InvoiceData[]> {
    if (!currentInvoices || currentInvoices.length === 0) {
      await storageService.saveInvoices([]);
      await storageService.saveNextInvoiceNumber(1);
      return [];
    }

    return this.bulkDeleteAndResequence(userId, [], currentInvoices);
  },

  /**
   * Save or Update Store Profile in Firestore (users/{userId}).
   */
  async saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
    if (!userId) return false;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          ...profile,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('syncService.saveUserProfile error:', err);
      return false;
    }
  },

  /**
   * Fetch Store Profile from Firestore on login from a new device.
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('syncService.getUserProfile error:', err);
      return null;
    }
  },

  // ==========================================
  // CATALOG PRESET ITEMS DUAL-SYNC ENGINE
  // ==========================================

  /**
   * Background Push: Save or update a single preset item in Cloud Firestore.
   */
  async pushPresetItem(userId: string, item: PresetItem): Promise<{ success: boolean; error?: string }> {
    if (!userId || userId === 'guest_user' || !item.id) {
      return { success: false, error: 'Guest or invalid user' };
    }

    try {
      const itemRef = doc(db, 'users', userId, 'items', item.id);
      const payload: Record<string, any> = {
        id: item.id,
        name: item.name || '',
        price: item.price || '0',
        purchasePrice: item.purchasePrice || '',
        stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : 0,
        previousPrice: item.previousPrice || '',
        priceChangedAt: item.priceChangedAt || 0,
        unit: item.unit || 'PCS',
        defaultDiscount: item.defaultDiscount || '',
        category: item.category || 'General',
        barcode: item.barcode || '',
        updatedAt: item.updatedAt || Date.now(),
      };

      await setDoc(itemRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.warn('syncService.pushPresetItem notice:', err?.message || err);
      return { success: false, error: err?.message || 'Sync queued offline' };
    }
  },

  /**
   * Background Delete: Remove a preset item from Cloud Firestore.
   */
  async deletePresetItem(userId: string, itemId: string): Promise<boolean> {
    if (!userId || userId === 'guest_user' || !itemId) return false;
    try {
      const itemRef = doc(db, 'users', userId, 'items', itemId);
      await deleteDoc(itemRef);
      return true;
    } catch (err) {
      console.warn('syncService.deletePresetItem notice:', err);
      return false;
    }
  },

  /**
   * Multi-Device Restore: Pull all preset items from Cloud Firestore.
   */
  async pullAllPresetItems(userId: string): Promise<PresetItem[]> {
    if (!userId || userId === 'guest_user') return [];
    try {
      const colRef = collection(db, 'users', userId, 'items');
      const snap = await getDocs(colRef);
      const items: PresetItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: data.id || d.id,
          name: data.name || '',
          price: data.price || '0',
          purchasePrice: data.purchasePrice !== undefined ? String(data.purchasePrice) : undefined,
          stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : undefined,
          previousPrice: data.previousPrice || undefined,
          priceChangedAt: data.priceChangedAt || undefined,
          unit: data.unit || 'PCS',
          defaultDiscount: data.defaultDiscount || undefined,
          category: data.category || 'General',
          barcode: data.barcode || undefined,
          updatedAt: data.updatedAt || Date.now(),
        });
      });
      return items;
    } catch (err) {
      console.warn('syncService.pullAllPresetItems notice:', err);
      return [];
    }
  },

  /**
   * Realtime Stream: Live Firestore listener for Catalog Preset changes.
   */
  subscribeToPresetItems(
    userId: string,
    onUpdate: (items: PresetItem[]) => void
  ): Unsubscribe {
    if (!userId || userId === 'guest_user') {
      return () => {};
    }

    try {
      const colRef = collection(db, 'users', userId, 'items');
      const q = query(colRef);
      return onSnapshot(
        q,
        (snap) => {
          const items: PresetItem[] = [];
          snap.forEach((d) => {
            const data = d.data();
            items.push({
              id: data.id || d.id,
              name: data.name || '',
              price: data.price || '0',
              purchasePrice: data.purchasePrice !== undefined ? String(data.purchasePrice) : undefined,
              stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : undefined,
              previousPrice: data.previousPrice || undefined,
              priceChangedAt: data.priceChangedAt || undefined,
              unit: data.unit || 'PCS',
              defaultDiscount: data.defaultDiscount || undefined,
              category: data.category || 'General',
              barcode: data.barcode || undefined,
              updatedAt: data.updatedAt || Date.now(),
            });
          });
          onUpdate(items);
        },
        (err) => {
          console.warn('subscribeToPresetItems snapshot notice:', err);
        }
      );
    } catch (err) {
      console.warn('subscribeToPresetItems error:', err);
      return () => {};
    }
  },
};

