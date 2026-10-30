/**
 * components/SaleScreen/AddItemModal.tsx
 * 
 * Interactive Item Selector & Adder for the POS Sale Screen.
 * Features:
 * - Searchable catalog filtering across 150+ products in items.ts
 * - Custom product name entry if not in catalog
 * - Quantity & Unit Price inputs with live total calculation
 * - Fully bound to FlashBill branding colors (constants/theme.ts)
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { groceryProducts } from '../../constants/items';
import { InvoiceItem } from '../../types/billing';

interface AddItemModalProps {
  visible: boolean;
  itemIndex: number;
  onClose: () => void;
  onAddItem: (item: InvoiceItem) => void;
}

export function AddItemModal({
  visible,
  itemIndex,
  onClose,
  onAddItem,
}: AddItemModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [qty, setQty] = useState<string>('1');
  const [price, setPrice] = useState<string>('');

  // Filter grocery catalog
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return groceryProducts.slice(0, 15);
    }
    const q = searchQuery.toLowerCase().trim();
    return groceryProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [searchQuery]);

  // Handle selecting an item from the list
  const handleSelectProduct = (product: (typeof groceryProducts)[0]) => {
    setItemName(product.name);
    setPrice(product.price.toString());
    setSearchQuery(product.name);
  };

  // Calculate live row total
  const calculatedTotal = useMemo(() => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    return (q * p).toFixed(2).replace(/\.00$/, '');
  }, [qty, price]);

  // Add Item to Bill
  const handleAdd = () => {
    const finalName = itemName.trim() || searchQuery.trim() || 'General Item';
    const finalQty = qty.trim() || '1';
    const finalPrice = price.trim() || '0';
    const finalAmt = calculatedTotal || '0';

    onAddItem({
      sNo: itemIndex.toString(),
      name: finalName,
      qty: finalQty,
      price: finalPrice,
      amt: finalAmt,
    });

    // Reset and close
    setItemName('');
    setSearchQuery('');
    setQty('1');
    setPrice('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.title,
                    { color: colors.textPrimary },
                  ]}
                >
                  Add Item to Sale
                </Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Search or Custom Item Input */}
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.floatingBadge,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                    Item Name / Search Catalog *
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.primary,
                      color: colors.textPrimary,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setItemName(text);
                  }}
                  placeholder="e.g. Basmati Rice, Oil, Potato"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Suggestions List */}
              <View style={styles.suggestionsContainer}>
                <Text
                  style={[
                    styles.suggestionsTitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Quick Select Catalog Products:
                </Text>
                <FlatList
                  data={filteredProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.sku || item.name}
                  contentContainerStyle={styles.chipsRow}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.productChip,
                        {
                          backgroundColor:
                            itemName === item.name
                              ? colors.primaryLight
                              : colors.surfaceLight,
                          borderColor:
                            itemName === item.name
                              ? colors.primary
                              : colors.borderLight,
                        },
                      ]}
                      onPress={() => handleSelectProduct(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipName,
                          {
                            color:
                              itemName === item.name
                                ? colors.primary
                                : colors.textPrimary,
                            fontWeight:
                              itemName === item.name ? '800' : '600',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.chipPrice,
                          { color: colors.textSecondary },
                        ]}
                      >
                        ₹{item.price}/{item.unit}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Quantity & Unit Price Row */}
              <View style={styles.inputsRow}>
                {/* Quantity */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <View
                    style={[
                      styles.floatingBadge,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                      Quantity *
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: colors.primary,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={qty}
                    onChangeText={setQty}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Unit Price */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <View
                    style={[
                      styles.floatingBadge,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                      Rate / Price (₹) *
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: colors.primary,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Amount Preview */}
              <View
                style={[
                  styles.calcRow,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.calcLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Calculated Line Amount:
                </Text>
                <Text
                  style={[
                    styles.calcValue,
                    { color: colors.primary },
                  ]}
                >
                  ₹ {calculatedTotal}
                </Text>
              </View>

              {/* Add to Bill Button (Uses colors.primary) */}
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
                onPress={handleAdd}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnTxt}>ADD ITEM TO BILL</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  floatingBadge: {
    position: 'absolute',
    top: -8,
    left: 14,
    zIndex: 2,
    paddingHorizontal: 6,
  },
  floatingLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipName: {
    fontSize: 12,
  },
  chipPrice: {
    fontSize: 10,
    marginTop: 2,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  calcLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  calcValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  addBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
