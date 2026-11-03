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
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { InvoiceData } from '../types/billing';
import { UserProfile } from '../types/auth';
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
          if (snapshot.empty) return;

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

          if (invoices.length > 0) {
            storageService.saveInvoices(invoices);
            const maxInvoiceNo = Math.max(...invoices.map((inv) => parseInt(inv.invoiceNo, 10) || 0));
            if (maxInvoiceNo > 0) {
              storageService.saveNextInvoiceNumber(maxInvoiceNo + 1);
            }
            onUpdate(invoices);
          }
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

    // Sort chronologically ascending (oldest first)
    const sortedAsc = [...currentInvoices].sort((a, b) => {
      const numA = parseInt(a.invoiceNo, 10) || 0;
      const numB = parseInt(b.invoiceNo, 10) || 0;
      return numA - numB;
    });

    const resequenced: InvoiceData[] = [];
    const oldNumbersToDelete: string[] = [];

    sortedAsc.forEach((inv, index) => {
      const newNo = String(index + 1);
      if (inv.invoiceNo !== newNo) {
        oldNumbersToDelete.push(inv.invoiceNo);
      }
      resequenced.push({
        ...inv,
        invoiceNo: newNo,
      });
    });

    // In Cloud Firestore: remove obsolete document IDs and save updated IDs (Real stores only)
    if (userId && userId !== 'guest_user') {
      for (const oldNo of oldNumbersToDelete) {
        await this.deleteInvoice(userId, oldNo);
      }
      for (const inv of resequenced) {
        await this.pushInvoice(userId, inv);
      }
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
};

