/**
 * components/SaleScreen/AddItemModal.tsx
 * 
 * Interactive Item Selector & Adder for the POS Sale Screen.
 * Features:
 * - Clean item name entry
 * - Quantity decimal/integer input
 * - Unit Dropdown selector with searchable dialog + custom unit text support
 * - Unit Price (₹) rate input
 * - Discount (%) input
 * - Automatic Real-Time Calculations Engine:
 *   - Gross Total (Qty × Price)
 *   - Total Discount Amount & Savings
 *   - Effective Discounted Unit Rate
 *   - Final Net Amount Payable
 * - Bound directly to FlashBill branding colors (constants/theme.ts)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceItem } from '../../types/billing';
import { PresetItem } from '../../types/item';
import { formatItemName, formatUnit } from '../../utils/formatters';

export interface UnitOption {
  label: string;
  code: string;
  category: string;
}

export const RETAIL_UNITS: UnitOption[] = [
  // Common Retail Units
  { label: 'Kilogram', code: 'Kg', category: 'Weight' },
  { label: 'Gram', code: 'Gm', category: 'Weight' },
  { label: 'Piece', code: 'Pcs', category: 'Count' },
  { label: 'Packet', code: 'Pkt', category: 'Count' },
  { label: 'Dozen', code: 'Doz', category: 'Count' },
  { label: 'Litre', code: 'L', category: 'Volume' },
  { label: 'Millilitre', code: 'Ml', category: 'Volume' },
  { label: 'Box', code: 'Box', category: 'Count' },
  { label: 'Bag', code: 'Bag', category: 'Count' },
  { label: 'Bundle', code: 'Bdl', category: 'Count' },
  { label: 'Bottle', code: 'Btl', category: 'Volume' },
  { label: 'Can', code: 'Can', category: 'Volume' },
  { label: 'Tin', code: 'Tin', category: 'Volume' },
  { label: 'Carton', code: 'Ctn', category: 'Count' },
  { label: 'Roll', code: 'Roll', category: 'Count' },
  { label: 'Quintal', code: 'Qtl', category: 'Weight' },
  { label: 'Metric Ton', code: 'Ton', category: 'Weight' },
  { label: 'Plate', code: 'Plt', category: 'Count' },
  { label: 'Cup', code: 'Cup', category: 'Count' },
  { label: 'Pair', code: 'Pr', category: 'Count' },
  { label: 'Set', code: 'Set', category: 'Count' },
  { label: 'Meter', code: 'M', category: 'Length' },
  { label: 'Square Feet', code: 'Sqft', category: 'Area' },
];

interface AddItemModalProps {
  visible: boolean;
  itemIndex: number;
  presetItems?: PresetItem[];
  editingItem?: InvoiceItem | null;
  editingIndex?: number | null;
  onClose: () => void;
  onAddItem: (item: InvoiceItem) => void;
  onUpdateItem?: (item: InvoiceItem, index: number) => void;
}

export function AddItemModal({
  visible,
  itemIndex,
  presetItems = [],
  editingItem,
  editingIndex,
  onClose,
  onAddItem,
  onUpdateItem,
}: AddItemModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const [itemName, setItemName] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [unit, setUnit] = useState<string>('Kg');
  const [price, setPrice] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');

  // Keypad Tab / Next Navigation Refs
  const itemNameRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const discountRef = useRef<TextInput>(null);

  // Catalog Auto-Suggestions State
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Synchronize state when modal opens or editingItem changes
  useEffect(() => {
    if (visible) {
      if (editingItem) {
        setItemName(formatItemName(editingItem.name || ''));
        setQty(editingItem.qty || '');
        setUnit(formatUnit(editingItem.unit || 'Kg'));
        setPrice(editingItem.price || '');
        setDiscountPercent(editingItem.discountPercent || '');
        setSelectedPresetId(editingItem.itemId || null);
        setShowSuggestions(false);
      } else {
        setItemName('');
        setQty('');
        setUnit('Kg');
        setPrice('');
        setDiscountPercent('');
        setSelectedPresetId(null);
        setShowSuggestions(true);
      }
    }
  }, [visible, editingItem]);

  // Live filtered suggestions from catalog presets
  const suggestions = useMemo(() => {
    if (!itemName.trim() || !presetItems || presetItems.length === 0) return [];
    const q = itemName.toLowerCase().trim();
    return presetItems
      .filter((it) => it.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [itemName, presetItems]);

  const handleSelectSuggestion = (selected: PresetItem) => {
    setSelectedPresetId(selected.id);
    setItemName(formatItemName(selected.name));
    setUnit(formatUnit(selected.unit || 'Kg'));
    setPrice(selected.price || '');
    setDiscountPercent(selected.defaultDiscount || '');
    setShowSuggestions(false);
    setTimeout(() => {
      qtyRef.current?.focus();
    }, 50);
  };

  // Unit Picker Dropdown State
  const [showUnitPicker, setShowUnitPicker] = useState<boolean>(false);
  const [unitSearch, setUnitSearch] = useState<string>('');

  // Filtered units based on search query
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

  // Real-time dynamic calculation of all financial metrics
  const calcs = useMemo(() => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const dPct = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));

    // Gross Amount (Qty * Rate)
    const gross = q * p;

    // Discount Amount
    const discAmt = (gross * dPct) / 100;

    // Final Net Amount
    const net = Math.max(0, gross - discAmt);

    // Discounted unit rate
    const effRate = q > 0 ? net / q : 0;

    return {
      grossTotal: gross.toFixed(2).replace(/\.00$/, ''),
      discountAmount: discAmt.toFixed(2).replace(/\.00$/, ''),
      discountPercentNum: dPct,
      netAmount: net.toFixed(2).replace(/\.00$/, ''),
      effectiveRate: effRate.toFixed(2).replace(/\.00$/, ''),
      hasCalculations: q > 0 && p > 0,
      hasDiscount: discAmt > 0,
    };
  }, [qty, price, discountPercent]);

  // Add or Update Item in Bill
  const handleAdd = () => {
    const finalName = formatItemName(itemName) || 'GENERAL ITEM';
    const cleanQty = qty.trim();
    if (!cleanQty || parseFloat(cleanQty) <= 0) {
      qtyRef.current?.focus();
      return;
    }
    const finalUnit = formatUnit(unit) || 'Pcs';
    const finalPrice = price.trim() || '0';
    const finalAmt = calcs.netAmount || '0';

    // Link preset item id if selected or if matched by name
    let linkedId = selectedPresetId;
    if (!linkedId && presetItems && presetItems.length > 0) {
      const match = presetItems.find(
        (p) => p.name.trim().toLowerCase() === finalName.toLowerCase()
      );
      if (match) linkedId = match.id;
    }

    const payload: InvoiceItem = {
      sNo: (editingItem && editingIndex !== null && editingIndex !== undefined ? editingIndex + 1 : itemIndex).toString(),
      itemId: linkedId || undefined,
      name: finalName,
      qty: cleanQty,
      unit: finalUnit,
      price: finalPrice,
      discountPercent: calcs.hasDiscount ? calcs.discountPercentNum.toString() : undefined,
      discountAmount: calcs.hasDiscount ? calcs.discountAmount : undefined,
      amt: finalAmt,
    };

    if (editingItem && onUpdateItem && editingIndex !== null && editingIndex !== undefined) {
      onUpdateItem(payload, editingIndex);
    } else {
      onAddItem(payload);
    }

    // Reset fields and close
    setSelectedPresetId(null);
    setItemName('');
    setQty('');
    setPrice('');
    setDiscountPercent('');
    setUnit('Kg');
    setShowSuggestions(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Fullscreen touchable backdrop: clicking outside dismisses modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close add item modal"
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
                      name={editingItem ? 'pencil' : 'cart-plus'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {editingItem
                      ? `Edit Item #${(editingIndex !== null && editingIndex !== undefined ? editingIndex + 1 : itemIndex)}`
                      : 'Add Item to Sale'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollForm}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {/* 1. Item Name Input */}
                <View style={styles.inputWrapper}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    ITEM NAME <Text style={{ color: colors.primary }}>*</Text>
                  </Text>
                  <TextInput
                    ref={itemNameRef}
                    style={[
                      styles.textInput,
                      {
                        borderColor: itemName ? colors.primary : colors.borderLight,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={itemName}
                    onChangeText={(txt) => {
                      setItemName(txt.toUpperCase());
                      setSelectedPresetId(null);
                      setShowSuggestions(true);
                    }}
                    autoCapitalize="characters"
                    placeholder="e.g. BASMATI RICE, SUNFLOWER OIL"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => qtyRef.current?.focus()}
                  />

                  {/* Instant Auto-Suggestion Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <View
                      style={[
                        styles.suggestionsContainer,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.borderLight,
                          shadowColor: isDark ? '#000000' : '#8899A6',
                        },
                      ]}
                    >
                      <View style={styles.suggestionHeaderRow}>
                        <Text style={[styles.suggestionHeaderTxt, { color: colors.textMuted }]}>
                          CATALOG PRESETS (TAP TO AUTO-FILL)
                        </Text>
                        <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                          <MaterialCommunityIcons name="close" size={14} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                      {suggestions.map((sug) => {
                        const stock = sug.stockQuantity;
                        const hasStock = stock !== undefined;
                        const isOutOfStock = typeof stock === 'number' && stock <= 0;
                        const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 10;

                        return (
                          <TouchableOpacity
                            key={sug.id}
                            style={[
                              styles.suggestionItem,
                              { borderTopColor: colors.borderLight },
                            ]}
                            onPress={() => handleSelectSuggestion(sug)}
                            activeOpacity={0.7}
                          >
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={[styles.suggestionItemName, { color: colors.textPrimary }]}>
                                {formatItemName(sug.name)}
                              </Text>
                              <View style={styles.suggestionMetaRow}>
                                <Text style={[styles.suggestionItemCat, { color: colors.textSecondary }]}>
                                  {sug.category || 'General'}
                                </Text>
                                {hasStock && (
                                  <Text
                                    style={[
                                      styles.suggestionStockTxt,
                                      {
                                        color: isOutOfStock
                                          ? colors.error
                                          : isLowStock
                                          ? '#D97706'
                                          : colors.success,
                                      },
                                    ]}
                                  >
                                    • {isOutOfStock ? 'Out of stock' : `Stock: ${stock} ${formatUnit(sug.unit)}`}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View style={styles.suggestionRightCol}>
                              <Text style={[styles.suggestionItemPrice, { color: colors.primary }]}>
                                ₹{sug.price} <Text style={{ fontSize: 11, color: colors.textMuted }}>/{formatUnit(sug.unit)}</Text>
                              </Text>
                              {sug.defaultDiscount && parseFloat(sug.defaultDiscount) > 0 ? (
                                <Text style={[styles.suggestionItemDisc, { color: '#8B5CF6' }]}>
                                  {sug.defaultDiscount}% Disc
                                </Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 2. Quantity & Unit Row */}
                <View style={styles.inputsRow}>
                  {/* Quantity Input */}
                  <View style={[styles.inputWrapper, { flex: 1.1 }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      QUANTITY <Text style={{ color: colors.primary }}>*</Text>
                    </Text>
                    <TextInput
                      ref={qtyRef}
                      style={[
                        styles.textInput,
                        {
                          borderColor: qty ? colors.primary : colors.borderLight,
                          color: colors.textPrimary,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      value={qty}
                      onChangeText={setQty}
                      placeholder="e.g. 2"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => priceRef.current?.focus()}
                    />
                  </View>

                  {/* Unit Dropdown Trigger */}
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
                      <Text style={[styles.unitBtnTxt, { color: colors.textPrimary }]}>
                        {formatUnit(unit)}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Unit Price & Discount (%) Row */}
                <View style={styles.inputsRow}>
                  {/* Unit Price (₹) Input */}
                  <View style={[styles.inputWrapper, { flex: 1.1 }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      UNIT PRICE (₹) <Text style={{ color: colors.primary }}>*</Text>
                    </Text>
                    <TextInput
                      ref={priceRef}
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
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => discountRef.current?.focus()}
                    />
                  </View>

                  {/* Discount (%) Input */}
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      DISCOUNT (%)
                    </Text>
                    <TextInput
                      ref={discountRef}
                      style={[
                        styles.textInput,
                        {
                          borderColor: discountPercent ? colors.primary : colors.borderLight,
                          color: colors.textPrimary,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      value={discountPercent}
                      onChangeText={setDiscountPercent}
                      placeholder="0%"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      onSubmitEditing={handleAdd}
                    />
                  </View>
                </View>

                {/* 4. Automatic Real-Time Calculations Breakdown Card */}
                {calcs.hasCalculations ? (
                  <View
                    style={[
                      styles.calcCard,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.calcHeaderRow}>
                      <Text style={[styles.calcHeaderTitle, { color: colors.textSecondary }]}>
                        AUTOMATIC CALCULATION
                      </Text>
                      {calcs.hasDiscount ? (
                        <View style={[styles.saveBadge, { backgroundColor: colors.successLight }]}>
                          <Text style={[styles.saveBadgeTxt, { color: colors.success }]}>
                            🎉 Save ₹{calcs.discountAmount}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Gross Price */}
                    <View style={styles.calcMetricRow}>
                      <Text style={[styles.calcMetricLbl, { color: colors.textSecondary }]}>
                        Gross Price ({qty} {unit} × ₹{price}):
                      </Text>
                      <Text style={[styles.calcMetricVal, { color: colors.textPrimary }]}>
                        ₹{calcs.grossTotal}
                      </Text>
                    </View>

                    {/* Discount row if applied */}
                    {calcs.hasDiscount ? (
                      <>
                        <View style={styles.calcMetricRow}>
                          <Text style={[styles.calcMetricLbl, { color: colors.success }]}>
                            Discount ({calcs.discountPercentNum}%):
                          </Text>
                          <Text style={[styles.calcMetricVal, { color: colors.success, fontWeight: '800' }]}>
                            -₹{calcs.discountAmount}
                          </Text>
                        </View>
                        <View style={styles.calcMetricRow}>
                          <Text style={[styles.calcMetricLbl, { color: colors.textMuted }]}>
                            Effective Rate:
                          </Text>
                          <Text style={[styles.calcMetricVal, { color: colors.textSecondary }]}>
                            ₹{calcs.effectiveRate} / {unit}
                          </Text>
                        </View>
                      </>
                    ) : null}

                    <View style={[styles.calcDivider, { backgroundColor: colors.borderLight }]} />

                    {/* Final Line Amount Payable */}
                    <View style={styles.calcFinalRow}>
                      <Text style={[styles.calcFinalLbl, { color: colors.textPrimary }]}>
                        Total Price:
                      </Text>
                      <Text style={[styles.calcFinalVal, { color: colors.primary }]}>
                        ₹{calcs.netAmount}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>

              {/* 5. Fixed Footer Action Button (+ Add to Bill) */}
              <View
                style={[
                  styles.fixedFooter,
                  { borderTopColor: colors.borderLight },
                ]}
              >
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
                  <MaterialCommunityIcons
                    name={editingItem ? 'check' : 'plus'}
                    size={22}
                    color="#FFFFFF"
                  />
                  <Text style={styles.addBtnTxt}>
                    {editingItem ? 'Save Changes' : 'Add to Bill'} {calcs.hasCalculations ? `• ₹${calcs.netAmount}` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>

      {/* --- Unit Selection Modal (Searchable Dropdown + Custom Unit Input) --- */}
      <Modal
        visible={showUnitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowUnitPicker(false)}>
          <View style={styles.unitModalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={[
                  styles.unitModalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Modal Title */}
                <View style={styles.unitModalHeader}>
                  <Text style={[styles.unitModalTitle, { color: colors.textPrimary }]}>
                    Select Measurement Unit
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowUnitPicker(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Search / Custom Unit Input */}
                <View style={styles.unitSearchWrapper}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    style={[
                      styles.unitSearchInput,
                      { color: colors.textPrimary },
                    ]}
                    value={unitSearch}
                    onChangeText={setUnitSearch}
                    placeholder="Search unit or type custom..."
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                  {unitSearch ? (
                    <TouchableOpacity onPress={() => setUnitSearch('')}>
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Custom Unit Option Banner (if typed) */}
                {unitSearch.trim().length > 0 ? (
                  <TouchableOpacity
                    style={[
                      styles.customUnitBanner,
                      { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                    ]}
                    onPress={() => {
                      setUnit(formatUnit(unitSearch.trim()));
                      setShowUnitPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.customUnitTxt, { color: colors.primary }]}>
                      Use Custom Unit: "{formatUnit(unitSearch.trim())}"
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* Units List */}
                <FlatList
                  data={filteredUnits}
                  keyExtractor={(item) => item.code}
                  style={styles.unitList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = unit === item.code;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.unitItemRow,
                          {
                            backgroundColor: isSelected
                              ? colors.primaryLight
                              : 'transparent',
                            borderColor: isSelected
                              ? colors.primary
                              : colors.borderLight,
                          },
                        ]}
                        onPress={() => {
                          setUnit(item.code);
                          setShowUnitPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.unitItemLeft}>
                          <Text
                            style={[
                              styles.unitItemCode,
                              {
                                color: isSelected
                                  ? colors.primary
                                  : colors.textPrimary,
                              },
                            ]}
                          >
                            {item.code}
                          </Text>
                          <Text
                            style={[
                              styles.unitItemLabel,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>

                        <Text style={[styles.unitCategoryBadge, { color: colors.textMuted }]}>
                          {item.category}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    height: '92%',
    maxHeight: '95%',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scrollForm: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  fixedFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    width: '100%',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapper: {
    position: 'relative',
    marginVertical: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  textInput: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    fontWeight: '600',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitDropdownBtn: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitBtnTxt: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  calcCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  calcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  saveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  saveBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  calcMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  calcMetricLbl: {
    fontSize: 12,
    fontWeight: '600',
  },
  calcMetricVal: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  calcDivider: {
    height: 1,
    marginVertical: 8,
  },
  calcFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcFinalLbl: {
    fontSize: 14,
    fontWeight: '800',
  },
  calcFinalVal: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Unit Picker Modal Styles
  unitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unitModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  unitModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  unitSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  unitSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  customUnitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  customUnitTxt: {
    fontSize: 13,
    fontWeight: '800',
  },
  unitList: {
    maxHeight: 280,
  },
  unitItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  unitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitItemCode: {
    fontSize: 14,
    fontWeight: '900',
    minWidth: 44,
  },
  unitItemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  unitCategoryBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionHeaderTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  suggestionItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionItemCat: {
    fontSize: 11,
    fontWeight: '500',
  },
  suggestionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 1,
  },
  suggestionStockTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionRightCol: {
    alignItems: 'flex-end',
  },
  suggestionItemPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  suggestionItemDisc: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
});
