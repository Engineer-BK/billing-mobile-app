/**
 * components/SaleScreen/SaleOptionsModal.tsx
 * 
 * More Options Modal for the POS Sale Screen (triggered by the ⋮ 3-dot button).
 * Features:
 * - Outside Click to Dismiss: Tapping anywhere on the backdrop immediately closes the modal
 * - Header displaying Sale / Invoice summary
 * - Quick Actions:
 *   - "Print Directly to Thermal POS": Instantly commits and dispatches to thermal printer
 *   - "Clear All Items": Empties the current cart (with confirmation)
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

interface SaleOptionsModalProps {
  visible: boolean;
  invoiceNo: string;
  amount: string;
  itemsCount: number;
  onClose: () => void;
  onPrintDirectly: () => void;
  onClearItems: () => void;
}

export function SaleOptionsModal({
  visible,
  invoiceNo,
  amount,
  itemsCount,
  onClose,
  onPrintDirectly,
  onClearItems,
}: SaleOptionsModalProps): React.JSX.Element | null {
  const { colors, isDark } = useTheme();

  // Confirmation view state inside the modal
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const handleClose = () => {
    setShowConfirmClear(false);
    onClose();
  };

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
          accessibilityLabel="Close options popup"
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

          {showConfirmClear ? (
            /* --- Clear Cart Confirmation View --- */
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
                Clear All {itemsCount} Items?
              </Text>
              <Text style={[styles.confirmSubtitle, { color: colors.textSecondary }]}>
                This will remove all items currently added to Invoice #{invoiceNo}.
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
                  onPress={() => setShowConfirmClear(false)}
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
                    onClearItems();
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
                  <Text style={styles.deleteConfirmTxt}>Yes, Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* --- Options List View --- */
            <>
              {/* Header: Sale Metadata */}
              <View
                style={[
                  styles.headerRow,
                  { borderBottomColor: colors.borderLight },
                ]}
              >
                <View style={styles.headerLeft}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Sale Options
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Invoice #{invoiceNo} • {itemsCount} items
                  </Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                    Total
                  </Text>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>
                    ₹{amount || '0.00'}
                  </Text>
                </View>
              </View>

              {/* Action 1: Direct Thermal Print */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => {
                  handleClose();
                  onPrintDirectly();
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
                    Print Directly to Thermal POS
                  </Text>
                  <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                    Save invoice & send to connected ESC/POS printer
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Action 2: Clear Items */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => setShowConfirmClear(true)}
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
                    name="broom"
                    size={22}
                    color={colors.error}
                  />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={[styles.menuItemTitle, { color: colors.error }]}>
                    Clear All Items
                  </Text>
                  <Text style={[styles.menuItemSub, { color: colors.textSecondary }]}>
                    Remove all items from current sale
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
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

