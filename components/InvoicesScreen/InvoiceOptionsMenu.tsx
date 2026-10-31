/**
 * components/InvoicesScreen/InvoiceOptionsMenu.tsx
 * 
 * Sleek bottom-sheet popup modal for the 3-dot (⋮) menu on invoice cards.
 * Features:
 * - Outside Click to Dismiss: Tapping anywhere on the backdrop immediately closes the modal
 * - Header displaying Invoice #, customer name, date, and total amount
 * - Quick Actions:
 *   - "Print Receipt" (1-tap thermal printer dispatch)
 *   - "Preview Receipt" (Opens authentic thermal paper view)
 *   - "Delete Invoice" (Prompts confirmation before deleting)
 *   - "Cancel" button
 * - Follows FlashBill branding colors and dark/light themes
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData } from '../../types/billing';

interface InvoiceOptionsMenuProps {
  visible: boolean;
  invoice: InvoiceData | null;
  onClose: () => void;
  onPrint: (invoice: InvoiceData) => void;
  onPreview: (invoice: InvoiceData) => void;
  onDelete: (invoice: InvoiceData) => void;
  onChangeStatus?: (invoice: InvoiceData, newStatus: 'PAID' | 'UNPAID') => void;
}

export function InvoiceOptionsMenu({
  visible,
  invoice,
  onClose,
  onPrint,
  onPreview,
  onDelete,
  onChangeStatus,
}: InvoiceOptionsMenuProps): React.JSX.Element | null {
  const { colors, isDark } = useTheme();

  // Confirmation view state inside the modal
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Reset confirmation state when modal is closed
  const handleClose = () => {
    setShowConfirmDelete(false);
    onClose();
  };

  if (!invoice) return null;

  const isPaid = (invoice.status || 'PAID') === 'PAID';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Fullscreen backdrop touchable: Clicking OUTSIDE closes the modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Close popup"
        />

        {/* Modal Card Content (Bottom Sheet Style) */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Grab Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.grabHandle,
                { backgroundColor: colors.borderLight },
              ]}
            />
          </View>

          {showConfirmDelete ? (
            /* --- Delete Confirmation View --- */
            <View style={styles.confirmContainer}>
              <View
                style={[
                  styles.warningIconCircle,
                  { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' },
                ]}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={28}
                  color={colors.error}
                />
              </View>

              <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>
                Delete Invoice #{invoice.invoiceNo}?
              </Text>
              <Text style={[styles.confirmSubtitle, { color: colors.textSecondary }]}>
                Are you sure you want to permanently delete this bill for{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                  {invoice.customerName || 'Walk-in Customer'}
                </Text>{' '}
                (₹{invoice.grandTotal})? This action cannot be undone.
              </Text>

              <View style={styles.confirmActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setShowConfirmDelete(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelBtnTxt, { color: colors.textPrimary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteConfirmBtn,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={() => {
                    handleClose();
                    onDelete(invoice);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
                  <Text style={styles.deleteConfirmTxt}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* --- Default Options Menu View --- */
            <>
              {/* Header: Invoice metadata strip */}
              <View
                style={[
                  styles.invoiceHeader,
                  { borderBottomColor: colors.borderLight },
                ]}
              >
                <View style={styles.headerMeta}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeTxt, { color: colors.primary }]}>
                        #{invoice.invoiceNo}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.headerStatusBadge,
                        {
                          backgroundColor: isPaid
                            ? colors.successLight
                            : isDark
                            ? 'rgba(245, 158, 11, 0.2)'
                            : '#FEF3C7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.headerStatusTxt,
                          { color: isPaid ? colors.success : '#D97706' },
                        ]}
                      >
                        {isPaid ? 'PAID' : 'UNPAID'}
                      </Text>
                    </View>
                    <Text
                      style={[styles.headerCustomer, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {invoice.customerName || 'Walk-in Customer'}
                    </Text>
                  </View>
                  <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
                    {invoice.date} {invoice.time ? `• ${invoice.time}` : ''}
                  </Text>
                </View>

                <View style={styles.amountBox}>
                  <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                    Total
                  </Text>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>
                    ₹{invoice.grandTotal}
                  </Text>
                </View>
              </View>

              {/* Quick Status Segment Switcher */}
              {onChangeStatus && (
                <View
                  style={[
                    styles.statusSegmentCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text style={[styles.statusSegmentLabel, { color: colors.textSecondary }]}>
                    STATUS:
                  </Text>
                  <View style={styles.statusSegmentRow}>
                    <TouchableOpacity
                      style={[
                        styles.statusToggleBtn,
                        isPaid && {
                          backgroundColor: colors.success,
                          borderColor: colors.success,
                        },
                      ]}
                      onPress={() => {
                        handleClose();
                        onChangeStatus(invoice, 'PAID');
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={15}
                        color={isPaid ? '#FFFFFF' : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.statusToggleTxt,
                          { color: isPaid ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        Paid
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusToggleBtn,
                        !isPaid && {
                          backgroundColor: '#D97706',
                          borderColor: '#D97706',
                        },
                      ]}
                      onPress={() => {
                        handleClose();
                        onChangeStatus(invoice, 'UNPAID');
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={15}
                        color={!isPaid ? '#FFFFFF' : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.statusToggleTxt,
                          { color: !isPaid ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        Unpaid
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Action 1: Print Receipt */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => {
                  handleClose();
                  onPrint(invoice);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="printer-pos"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                    Print Receipt
                  </Text>
                  <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                    Send to connected thermal printer
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Action 2: Preview Receipt */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => {
                  handleClose();
                  onPreview(invoice);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    { backgroundColor: colors.surfaceLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={22}
                    color={colors.textPrimary}
                  />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>
                    Preview Receipt
                  </Text>
                  <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                    Inspect cream thermal monospace layout
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Action 3: Change Status (Paid <-> Unpaid) */}
              {onChangeStatus && (
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                  onPress={() => {
                    handleClose();
                    onChangeStatus(invoice, isPaid ? 'UNPAID' : 'PAID');
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconCircle,
                      {
                        backgroundColor: isPaid
                          ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7')
                          : colors.successLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isPaid ? 'clock-outline' : 'check-circle-outline'}
                      size={22}
                      color={isPaid ? '#D97706' : colors.success}
                    />
                  </View>
                  <View style={styles.menuItemTextCol}>
                    <Text
                      style={[
                        styles.menuItemTitle,
                        { color: isPaid ? '#D97706' : colors.success },
                      ]}
                    >
                      {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    </Text>
                    <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                      {isPaid
                        ? 'Change status to Unpaid / Credit'
                        : 'Change status to Paid Sale'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={20}
                    color={isPaid ? '#D97706' : colors.success}
                  />
                </TouchableOpacity>
              )}

              {/* Action 4: Delete Invoice */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => setShowConfirmDelete(true)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    {
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.15)'
                        : '#FEE2E2',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={22}
                    color={colors.error}
                  />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={[styles.menuItemTitle, { color: colors.error }]}>
                    Delete Invoice
                  </Text>
                  <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                    Permanently delete this bill from history
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.error}
                />
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[
                  styles.cancelRowBtn,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelRowTxt, { color: colors.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  menuCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  grabHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  headerMeta: {
    flex: 1,
    paddingRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeTxt: {
    fontSize: 12,
    fontWeight: '900',
  },
  headerStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerStatusTxt: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusSegmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 6,
  },
  statusSegmentLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusSegmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusToggleTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  headerCustomer: {
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  headerDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  menuItemSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  cancelRowBtn: {
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRowTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  confirmSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteConfirmBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  deleteConfirmTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
