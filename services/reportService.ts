/**
 * services/reportService.ts
 * 
 * Catalog & Store Data Reporting Engine for CounterPress POS.
 * 
 * Provides:
 * - 1-to-1 Firestore seed-ready JSON catalog generation
 * - Native Android mobile storage download via StorageAccessFramework
 * - Universal fallback sharing via native Share sheet (Drive, Files, WhatsApp, Email)
 */

import { Alert, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { PresetItem } from '../types/item';
import { formatItemName, formatUnit } from '../utils/formatters';

export const reportService = {
  /**
   * Generates a clean, normalized, 100% database-seed-compatible JSON string
   * conforming 1-to-1 with the Firestore /users/{uid}/items/{itemId} schema.
   */
  generateItemsSeedJson(items: PresetItem[]): string {
    const cleanItems = (items || []).map((it) => ({
      id: it.id,
      name: formatItemName(it.name),
      price: it.price || '0.00',
      purchasePrice: it.purchasePrice || '',
      stockQuantity: typeof it.stockQuantity === 'number' ? it.stockQuantity : 0,
      unit: formatUnit(it.unit || 'Pcs'),
      category: it.category || 'General',
      defaultDiscount: it.defaultDiscount || '',
      barcode: it.barcode || '',
      updatedAt: it.updatedAt || Date.now(),
    }));

    return JSON.stringify(cleanItems, null, 2);
  },

  /**
   * Downloads all items report as a seed JSON file directly into mobile storage
   * (e.g. Downloads or Documents folder) via Android's Storage Access Framework,
   * with automatic native Share sheet fallback.
   */
  async downloadItemsJsonReport(
    items: PresetItem[],
    shopName?: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!items || items.length === 0) {
      Alert.alert(
        'No Items to Export',
        'Your catalog currently has no products. Add items first before downloading a report.'
      );
      return { success: false, message: 'No items in catalog' };
    }

    try {
      const jsonContent = this.generateItemsSeedJson(items);
      const dateStr = new Date().toISOString().split('T')[0];
      const cleanShop = (shopName || 'store')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 20);
      const fileName = `counterpress_${cleanShop}_items_seed_${dateStr}.json`;

      // 1. Android Native Storage Download (StorageAccessFramework)
      if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
        try {
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

          if (permissions.granted && permissions.directoryUri) {
            const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              'application/json'
            );

            await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
              encoding: FileSystem.EncodingType.UTF8,
            });

            Alert.alert(
              'Report Downloaded Successfully! 🎉',
              `Saved ${items.length} items to your chosen folder as:\n\n${fileName}\n\nThis file is 100% database seed ready. If anything ever goes wrong, you can push this JSON directly back to your database!`,
              [{ text: 'Great!' }]
            );

            return { success: true, message: 'Saved to device storage' };
          }
        } catch (safErr) {
          console.warn('StorageAccessFramework notice, falling back to Share sheet:', safErr);
        }
      }

      // 2. Share Sheet / Save to File Fallback (Drive, Files, WhatsApp, Email, etc.)
      const shareResult = await Share.share({
        title: fileName,
        message: jsonContent,
      });

      if (shareResult.action === Share.sharedAction) {
        return { success: true, message: 'Shared successfully' };
      }

      return { success: true, message: 'Export completed' };
    } catch (err: any) {
      console.warn('downloadItemsJsonReport error:', err);
      Alert.alert(
        'Export Notice',
        err?.message || 'Unable to download items report at this time. Please try again.'
      );
      return { success: false, message: err?.message || 'Export failed' };
    }
  },
};

