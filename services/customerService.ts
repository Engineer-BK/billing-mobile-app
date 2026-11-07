/**
 * services/customerService.ts
 * 
 * Centralized Store Customer Management & Auto-Suggestion Service.
 * Features:
 * - 0ms Offline-First Persistence via AsyncStorage
 * - Non-blocking Dual-Sync to Cloud Firestore (users/{userId}/customers)
 * - Automatic Seeding: Harvests existing customer names from past invoices
 * - Case-Insensitive Deduplication & Phone auto-fill
 * - Explicit Deletion Tracking: Deleted customer names never accidentally resurrect
 */

import { storageService } from './storageService';
import { syncService } from './syncService';
import { SavedCustomer } from '../types/customer';

class CustomerService {
  private isInitialized = false;

  /**
   * Load all saved customers with automatic past-invoice harvest and cloud merge.
   */
  async getCustomers(userId?: string): Promise<SavedCustomer[]> {
    let localCustomers = await storageService.loadSavedCustomers();
    const deletedNames = await storageService.loadDeletedCustomerNames();
    const deletedSet = new Set(deletedNames.map((n) => n.toLowerCase()));

    // One-time auto-harvest from existing invoices on app start
    if (!this.isInitialized) {
      this.isInitialized = true;
      try {
        const invoices = await storageService.loadInvoices();
        if (invoices && invoices.length > 0) {
          const existingNamesSet = new Set(localCustomers.map((c) => c.name.toLowerCase()));
          let hasNewHarvest = false;

          for (const inv of invoices) {
            const rawName = (inv.customerName || '').trim();
            if (
              rawName &&
              rawName.toLowerCase() !== 'cash' &&
              rawName.toLowerCase() !== 'walk-in customer' &&
              !existingNamesSet.has(rawName.toLowerCase()) &&
              !deletedSet.has(rawName.toLowerCase())
            ) {
              const phone = (inv.customerPhone || '').trim();
              localCustomers = await storageService.saveCustomer(rawName, phone || undefined);
              existingNamesSet.add(rawName.toLowerCase());
              hasNewHarvest = true;
            }
          }
        }
      } catch (err) {
        console.warn('CustomerService invoice harvest notice:', err);
      }
    }

    // Background pull and merge from Cloud Firestore if real user session exists
    if (userId && userId !== 'guest_user') {
      syncService
        .pullAllCustomers(userId)
        .then(async (cloudList) => {
          if (cloudList && cloudList.length > 0) {
            const currentDeleted = await storageService.loadDeletedCustomerNames();
            const currentDelSet = new Set(currentDeleted.map((n) => n.toLowerCase()));
            for (const c of cloudList) {
              if (c.name && !currentDelSet.has(c.name.toLowerCase())) {
                await storageService.saveCustomer(c.name, c.phone);
              }
            }
          }
        })
        .catch((e) => console.warn('CustomerService cloud pull notice:', e));
    }

    // Sort descending by most recent activity
    return localCustomers.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  /**
   * Save or update a customer. Also pushes to Firestore in background.
   */
  async saveCustomer(
    name: string,
    phone?: string,
    userId?: string
  ): Promise<SavedCustomer[]> {
    const trimmed = name.trim();
    if (
      !trimmed ||
      trimmed.toLowerCase() === 'cash' ||
      trimmed.toLowerCase() === 'walk-in customer'
    ) {
      return storageService.loadSavedCustomers();
    }

    const updated = await storageService.saveCustomer(trimmed, phone);

    // Background push to Cloud Firestore
    if (userId && userId !== 'guest_user') {
      const match = updated.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        syncService.pushCustomer(userId, match).catch((e) => {
          console.warn('CustomerService push notice:', e);
        });
      }
    }

    return updated.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  /**
   * Delete a customer by id or name with cross symbol in suggestions.
   * Removes from local storage, marks in deleted list, and deletes from cloud.
   */
  async deleteCustomer(
    idOrName: string,
    userId?: string
  ): Promise<SavedCustomer[]> {
    const trimmed = idOrName.trim();
    if (!trimmed) return storageService.loadSavedCustomers();

    // Check existing customer to get ID for cloud deletion
    const current = await storageService.loadSavedCustomers();
    const target = current.find(
      (c) => c.id === trimmed || c.name.toLowerCase() === trimmed.toLowerCase()
    );

    const updated = await storageService.deleteCustomer(trimmed);

    // Background delete from Cloud Firestore
    if (userId && userId !== 'guest_user' && target?.id) {
      syncService.deleteCustomer(userId, target.id).catch((e) => {
        console.warn('CustomerService delete cloud notice:', e);
      });
    }

    return updated.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
}

export const customerService = new CustomerService();

