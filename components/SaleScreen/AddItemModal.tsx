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
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceItem } from '../../types/billing';

export interface UnitOption {
  label: string;
  code: string;
  category: string;
}

export const RETAIL_UNITS: UnitOption[] = [
  // Common Retail Units
  { label: 'Kilogram', code: 'KG', category: 'Weight' },
  { label: 'Gram', code: 'G', category: 'Weight' },
  { label: 'Piece', code: 'PCS', category: 'Count' },
  { label: 'Packet', code: 'PKT', category: 'Count' },
  { label: 'Dozen', code: 'DZ', category: 'Count' },
  { label: 'Litre', code: 'L', category: 'Volume' },
  { label: 'Millilitre', code: 'ML', category: 'Volume' },
  { label: 'Box', code: 'BOX', category: 'Count' },
  { label: 'Bag', code: 'BAG', category: 'Count' },
  { label: 'Bundle', code: 'BDL', category: 'Count' },
  { label: 'Bottle', code: 'BTL', category: 'Volume' },
  { label: 'Can', code: 'CAN', category: 'Volume' },
  { label: 'Tin', code: 'TIN', category: 'Volume' },
  { label: 'Carton', code: 'CTN', category: 'Count' },
  { label: 'Roll', code: 'ROLL', category: 'Count' },
  { label: 'Quintal', code: 'QTL', category: 'Weight' },
  { label: 'Metric Ton', code: 'TON', category: 'Weight' },
  { label: 'Plate', code: 'PLT', category: 'Count' },
  { label: 'Cup', code: 'CUP', category: 'Count' },
  { label: 'Pair', code: 'PR', category: 'Count' },
  { label: 'Set', code: 'SET', category: 'Count' },
  { label: 'Meter', code: 'M', category: 'Length' },
  { label: 'Square Feet', code: 'SQFT', category: 'Area' },
];

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

  const [itemName, setItemName] = useState<string>('');
  const [qty, setQty] = useState<string>('1');
  const [unit, setUnit] = useState<string>('KG');
  const [price, setPrice] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');

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

  // Add Item to Bill
  const handleAdd = () => {
    const finalName = itemName.trim() || 'General Item';
    const finalQty = qty.trim() || '1';
    const finalUnit = unit.trim().toUpperCase() || 'PCS';
    const finalPrice = price.trim() || '0';
    const finalAmt = calcs.netAmount || '0';

    onAddItem({
      sNo: itemIndex.toString(),
      name: finalName,
      qty: finalQty,
      unit: finalUnit,
      price: finalPrice,
      discountPercent: calcs.hasDiscount ? calcs.discountPercentNum.toString() : undefined,
      discountAmount: calcs.hasDiscount ? calcs.discountAmount : undefined,
      amt: finalAmt,
    });

    // Reset fields and close
    setItemName('');
    setQty('1');
    setPrice('');
    setDiscountPercent('');
    setUnit('KG');
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
                <View style={styles.titleRow}>
                  <View style={[styles.headerIconCircle, { backgroundColor: colors.primaryLight }]}>
                    <MaterialCommunityIcons
                      name="cart-plus"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Add Item to Sale
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
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollForm}
              >
                {/* 1. Item Name Input */}
                <View style={styles.inputWrapper}>
                  <View
                    style={[
                      styles.floatingBadge,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                      Item Name *
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
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. Basmati Rice, Sunflower Oil"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                </View>

                {/* 2. Quantity & Unit Row */}
                <View style={styles.inputsRow}>
                  {/* Quantity Input */}
                  <View style={[styles.inputWrapper, { flex: 1.1 }]}>
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
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      value={qty}
                      onChangeText={setQty}
                      placeholder="e.g. 2"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Unit Dropdown Trigger */}
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <View
                      style={[
                        styles.floatingBadge,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                        Unit *
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.unitDropdownBtn,
                        {
                          borderColor: colors.borderLight,
                          backgroundColor: colors.surfaceLight,
                        },
                      ]}
                      onPress={() => {
                        setUnitSearch('');
                        setShowUnitPicker(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.unitBtnTxt, { color: colors.textPrimary }]}>
                        {unit}
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
                    <View
                      style={[
                        styles.floatingBadge,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                        Unit Price (₹) *
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Discount (%) Input */}
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <View
                      style={[
                        styles.floatingBadge,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                        Discount (%)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          borderColor: colors.borderLight,
                          color: colors.textPrimary,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      value={discountPercent}
                      onChangeText={setDiscountPercent}
                      placeholder="0%"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
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

                {/* 5. Add to Bill Action Button */}
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
                    name="plus"
                    size={22}
                    color="#FFFFFF"
                  />
                  <Text style={styles.addBtnTxt}>
                    Add to Bill {calcs.hasCalculations ? `• ₹${calcs.netAmount}` : ''}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

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
                      setUnit(unitSearch.trim().toUpperCase());
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
                      Use Custom Unit: "{unitSearch.trim().toUpperCase()}"
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
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    paddingBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    marginVertical: 8,
  },
  floatingBadge: {
    position: 'absolute',
    top: -9,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 6,
  },
  floatingLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitDropdownBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
});
