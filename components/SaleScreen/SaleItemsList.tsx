/**
 * components/SaleScreen/SaleItemsList.tsx
 * 
 * Added Items List for POS Sale Screen.
 * Features:
 * - Prominent, inviting "+ Add Items (Optional)" button when empty
 * - Automatic Item Numbering (#1, #2, #3...) with renumbering on delete
 * - Formatted item details with measurement units & discount badges
 * - Delete action with automatic re-indexing
 * - Fast-access "+ Add" pill in header + Large, tactile "+ Add Another Item" bottom card
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceItem } from '../../types/billing';
import { formatItemName, formatUnit } from '../../utils/formatters';

interface SaleItemsListProps {
  items: InvoiceItem[];
  onOpenAddItemModal: () => void;
  onRemoveItem: (index: number) => void;
  onEditItem?: (item: InvoiceItem, index: number) => void;
}

export function SaleItemsList({
  items,
  onOpenAddItemModal,
  onRemoveItem,
  onEditItem,
}: SaleItemsListProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  if (items.length === 0) {
    return (
      <TouchableOpacity
        style={[
          styles.addItemsBtn,
          {
            borderColor: colors.primary,
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.08)' : '#F0F7FF',
          },
        ]}
        onPress={onOpenAddItemModal}
        activeOpacity={0.7}
      >
        <View style={[styles.emptyPlusCircle, { backgroundColor: colors.primaryLight }]}>
          <MaterialCommunityIcons
            name="cart-plus"
            size={22}
            color={colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.addItemsTitle, { color: colors.primary }]}>
            + Add Items to Bill
          </Text>
          <Text style={[styles.addItemsSubtitle, { color: colors.textSecondary }]}>
            Tap to search catalog presets or type custom item
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.itemsListContainer}>
      {/* Header Row with Fast-Access Add Pill */}
      <View style={styles.itemsListHeader}>
        <Text style={[styles.itemsSectionTitle, { color: colors.textPrimary }]}>
          Added Items ({items.length})
        </Text>
        <TouchableOpacity
          onPress={onOpenAddItemModal}
          style={[
            styles.addMoreHeaderBtn,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.addMoreHeaderTxt, { color: colors.primary }]}>
            Add Item
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item Rows with Sequential Numbering (#1, #2, ...) */}
      {items.map((item, index) => {
        const unitDisplay = item.unit ? ` ${formatUnit(item.unit)}` : ' Pcs';
        const hasDisc = item.discountPercent && parseFloat(item.discountPercent) > 0;
        const serialNumber = `#${index + 1}`;

        return (
          <TouchableOpacity
            key={`${item.sNo}-${index}`}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onEditItem?.(item, index)}
            activeOpacity={0.7}
          >
            {/* Sequential Numbering Badge (#1, #2, ...) */}
            <View
              style={[
                styles.sNoBadge,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.sNoTxt, { color: colors.primary }]}>
                {serialNumber}
              </Text>
            </View>

            {/* Item Info */}
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                {formatItemName(item.name)}
              </Text>
              <View style={styles.itemMetaRow}>
                <Text style={[styles.itemFormula, { color: colors.textSecondary }]}>
                  {item.qty}{unitDisplay} × ₹{item.price}
                </Text>
                {hasDisc ? (
                  <View style={[styles.itemDiscBadge, { backgroundColor: colors.successLight }]}>
                    <Text style={[styles.itemDiscTxt, { color: colors.success }]}>
                      -{item.discountPercent}% (-₹{item.discountAmount})
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Line Amount & Trash Can Delete Button */}
            <View style={styles.itemAmountCol}>
              <Text style={[styles.itemAmt, { color: colors.textPrimary }]}>
                ₹{item.amt}
              </Text>
              <TouchableOpacity
                onPress={() => onRemoveItem(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={19}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Tactile Full-Width Add More Card at the bottom of the items list */}
      <TouchableOpacity
        style={[
          styles.addMoreBottomCard,
          {
            borderColor: colors.primary,
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#EFF6FF',
          },
        ]}
        onPress={onOpenAddItemModal}
        activeOpacity={0.7}
      >
        <View style={[styles.plusIconCircle, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.addMoreBottomTextCol}>
          <Text style={[styles.addMoreBottomTitle, { color: colors.primary }]}>
            + Add Another Item
          </Text>
          <Text style={[styles.addMoreBottomSubtitle, { color: colors.textSecondary }]}>
            Tap to add item #{items.length + 1} with instant auto-suggestions
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 12,
  },
  emptyPlusCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemsTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  addItemsSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  itemsListContainer: {
    marginBottom: 16,
  },
  itemsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  addMoreHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addMoreHeaderTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  sNoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sNoTxt: {
    fontSize: 12,
    fontWeight: '900',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  itemFormula: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDiscBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemDiscTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemAmountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  itemAmt: {
    fontSize: 15,
    fontWeight: '800',
  },
  addMoreBottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 4,
    gap: 12,
  },
  plusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreBottomTextCol: {
    flex: 1,
  },
  addMoreBottomTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  addMoreBottomSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
