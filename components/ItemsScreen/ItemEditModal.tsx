/**
 * components/ItemsScreen/ItemEditModal.tsx
 * 
 * Classy, Responsive Bottom Sheet Modal to Create or Edit a Preset Catalog Item.
 * Features:
 * - Product Name, Selling Price, Unit (with searchable RETAIL_UNITS picker),
 *   Default Discount (%), and Category (with searchable COMMON_CATEGORIES picker)
 * - Live Price Trend Delta Preview: Displays historical price shift (e.g. Was ₹20 → ₹22 ▲ +10.0%)
 * - Live Effective Pricing Summary Card: Shows rate, discount savings, and final rate per unit
 * - True Responsive Keyboard Handling: Never overlaps or cuts off inputs on Android/iOS
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
  'Beverages & Tea',
  'Snacks & Biscuits',
  'Vegetables & Fruits',
  'Dairy & Eggs',
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
  const [price, setPrice] = useState<string>(''); // Sale Price
  const [purchasePrice, setPurchasePrice] = useState<string>(''); // Purchase Price
  const [stockQuantity, setStockQuantity] = useState<string>(''); // In Stock
  const [unit, setUnit] = useState<string>('KG');
  const [discount, setDiscount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');

  // Unit Picker Dropdown State
  const [showUnitPicker, setShowUnitPicker] = useState<boolean>(false);
  const [unitSearch, setUnitSearch] = useState<string>('');

  // Category Picker State
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Initialize or reset form fields whenever modal opens
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price || '');
      setPurchasePrice(item.purchasePrice || '');
      setStockQuantity(item.stockQuantity !== undefined ? String(item.stockQuantity) : '');
      setUnit(item.unit || 'KG');
      setDiscount(item.defaultDiscount || '');
      setCategory(item.category || 'General');
    } else {
      setName('');
      setPrice('');
      setPurchasePrice('');
      setStockQuantity('');
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
    const pct = Math.abs((diff / oldP) * 100).toFixed(1);
    const isUp = diff > 0;

    return {
      oldPrice: oldP.toFixed(2).replace(/\.00$/, ''),
      newPrice: newP.toFixed(2).replace(/\.00$/, ''),
      isUp,
      pctText: isUp ? `+${pct}%` : `-${pct}%`,
      arrow: isUp ? '▲' : '▼',
      color: isUp ? '#EF4444' : '#10B981',
      badgeBg: isUp
        ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2')
        : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7'),
    };
  }, [item, price, isDark]);

  // Live Effective Pricing & Profit Margin Calculation
  const pricingPreview = useMemo(() => {
    const rawPrice = parseFloat(price) || 0;
    const costPrice = parseFloat(purchasePrice) || 0;
    const discPct = Math.min(100, Math.max(0, parseFloat(discount) || 0));
    const discAmount = (rawPrice * discPct) / 100;
    const finalRate = Math.max(0, rawPrice - discAmount);

    const profitPerUnit = costPrice > 0 ? rawPrice - costPrice : 0;
    const marginPct = costPrice > 0 ? (profitPerUnit / costPrice) * 100 : 0;

    const netProfitAfterDisc = costPrice > 0 ? finalRate - costPrice : 0;
    const netMarginPct = costPrice > 0 ? (netProfitAfterDisc / costPrice) * 100 : 0;

    return {
      rawPrice: rawPrice > 0 ? rawPrice.toFixed(2) : '0.00',
      costPrice: costPrice > 0 ? costPrice.toFixed(2) : '0.00',
      discPct,
      discAmount: discAmount.toFixed(2),
      finalRate: finalRate > 0 ? finalRate.toFixed(2) : '0.00',
      hasDiscount: discPct > 0,
      hasCost: costPrice > 0,
      profitPerUnit: profitPerUnit.toFixed(2),
      marginPct: marginPct.toFixed(1),
      netProfitAfterDisc: netProfitAfterDisc.toFixed(2),
      netMarginPct: netMarginPct.toFixed(1),
      isProfitable: costPrice > 0 ? (discPct > 0 ? netProfitAfterDisc >= 0 : profitPerUnit >= 0) : true,
    };
  }, [price, purchasePrice, discount]);

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

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return COMMON_CATEGORIES;
    const q = categorySearch.toLowerCase().trim();
    return COMMON_CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [categorySearch]);

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
    const cleanPurchase = purchasePrice.trim() ? (parseFloat(purchasePrice.trim()) || 0).toFixed(2).replace(/\.00$/, '') : undefined;
    const cleanStock = stockQuantity.trim() !== '' ? (parseFloat(stockQuantity.trim()) || 0) : undefined;
    const now = Date.now();

    let updatedItem: PresetItem;

    if (item) {
      // Editing existing item
      const priceChanged = item.price !== priceStr;
      updatedItem = {
        ...item,
        name: trimmedName,
        price: priceStr,
        purchasePrice: cleanPurchase,
        stockQuantity: cleanStock,
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
        purchasePrice: cleanPurchase,
        stockQuantity: cleanStock,
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
        {/* Fullscreen touchable backdrop to dismiss */}
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
            {/* Sheet Pull Handle */}
            <View style={styles.handleWrapper}>
              <View style={[styles.handleBar, { backgroundColor: colors.borderLight }]} />
            </View>

            {/* Modal Header */}
            <View style={[styles.headerRow, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.titleRow}>
                <View style={[styles.headerIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <MaterialCommunityIcons
                    name={item ? 'package-variant' : 'package-variant-closed'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {item ? 'Edit Product' : 'Add New Product'}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {item ? 'Update price, presets & details' : 'Save preset item to store catalog'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body (flex: 1 with generous padding) */}
            <ScrollView
              style={styles.scrollForm}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* 1. Product Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  PRODUCT NAME <Text style={{ color: colors.primary }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.textInputBox,
                    {
                      borderColor: name.trim() ? colors.primary : colors.borderLight,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="tag-text-outline"
                    size={20}
                    color={name.trim() ? colors.primary : colors.textMuted}
                    style={styles.inputLeadingIcon}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.textPrimary }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Basmati Rice, Sunflower Oil"
                    placeholderTextColor={colors.textMuted}
                    autoFocus={!item}
                  />
                  {name.length > 0 && (
                    <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* 2. Dual Prices: Sale Price & Purchase Price */}
              <View style={styles.inputsRow}>
                {/* Sale Price (₹) */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    SALE PRICE (₹) <Text style={{ color: colors.primary }}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.textInputBox,
                      {
                        borderColor: price ? colors.primary : colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <Text style={[styles.currencyPrefix, { color: colors.primary }]}>₹</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary, fontWeight: '800' }]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Purchase Price (₹) */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    PURCHASE PRICE (₹)
                  </Text>
                  <View
                    style={[
                      styles.textInputBox,
                      {
                        borderColor: purchasePrice ? colors.secondary : colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <Text style={[styles.currencyPrefix, { color: colors.secondary || '#D97706' }]}>₹</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary, fontWeight: '700' }]}
                      value={purchasePrice}
                      onChangeText={setPurchasePrice}
                      placeholder="0.00 (Cost)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* 3. In Stock Quantity & Unit Row */}
              <View style={styles.inputsRow}>
                {/* In Stock Quantity */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    IN STOCK (QTY)
                  </Text>
                  <View
                    style={[
                      styles.textInputBox,
                      {
                        borderColor: stockQuantity ? '#10B981' : colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="package-variant-closed"
                      size={18}
                      color={stockQuantity ? '#10B981' : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary, fontWeight: '700' }]}
                      value={stockQuantity}
                      onChangeText={setStockQuantity}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Unit Selector */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    UNIT <Text style={{ color: colors.primary }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownBtn,
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
                    <Text style={[styles.dropdownBtnTxt, { color: colors.textPrimary }]}>{unit}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Price Trend Delta Live Preview Banner */}
              {priceTrend && (
                <View
                  style={[
                    styles.trendPreviewBanner,
                    { backgroundColor: priceTrend.badgeBg, borderColor: priceTrend.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={priceTrend.isUp ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={priceTrend.color}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trendPreviewTitle, { color: priceTrend.color }]}>
                      {priceTrend.isUp ? 'Price Increased' : 'Price Dropped'} {priceTrend.arrow} {priceTrend.pctText}
                    </Text>
                    <Text style={[styles.trendPreviewSub, { color: colors.textSecondary }]}>
                      Was ₹{priceTrend.oldPrice} → New Rate ₹{priceTrend.newPrice}
                    </Text>
                  </View>
                </View>
              )}

              {/* 5. Default Discount (%) & Category Row */}
              <View style={styles.inputsRow}>
                {/* Default Discount (%) */}
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    DEFAULT DISC (%)
                  </Text>
                  <View
                    style={[
                      styles.textInputBox,
                      {
                        borderColor: discount ? '#8B5CF6' : colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="percent-outline"
                      size={18}
                      color={discount ? '#8B5CF6' : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary }]}
                      value={discount}
                      onChangeText={setDiscount}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Category Picker */}
                <View style={[styles.inputWrapper, { flex: 1.4 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    CATEGORY
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownBtn,
                      {
                        borderColor: colors.borderLight,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    onPress={() => {
                      setCategorySearch('');
                      setShowCategoryPicker(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dropdownBtnTxt, { color: colors.textPrimary }]} numberOfLines={1}>
                      {category}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6. Live Pricing & Profit Margin Preview Card */}
              {parseFloat(price) > 0 && (
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <View style={styles.previewCardHeader}>
                    <Text style={[styles.previewCardTitle, { color: colors.textSecondary }]}>
                      EFFECTIVE CATALOG & MARGIN
                    </Text>
                    <View
                      style={[
                        styles.unitPillBadge,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Text style={[styles.unitPillTxt, { color: colors.primary }]}>
                        per {unit}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.previewGrid}>
                    <View style={styles.previewGridCol}>
                      <Text style={[styles.previewLbl, { color: colors.textMuted }]}>
                        Sale Price
                      </Text>
                      <Text style={[styles.previewVal, { color: colors.textPrimary }]}>
                        ₹{pricingPreview.rawPrice}
                      </Text>
                    </View>

                    {pricingPreview.hasCost ? (
                      <View style={styles.previewGridCol}>
                        <Text style={[styles.previewLbl, { color: colors.textMuted }]}>
                          Cost (Purchase)
                        </Text>
                        <Text style={[styles.previewVal, { color: colors.textSecondary }]}>
                          ₹{pricingPreview.costPrice}
                        </Text>
                      </View>
                    ) : null}

                    {pricingPreview.hasCost ? (
                      <View style={styles.previewGridCol}>
                        <Text style={[styles.previewLbl, { color: pricingPreview.isProfitable ? '#10B981' : '#EF4444' }]}>
                          Unit Profit Margin
                        </Text>
                        <Text
                          style={[
                            styles.previewVal,
                            { color: pricingPreview.isProfitable ? '#10B981' : '#EF4444', fontWeight: '800' },
                          ]}
                        >
                          {parseFloat(pricingPreview.profitPerUnit) >= 0 ? '+' : ''}₹{pricingPreview.profitPerUnit} ({pricingPreview.marginPct}%)
                        </Text>
                      </View>
                    ) : null}

                    {pricingPreview.hasDiscount ? (
                      <View style={styles.previewGridCol}>
                        <Text style={[styles.previewLbl, { color: '#8B5CF6' }]}>
                          Net Sale ({pricingPreview.discPct}% Disc)
                        </Text>
                        <Text style={[styles.previewVal, { color: colors.success, fontWeight: '800' }]}>
                          ₹{pricingPreview.finalRate}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* 6. Fixed Bottom Action Buttons */}
            <View
              style={[
                styles.modalActionsRow,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.borderLight,
                },
              ]}
            >
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
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="scale" size={20} color={colors.primary} />
                      <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                        Select Unit
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                      <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.pickerSearchBox,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
                    <TextInput
                      style={[styles.pickerSearch, { color: colors.textPrimary }]}
                      placeholder="Search unit (KG, PCS, L, PKT...)"
                      placeholderTextColor={colors.textMuted}
                      value={unitSearch}
                      onChangeText={setUnitSearch}
                      autoFocus
                    />
                  </View>

                  <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                    {filteredUnits.map((u) => {
                      const isSelected = unit === u.code;
                      return (
                        <TouchableOpacity
                          key={u.code}
                          style={[
                            styles.pickerItem,
                            isSelected && { backgroundColor: colors.primaryLight },
                          ]}
                          onPress={() => {
                            setUnit(u.code);
                            setShowUnitPicker(false);
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text
                              style={[
                                styles.pickerItemCode,
                                { color: isSelected ? colors.primary : colors.textPrimary },
                              ]}
                            >
                              {u.code}
                            </Text>
                            <Text style={[styles.pickerItemLabel, { color: colors.textSecondary }]}>
                              {u.label}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>{u.category}</Text>
                        </TouchableOpacity>
                      );
                    })}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="shape-outline" size={20} color={colors.primary} />
                      <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>
                        Select Category
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                      <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.pickerSearchBox,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="magnify" size={18} color={colors.textMuted} />
                    <TextInput
                      style={[styles.pickerSearch, { color: colors.textPrimary }]}
                      placeholder="Search or filter category..."
                      placeholderTextColor={colors.textMuted}
                      value={categorySearch}
                      onChangeText={setCategorySearch}
                      autoFocus
                    />
                  </View>

                  <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
                    {filteredCategories.map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.pickerItem,
                            isSelected && { backgroundColor: colors.primaryLight },
                          ]}
                          onPress={() => {
                            setCategory(cat);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemLabel,
                              {
                                color: isSelected ? colors.primary : colors.textPrimary,
                                fontWeight: isSelected ? '800' : '500',
                              },
                            ]}
                          >
                            {cat}
                          </Text>
                          {isSelected && (
                            <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '88%',
    maxHeight: '94%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollForm: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  trendPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  trendPreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  trendPreviewSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  previewCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewCardTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  unitPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  unitPillTxt: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  previewGridCol: {
    width: '48%',
    marginBottom: 4,
  },
  previewLbl: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewVal: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.6,
    height: 48,
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
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
  pickerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
    marginBottom: 10,
  },
  pickerSearch: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  pickerItemCode: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 44,
  },
  pickerItemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
