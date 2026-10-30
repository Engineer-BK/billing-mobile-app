/**
 * components/SaleScreen/SaleItemsList.tsx
 * 
 * Added Items List for POS Sale Screen.
 * Features:
 * - Prominent "+ Add Items (Optional)" button when empty
 * - Automatic Item Numbering (#1, #2, #3...) with renumbering on delete
 * - Formatted item details with measurement units & discount badges
 * - Delete action with automatic re-indexing
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceItem } from '../../types/billing';

interface SaleItemsListProps {
  items: InvoiceItem[];
  onOpenAddItemModal: () => void;
  onRemoveItem: (index: number) => void;
}

export function SaleItemsList({
  items,
  onOpenAddItemModal,
  onRemoveItem,
}: SaleItemsListProps): React.JSX.Element {
  const { colors } = useTheme();

  if (items.length === 0) {
    return (
      <TouchableOpacity
        style={[
          styles.addItemsBtn,
          {
            borderColor: colors.borderLight,
            backgroundColor: colors.surface,
          },
        ]}
        onPress={onOpenAddItemModal}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="plus-circle"
          size={20}
          color={colors.primary}
        />
        <Text style={[styles.addItemsTxt, { color: colors.primary }]}>
          Add Items (Optional)
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.itemsListContainer}>
      {/* Header Row */}
      <View style={styles.itemsListHeader}>
        <Text style={[styles.itemsSectionTitle, { color: colors.textPrimary }]}>
          Added Items ({items.length})
        </Text>
        <TouchableOpacity
          onPress={onOpenAddItemModal}
          style={styles.addMoreBtn}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.addMoreTxt, { color: colors.primary }]}>
            Add More
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item Rows with Sequential Numbering (#1, #2, ...) */}
      {items.map((item, index) => {
        const unitDisplay = item.unit ? ` ${item.unit}` : ' PCS';
        const hasDisc = item.discountPercent && parseFloat(item.discountPercent) > 0;
        const serialNumber = `#${index + 1}`;

        return (
          <View
            key={`${item.sNo}-${index}`}
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
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
                {item.name}
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
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 20,
  },
  addItemsTxt: {
    fontSize: 14,
    fontWeight: '700',
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
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addMoreTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
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
  },
  itemAmt: {
    fontSize: 15,
    fontWeight: '800',
  },
});

