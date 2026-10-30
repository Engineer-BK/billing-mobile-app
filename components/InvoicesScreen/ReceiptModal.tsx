/**
 * components/InvoicesScreen/ReceiptModal.tsx
 * 
 * Fullscreen Receipt Inspector Modal.
 * Opens when an invoice card is clicked:
 * - Shows authentic cream thermal monospace receipt preview
 * - Displays active printer specifications (58mm or 80mm)
 * - 1-Tap "Print Billing Receipt" action to print immediately
 * - Share receipt trigger
 * - Delete invoice action with confirmation
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData } from '../../types/billing';
import { PrinterProfile } from '../../types/printer';
import { ReceiptPreview } from '../ReceiptPreview/ReceiptPreview';

interface ReceiptModalProps {
  visible: boolean;
  invoice: InvoiceData | null;
  activeConfig: PrinterProfile;
  onClose: () => void;
  onPrint: (invoice: InvoiceData) => void;
  onDelete?: (invoiceNo: string) => void;
}

export function ReceiptModal({
  visible,
  invoice,
  activeConfig,
  onClose,
  onPrint,
  onDelete,
}: ReceiptModalProps): React.JSX.Element | null {
  const { colors, isDark } = useTheme();

  if (!invoice) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Bill #${invoice.invoiceNo}`,
        message: `🧾 Billing Receipt\nInvoice No: ${invoice.invoiceNo}\nCustomer: ${invoice.customerName || 'Walk-in Customer'}\nDate: ${invoice.date}\nTotal Amount: ₹${invoice.grandTotal}\nTotal Items: ${invoice.items.length}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete Invoice #${invoice.invoiceNo} for ${invoice.customerName || 'Walk-in Customer'} (₹${invoice.grandTotal})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(invoice.invoiceNo);
            }
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Top Header */}
        <View
          style={[
            styles.headerRow,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Invoice #{invoice.invoiceNo}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {invoice.date} {invoice.time ? `• ${invoice.time}` : ''}
            </Text>
          </View>

          {/* Share Action */}
          <TouchableOpacity
            onPress={handleShare}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Delete Action */}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={colors.error}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Receipt Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ReceiptPreview
            activeConfig={activeConfig}
            invoice={invoice}
          />
        </ScrollView>

        {/* Bottom Print Action Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.printBtn,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            onPress={() => onPrint(invoice)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="printer-pos"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.printBtnTxt}>
              Print to {activeConfig.displayName}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    borderTopWidth: 1,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  printBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
