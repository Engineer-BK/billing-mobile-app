/**
 * components/ItemsScreen/ItemEditModal.tsx
 * 
 * Classy Modal to Create or Edit a Preset Catalog Item.
 * Features:
 * - Product Name, Price, Unit (with RETAIL_UNITS picker), Default Discount (%), and Category
 * - Live Price Trend Preview: When updating price, shows the historical delta (e.g. Was ₹35 → ₹38 ▲ +8.6%)
 * - Dark & Light mode theme integration
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PresetItem } from '../../types/item';
import { RETAIL_UNITS } from '../SaleScreen/AddItemModal';

export const COMMON_CATEGORIES = [
  'Rice & Grains',
  'Flour & Atta',
  'Dal & Pulses',
  'Oil & Ghee',
  'Spices & Masala',
  'Salt & Sugar',
  'Beverages',
  'Snacks & Biscuits',
  'Vegetables & Fruits',
  'Personal Care',
  'Cleaning & Household',
  'General',
];

interface ItemEditModalProps {
  visible: boolean;
  item: PresetItem | null; // null = Add New, item = Edit Existing
  onClose: () => void;
  onSave: (savedItem: PresetItem) => void;
}

export function ItemEditModal({
  visible,
  item,
  onClose,
  onSave,
}: ItemEditModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [unit, setUnit] = useState<string>('KG');
  const [discount, setDiscount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');

  // Unit Picker Dropdown State
  const [showUnitPicker, setShowUnitPicker] = useState<boolean>(false);
  const [unitSearch, setUnitSearch] = useState<string>('');

  // Category Picker State
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);

  // Initialize or reset form fields whenever modal opens
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price || '');
      setUnit(item.unit || 'KG');
      setDiscount(item.defaultDiscount || '');
      setCategory(item.category || 'General');
    } else {
      setName('');
      setPrice('');
      setUnit('KG');
      setDiscount('');
      setCategory('General');
    }
    setShowUnitPicker(false);
    setShowCategoryPicker(false);
  }, [item, visible]);

  // Price trend delta preview if editing existing item
  const priceTrend = useMemo(() => {
    if (!item) return null;
    const oldP = parseFloat(item.price) || 0;
    const newP = parseFloat(price) || 0;
    if (oldP <= 0 || newP <= 0 || oldP === newP) return null;

    const diff = newP - oldP;
    const pct = ((diff / oldP) * 100).toFixed(1);
    const isUp = diff > 0;

    return {
      oldPrice: oldP.toFixed(2).replace(/\.00$/, ''),
      newPrice: newP.toFixed(2).replace(/\.00$/, ''),
      isUp,
      pctText: isUp ? `+${pct}%` : `${pct}%`,
      arrow: isUp ? '▲' : '▼',
      color: isUp ? '#EF4444' : '#10B981',
      badgeBg: isUp
        ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2')
        : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7'),
    };
  }, [item, price, isDark]);

  const filteredUnits = useMemo(() => {
    if (!unitSearch.trim()) return RETAIL_UNITS;
    const q = unitSearch.toLowerCase().trim();
    return RETAIL_UNITS.filter(
      (u) =>
        u.label.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q)
    );
  }, [unitSearch]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const cleanPrice = parseFloat(price.trim());

    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a product name.');
      return;
    }

    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid selling price greater than 0.');
      return;
    }

    const priceStr = cleanPrice.toFixed(2).replace(/\.00$/, '');
    const now = Date.now();

    let updatedItem: PresetItem;

    if (item) {
      // Editing existing item
      const priceChanged = item.price !== priceStr;
      updatedItem = {
        ...item,
        name: trimmedName,
        price: priceStr,
        previousPrice: priceChanged ? item.price : item.previousPrice,
        priceChangedAt: priceChanged ? now : item.priceChangedAt,
        unit: unit.trim().toUpperCase() || 'PCS',
        defaultDiscount: discount.trim() ? Math.min(100, Math.max(0, parseFloat(discount) || 0)).toString() : undefined,
        category: category.trim() || 'General',
        updatedAt: now,
      };
    } else {
      // Creating new item
      updatedItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: trimmedName,
        price: priceStr,
        unit: unit.trim().toUpperCase() || 'PCS',
        defaultDiscount: discount.trim() ? Math.min(100, Math.max(0, parseFloat(discount) || 0)).toString() : undefined,
        category: category.trim() || 'General',
        updatedAt: now,
      };
    }

    onSave(updatedItem);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close item modal"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
          pointerEvents="box-none"
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
              <View style={styles.titleRow}>
                <View style={[styles.headerIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <MaterialCommunityIcons
                    name={item ? 'package-variant' : 'package-variant-closed'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {item ? 'Edit Product' : 'Add New Product'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollForm}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Product Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  PRODUCT NAME <Text style={{ color: colors.primary }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: name ? colors.primary : colors.borderLight,
                      color: colors.textPrimary,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Basmati Rice, Sunflower Oil"
                  placeholderTextColor={colors.textMuted}
                  autoFocus={!item}
                />
              </View>

              {/* Price & Unit Row */}
              <View style={styles.inputsRow}>
                {/* Selling Rate (₹) */}
                <View style={[styles.inputWrapper, { flex: 1.2 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    SELLING RATE (₹) <Text style={{ color: colors.primary }}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: price ? colors.primary : colors.borderLight,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="e.g. 45"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* Unit Selector */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    UNIT <Text style={{ color: colors.primary }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.unitDropdownBtn,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    onPress={() => {
                      setUnitSearch('');
                      setShowUnitPicker(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitBtnTxt, { color: colors.textPrimary }]}>{unit}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price Trend Delta Live Preview Banner */}
              {priceTrend && (
                <View
                  style={[
                    styles.trendPreviewBanner,
                    { backgroundColor: priceTrend.badgeBg, borderColor: priceTrend.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={priceTrend.isUp ? 'trending-up' : 'trending-down'}
                    size={18}
                    color={priceTrend.color}
                  />
                  <Text style={[styles.trendPreviewTxt, { color: priceTrend.color }]}>
                    Price changed from ₹{priceTrend.oldPrice} → ₹{priceTrend.newPrice} ({priceTrend.arrow} {priceTrend.pctText})
                  </Text>
                </View>
              )}

              {/* Default Discount (%) & Category Row */}
              <View style={styles.inputsRow}>
                {/* Default Discount (%) */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    DEFAULT DISCOUNT (%)
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: discount ? colors.primary : colors.borderLight,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={discount}
                    onChangeText={setDiscount}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                {/* Category Picker */}
                <View style={[styles.inputWrapper, { flex: 1.2 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    CATEGORY
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.unitDropdownBtn,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    onPress={() => setShowCategoryPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitBtnTxt, { color: colors.textPrimary }]} numberOfLines={1}>
                      {category}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.modalActionsRow, { borderTopColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderLight }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnTxt, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnTxt}>{item ? 'Save Changes' : 'Add to Catalog'}</Text>
              </TouchableOpacity>
            </View>

            {/* Unit Dropdown Selector Modal */}
            <Modal
              visible={showUnitPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowUnitPicker(false)}
            >
              <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setShowUnitPicker(false)}
              >
                <View
                  style={[
                    styles.pickerCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.pickerHeader}>
                    <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                      Select Unit
                    </Text>
                    <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                      <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[
                      styles.pickerSearch,
                      { backgroundColor: colors.surfaceLight, color: colors.textPrimary },
                    ]}
                    placeholder="Search unit (KG, PCS, L...)"
                    placeholderTextColor={colors.textMuted}
                    value={unitSearch}
                    onChangeText={setUnitSearch}
                    autoFocus
                  />

                  <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
                    {filteredUnits.map((u) => (
                      <TouchableOpacity
                        key={u.code}
                        style={[
                          styles.pickerItem,
                          unit === u.code && { backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => {
                          setUnit(u.code);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerItemTxt, { color: colors.textPrimary }]}>
                          {u.label} ({u.code})
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>{u.category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Category Dropdown Selector Modal */}
            <Modal
              visible={showCategoryPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCategoryPicker(false)}
            >
              <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryPicker(false)}
              >
                <View
                  style={[
                    styles.pickerCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.pickerHeader}>
                    <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                      Select Category
                    </Text>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                      <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 280 }}>
                    {COMMON_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.pickerItem,
                          category === cat && { backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => {
                          setCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerItemTxt, { color: colors.textPrimary }]}>
                          {cat}
                        </Text>
                        {category === cat && (
                          <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    width: '100%',
  },
  modalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollForm: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
  },
  unitDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  unitBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  trendPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 14,
  },
  trendPreviewTxt: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
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
  saveBtn: {
    flex: 1.6,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pickerSearch: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pickerItemTxt: {
    fontSize: 14,
    fontWeight: '600',
  },
});

