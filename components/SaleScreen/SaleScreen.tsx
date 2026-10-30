/**
 * components/SaleScreen/SaleScreen.tsx
 * 
 * Complete POS "New Sale" Screen matching the provided designs.
 * Features:
 * - Top Bar: Back arrow, "Sale" title, [Credit | Cash] toggle pill, settings gear
 * - Subheader: "Invoice No." (starts from 1) & "Date" (both tap to open custom popups)
 * - Outlined floating-label "Customer *" input
 * - Outlined "Phone Number" input
 * - "+ Add Items (Optional)" action with dynamic items list (Qty, Units, Discount, Rate)
 * - Dynamic Summary Breakdown: Subtotal, Total Discount, Final Amount
 * - Plan notice banner
 * - Bottom Bar: "Save & New" and "Save" (Primary CTA) buttons with "⋮" menu
 * - Fully bound to FlashBill branding colors (constants/theme.ts) in both Dark & Light modes!
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData, InvoiceItem } from '../../types/billing';
import { ChangeInvoiceModal } from './ChangeInvoiceModal';
import { CalendarModal } from './CalendarModal';
import { AddItemModal } from './AddItemModal';

interface SaleScreenProps {
  initialInvoiceNo?: number;
  shopName: string;
  onBack: () => void;
  onSaveInvoice: (invoice: InvoiceData, shouldPrint?: boolean) => void;
}

export function SaleScreen({
  initialInvoiceNo = 1,
  shopName,
  onBack,
  onSaveInvoice,
}: SaleScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Payment mode toggle: 'credit' vs 'cash'
  const [paymentMode, setPaymentMode] = useState<'credit' | 'cash'>('credit');

  // Invoice Number state (starts from 1 by default!)
  const [invoiceNo, setInvoiceNo] = useState<string>(
    initialInvoiceNo.toString()
  );
  const [invoicePrefix, setInvoicePrefix] = useState<string>('');

  // Date state
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  // Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Cart / Items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);

  // Format date as DD/MM/YYYY
  const formattedDate = useMemo(() => {
    const day = String(saleDate.getDate()).padStart(2, '0');
    const month = String(saleDate.getMonth() + 1).padStart(2, '0');
    const year = saleDate.getFullYear();
    return `${day}/${month}/${year}`;
  }, [saleDate]);

  // Combined full invoice number string (e.g. "1" or "INV-1")
  const fullInvoiceNumber = useMemo(() => {
    return invoicePrefix ? `${invoicePrefix}${invoiceNo}` : invoiceNo;
  }, [invoicePrefix, invoiceNo]);

  // Live calculations across all items
  const { subtotal, totalDiscount, finalAmount, totalQty, hasDiscount } = useMemo(() => {
    let grossSum = 0;
    let discSum = 0;
    let netSum = 0;
    let qtySum = 0;

    for (const item of items) {
      const q = parseFloat(item.qty) || 0;
      const p = parseFloat(item.price) || 0;
      const lineGross = q * p;
      const lineNet = parseFloat(item.amt) || lineGross;
      const lineDisc = parseFloat(item.discountAmount || '0') || Math.max(0, lineGross - lineNet);

      grossSum += lineGross;
      discSum += lineDisc;
      netSum += lineNet;
      qtySum += q;
    }

    return {
      subtotal: grossSum.toFixed(2).replace(/\.00$/, ''),
      totalDiscount: discSum.toFixed(2).replace(/\.00$/, ''),
      finalAmount: netSum.toFixed(2).replace(/\.00$/, ''),
      totalQty: qtySum.toString(),
      hasDiscount: discSum > 0,
    };
  }, [items]);

  // Add Item callback
  const handleAddItem = (newItem: InvoiceItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, sNo: (idx + 1).toString() }))
    );
  };

  // Save invoice payload helper
  const buildInvoicePayload = (): InvoiceData => {
    const finalItems = items.length > 0 ? items : [
      {
        sNo: '1',
        name: 'General Item',
        qty: '1',
        unit: 'PCS',
        price: finalAmount && finalAmount !== '0' ? finalAmount : '100',
        amt: finalAmount && finalAmount !== '0' ? finalAmount : '100',
      },
    ];

    const currentFinal = finalAmount && finalAmount !== '0' ? finalAmount : '100';

    return {
      shopName: 'Billing Receipt',
      date: formattedDate,
      invoiceNo: fullInvoiceNumber,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: phoneNumber.trim() || undefined,
      items: finalItems,
      totalQty: items.length > 0 ? totalQty : '1',
      subtotal: subtotal && subtotal !== '0' ? subtotal : currentFinal,
      totalDiscount: totalDiscount || '0.00',
      finalAmount: currentFinal,
      grandTotal: currentFinal,
    };
  };

  // Handle Save
  const handleSave = (andNew = false) => {
    const invoice = buildInvoicePayload();
    onSaveInvoice(invoice, false);

    if (andNew) {
      // Auto-increment invoice number for next sale
      const nextNum = (parseInt(invoiceNo, 10) || 1) + 1;
      setInvoiceNo(nextNum.toString());
      setCustomerName('');
      setPhoneNumber('');
      setItems([]);
      Alert.alert(
        'Invoice Saved',
        `Invoice #${fullInvoiceNumber} saved! Ready for Invoice #${invoicePrefix}${nextNum}.`
      );
    } else {
      Alert.alert(
        'Invoice Saved',
        `Invoice #${fullInvoiceNumber} saved for ₹${invoice.grandTotal}!`
      );
    }
  };

  // Handle Options Menu
  const handleMoreOptions = () => {
    Alert.alert(
      'Sale Options',
      `Invoice #${fullInvoiceNumber}\nAmount: ₹${finalAmount || '0.00'}`,
      [
        {
          text: 'Print Directly to Thermal POS',
          onPress: () => {
            const invoice = buildInvoicePayload();
            onSaveInvoice(invoice, true);
          },
        },
        {
          text: 'Clear All Items',
          style: 'destructive',
          onPress: () => setItems([]),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* --- 1. Top App Bar --- */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Title: Sale */}
        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary },
          ]}
        >
          Sale
        </Text>

        {/* Mode Pill Toggle: [ Credit | Cash ] */}
        <View
          style={[
            styles.modePillContainer,
            { backgroundColor: colors.surfaceLight },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.modePill,
              paymentMode === 'credit' && { backgroundColor: colors.success },
            ]}
            onPress={() => setPaymentMode('credit')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modePillTxt,
                paymentMode === 'credit'
                  ? styles.modePillTxtActive
                  : { color: colors.textSecondary },
              ]}
            >
              Credit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modePill,
              paymentMode === 'cash' && { backgroundColor: colors.success },
            ]}
            onPress={() => setPaymentMode('cash')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modePillTxt,
                paymentMode === 'cash'
                  ? styles.modePillTxtActive
                  : { color: colors.textSecondary },
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Gear */}
        <TouchableOpacity
          style={styles.settingsBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() =>
            Alert.alert(
              'Sale Settings',
              'Configure default invoice prefixes, tax rates, and customer notes.'
            )
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* --- 2. Subheader Bar (Invoice No. & Date with Dropdowns) --- */}
      <View
        style={[
          styles.subheaderBar,
          {
            backgroundColor: colors.surfaceLight,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Invoice No. Block (Tapping opens Change Invoice No. popup) */}
        <TouchableOpacity
          style={styles.subheaderCol}
          onPress={() => setShowInvoiceModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.subLabel,
              { color: colors.textSecondary },
            ]}
          >
            Invoice No.
          </Text>
          <View style={styles.subValueRow}>
            <Text
              style={[
                styles.subValue,
                { color: colors.textPrimary },
              ]}
            >
              {fullInvoiceNumber}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View
          style={[
            styles.verticalDivider,
            { backgroundColor: colors.borderLight },
          ]}
        />

        {/* Date Block (Tapping opens Material Calendar popup) */}
        <TouchableOpacity
          style={styles.subheaderCol}
          onPress={() => setShowCalendarModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.subLabel,
              { color: colors.textSecondary },
            ]}
          >
            Date
          </Text>
          <View style={styles.subValueRow}>
            <Text
              style={[
                styles.subValue,
                { color: colors.textPrimary },
              ]}
            >
              {formattedDate}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* --- Scrollable Body Form --- */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollBodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Customer Floating-Label Outlined Input */}
        <View style={styles.inputContainer}>
          <View
            style={[
              styles.floatingLabelBadge,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.floatingLabel, { color: colors.primary }]}>
              Customer *
            </Text>
          </View>
          <TextInput
            style={[
              styles.outlinedInput,
              {
                borderColor: colors.primary,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter Customer Name"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* 4. Phone Number Outlined Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.outlinedInputPlain,
              {
                borderColor: colors.borderLight,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
              },
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        {/* 5. "+ Add Items (Optional)" Action Button */}
        {items.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.addItemsBtn,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.surface,
              },
            ]}
            onPress={() => setShowAddItemModal(true)}
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
        ) : (
          <View style={styles.itemsListContainer}>
            <View style={styles.itemsListHeader}>
              <Text
                style={[
                  styles.itemsSectionTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Added Items ({items.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddItemModal(true)}
                style={styles.addMoreBtn}
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

            {items.map((item, index) => {
              const unitDisplay = item.unit ? ` ${item.unit}` : ' PCS';
              const hasDisc = item.discountPercent && parseFloat(item.discountPercent) > 0;

              return (
                <View
                  key={index}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      <Text
                        style={[
                          styles.itemFormula,
                          { color: colors.textSecondary },
                        ]}
                      >
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

                  <View style={styles.itemAmountCol}>
                    <Text
                      style={[
                        styles.itemAmt,
                        { color: colors.textPrimary },
                      ]}
                    >
                      ₹{item.amt}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={18}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 6. Dynamic Summary Breakdown Section */}
        <View
          style={[
            styles.summarySection,
            { borderTopColor: colors.border },
          ]}
        >
          {items.length > 0 && hasDiscount ? (
            <>
              <View style={styles.summarySubRow}>
                <Text style={[styles.subRowLabel, { color: colors.textSecondary }]}>
                  Subtotal
                </Text>
                <Text style={[styles.subRowValue, { color: colors.textPrimary }]}>
                  ₹{subtotal}
                </Text>
              </View>
              <View style={styles.summarySubRow}>
                <Text style={[styles.subRowLabel, { color: colors.success }]}>
                  Total Discount
                </Text>
                <Text style={[styles.subRowValue, { color: colors.success, fontWeight: '800' }]}>
                  -₹{totalDiscount}
                </Text>
              </View>
            </>
          ) : null}

          {/* Final Total Amount Row */}
          <View style={styles.totalRow}>
            <View>
              <Text
                style={[
                  styles.totalLabel,
                  { color: colors.textPrimary },
                ]}
              >
                Total Amount
              </Text>
              {items.length > 0 ? (
                <Text style={[styles.itemsSummaryTxt, { color: colors.textSecondary }]}>
                  {items.length} items • {totalQty} total qty
                </Text>
              ) : null}
            </View>

            <View style={styles.totalValueRow}>
              <Text
                style={[
                  styles.rupeeSymbol,
                  { color: colors.textPrimary },
                ]}
              >
                ₹
              </Text>
              {finalAmount && finalAmount !== '0' ? (
                <Text
                  style={[
                    styles.totalNumber,
                    { color: colors.primary },
                  ]}
                >
                  {finalAmount}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.dottedLine,
                    { color: colors.textMuted },
                  ]}
                >
                  ----------------------
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- 7. Bottom Plan Notice Banner --- */}
      <View
        style={[
          styles.planBanner,
          {
            backgroundColor: isDark
              ? 'rgba(239, 68, 68, 0.12)'
              : '#FEE2E2',
          },
        ]}
      >
        <Text
          style={[
            styles.planBannerTxt,
            { color: colors.error },
          ]}
        >
          Your current plan may not support some features.
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={colors.error}
        />
      </View>

      {/* --- 8. Bottom Action Bar --- */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* Save & New Button */}
        <TouchableOpacity
          style={styles.saveNewBtn}
          onPress={() => handleSave(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.saveNewTxt,
              { color: colors.textPrimary },
            ]}
          >
            Save & New
          </Text>
        </TouchableOpacity>

        {/* Primary Save Button (Uses colors.primary) */}
        <TouchableOpacity
          style={[
            styles.savePrimaryBtn,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => handleSave(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.savePrimaryTxt}>Save</Text>
        </TouchableOpacity>

        {/* ⋮ More Options Trigger */}
        <TouchableOpacity
          style={styles.moreOptionsBtn}
          onPress={handleMoreOptions}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* --- Modals --- */}
      {/* 1. Change Invoice No Modal */}
      <ChangeInvoiceModal
        visible={showInvoiceModal}
        currentInvoiceNo={invoiceNo}
        currentPrefix={invoicePrefix}
        onClose={() => setShowInvoiceModal(false)}
        onSave={(newNo, prefix) => {
          setInvoiceNo(newNo);
          setInvoicePrefix(prefix);
        }}
      />

      {/* 2. Calendar Modal */}
      <CalendarModal
        visible={showCalendarModal}
        selectedDate={saleDate}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(newDate) => setSaleDate(newDate)}
      />

      {/* 3. Add Item Modal */}
      <AddItemModal
        visible={showAddItemModal}
        itemIndex={items.length + 1}
        onClose={() => setShowAddItemModal(false)}
        onAddItem={handleAddItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
  },
  modePillContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
  },
  modePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modePillTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  modePillTxtActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  settingsBtn: {
    padding: 4,
  },
  subheaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  subheaderCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 16,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  subValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  floatingLabelBadge: {
    position: 'absolute',
    top: -8,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 6,
  },
  floatingLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  outlinedInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  outlinedInputPlain: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 13,
    marginBottom: 20,
  },
  addItemsTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemsListContainer: {
    marginBottom: 20,
  },
  itemsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
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
  summarySection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  summarySubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  subRowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  subRowValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemsSummaryTxt: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '800',
  },
  totalNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  dottedLine: {
    fontSize: 14,
    letterSpacing: 1,
  },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  planBannerTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  saveNewBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNewTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  savePrimaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  savePrimaryTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moreOptionsBtn: {
    padding: 6,
  },
});
