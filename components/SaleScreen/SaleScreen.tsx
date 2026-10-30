/**
 * components/SaleScreen/SaleScreen.tsx
 * 
 * Complete POS "New Sale" Screen matching the provided designs.
 * Features:
 * - Top Bar: Back arrow, "Sale" title, [Credit | Cash] toggle pill, settings gear
 * - Subheader: "Invoice No." (starts from 1) & "Date" (both tap to open custom popups)
 * - Outlined floating-label "Customer *" input
 * - Outlined "Phone Number" input
 * - "+ Add Items (Optional)" action with dynamic items list
 * - "Total Amount" live calculation row
 * - Plan notice banner
 * - Bottom Bar: "Save & New" and "Save" (blue CTA) buttons with "⋮" menu
 * - Full Dark & Light theme integration
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

  // Live calculations
  const totalAmount = useMemo(() => {
    const sum = items.reduce((acc, item) => acc + (parseFloat(item.amt) || 0), 0);
    return sum.toFixed(2).replace(/\.00$/, '');
  }, [items]);

  const totalQty = useMemo(() => {
    const sum = items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
    return sum.toString();
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
    return {
      shopName: shopName || 'FlashBill POS',
      date: formattedDate,
      invoiceNo: fullInvoiceNumber,
      customerName: customerName.trim() || 'Walk-in Customer',
      items: items.length > 0 ? items : [
        {
          sNo: '1',
          name: 'General Retail Item',
          qty: '1',
          price: totalAmount && totalAmount !== '0' ? totalAmount : '100',
          amt: totalAmount && totalAmount !== '0' ? totalAmount : '100',
        },
      ],
      totalQty: items.length > 0 ? totalQty : '1',
      grandTotal: totalAmount && totalAmount !== '0' ? totalAmount : '100',
    };
  };

  // Handle Save
  const handleSave = (andNew = false) => {
    const invoice = buildInvoicePayload();
    onSaveInvoice(invoice, false);

    if (andNew) {
      // Increment invoice number and reset form for next sale
      const nextNum = (parseInt(invoiceNo, 10) || 1) + 1;
      setInvoiceNo(nextNum.toString());
      setCustomerName('');
      setPhoneNumber('');
      setItems([]);
      Alert.alert(
        'Invoice Saved',
        `Invoice #${invoice.invoiceNo} saved. Ready for next sale!`
      );
    } else {
      Alert.alert(
        'Sale Saved',
        `Invoice #${invoice.invoiceNo} for ₹${invoice.grandTotal} saved successfully.`
      );
      onBack();
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#09090B' : '#FFFFFF' },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#09090B' : '#FFFFFF'}
      />

      {/* 1. Top Bar (Back, Title, Credit/Cash Pill, Settings) */}
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: isDark ? '#27272A' : '#F1F5F9',
            backgroundColor: isDark ? '#09090B' : '#FFFFFF',
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#FAFAFA' : '#0F172A'}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? '#FAFAFA' : '#0F172A' },
            ]}
          >
            Sale
          </Text>
        </View>

        <View style={styles.topBarRight}>
          {/* Credit / Cash Pill Toggle matching Image 1 */}
          <View
            style={[
              styles.modePillContainer,
              {
                backgroundColor: isDark ? '#18181B' : '#F1F5F9',
                borderColor: isDark ? '#27272A' : '#E2E8F0',
              },
            ]}
          >
            {/* Credit Pill */}
            <TouchableOpacity
              style={[
                styles.modePill,
                paymentMode === 'credit' && styles.modePillActive,
              ]}
              onPress={() => setPaymentMode('credit')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modePillTxt,
                  paymentMode === 'credit'
                    ? styles.modePillTxtActive
                    : { color: isDark ? '#A1A1AA' : '#64748B' },
                ]}
              >
                Credit
              </Text>
            </TouchableOpacity>

            {/* Cash Pill */}
            <TouchableOpacity
              style={[
                styles.modePill,
                paymentMode === 'cash' && styles.modePillActive,
              ]}
              onPress={() => setPaymentMode('cash')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modePillTxt,
                  paymentMode === 'cash'
                    ? styles.modePillTxtActive
                    : { color: isDark ? '#A1A1AA' : '#64748B' },
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>
          </View>

          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowInvoiceModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={isDark ? '#A1A1AA' : '#475569'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Subheader Strip: Invoice No. & Date (Tap to edit) */}
        <View
          style={[
            styles.subHeaderRow,
            {
              backgroundColor: isDark ? '#141417' : '#F8FAFC',
              borderColor: isDark ? '#27272A' : '#E2E8F0',
            },
          ]}
        >
          {/* Invoice No. Column */}
          <TouchableOpacity
            style={styles.subHeaderCol}
            onPress={() => setShowInvoiceModal(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.subHeaderLabel,
                { color: isDark ? '#71717A' : '#64748B' },
              ]}
            >
              Invoice No.
            </Text>
            <View style={styles.subHeaderValRow}>
              <Text
                style={[
                  styles.subHeaderVal,
                  { color: isDark ? '#FAFAFA' : '#0F172A' },
                ]}
              >
                {fullInvoiceNumber}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color={isDark ? '#A1A1AA' : '#64748B'}
              />
            </View>
          </TouchableOpacity>

          {/* Vertical Divider */}
          <View
            style={[
              styles.subHeaderDivider,
              { backgroundColor: isDark ? '#27272A' : '#E2E8F0' },
            ]}
          />

          {/* Date Column */}
          <TouchableOpacity
            style={styles.subHeaderCol}
            onPress={() => setShowCalendarModal(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.subHeaderLabel,
                { color: isDark ? '#71717A' : '#64748B' },
              ]}
            >
              Date
            </Text>
            <View style={styles.subHeaderValRow}>
              <Text
                style={[
                  styles.subHeaderVal,
                  { color: isDark ? '#FAFAFA' : '#0F172A' },
                ]}
              >
                {formattedDate}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color={isDark ? '#A1A1AA' : '#64748B'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Customer Floating-Label Input */}
        <View style={styles.inputWrapper}>
          <View
            style={[
              styles.floatingBadge,
              { backgroundColor: isDark ? '#09090B' : '#FFFFFF' },
            ]}
          >
            <Text style={[styles.floatingLabel, { color: '#0284C7' }]}>
              Customer *
            </Text>
          </View>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: '#0284C7',
                color: isDark ? '#FAFAFA' : '#0F172A',
                backgroundColor: isDark ? '#141417' : '#FFFFFF',
              },
            ]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        {/* 4. Phone Number Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInputSimple,
              {
                borderColor: isDark ? '#27272A' : '#CBD5E1',
                color: isDark ? '#FAFAFA' : '#0F172A',
                backgroundColor: isDark ? '#141417' : '#FFFFFF',
              },
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        {/* 5. Add Items Section */}
        {items.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.addItemsBtn,
              {
                borderColor: isDark ? '#27272A' : '#CBD5E1',
                backgroundColor: isDark ? '#141417' : '#FFFFFF',
              },
            ]}
            onPress={() => setShowAddItemModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={20}
              color="#0284C7"
            />
            <Text style={styles.addItemsTxt}>
              Add Items{' '}
              <Text
                style={{
                  color: isDark ? '#71717A' : '#94A3B8',
                  fontWeight: 'normal',
                }}
              >
                (Optional)
              </Text>
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.itemsListContainer}>
            <View style={styles.itemsListHeader}>
              <Text
                style={[
                  styles.itemsSectionTitle,
                  { color: isDark ? '#FAFAFA' : '#0F172A' },
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
                  color="#0284C7"
                />
                <Text style={styles.addMoreTxt}>Add More</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: isDark ? '#18181B' : '#F8FAFC',
                    borderColor: isDark ? '#27272A' : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemName,
                      { color: isDark ? '#FAFAFA' : '#0F172A' },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.itemFormula,
                      { color: isDark ? '#A1A1AA' : '#64748B' },
                    ]}
                  >
                    {item.qty} × ₹{item.price}
                  </Text>
                </View>

                <View style={styles.itemAmountCol}>
                  <Text
                    style={[
                      styles.itemAmt,
                      { color: isDark ? '#FAFAFA' : '#0F172A' },
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
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 6. Total Amount Row */}
        <View
          style={[
            styles.totalRow,
            { borderTopColor: isDark ? '#27272A' : '#F1F5F9' },
          ]}
        >
          <Text
            style={[
              styles.totalLabel,
              { color: isDark ? '#FAFAFA' : '#0F172A' },
            ]}
          >
            Total Amount
          </Text>
          <View style={styles.totalValueRow}>
            <Text
              style={[
                styles.rupeeSymbol,
                { color: isDark ? '#FAFAFA' : '#0F172A' },
              ]}
            >
              ₹
            </Text>
            {totalAmount && totalAmount !== '0' ? (
              <Text
                style={[
                  styles.totalNumber,
                  { color: isDark ? '#FAFAFA' : '#0F172A' },
                ]}
              >
                {totalAmount}
              </Text>
            ) : (
              <Text
                style={[
                  styles.dottedLine,
                  { color: isDark ? '#3F3F46' : '#CBD5E1' },
                ]}
              >
                ----------------------
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 7. Bottom Plan Notice Banner matching Image 1 */}
      <View style={styles.planBanner}>
        <Text style={styles.planBannerTxt}>
          Your current plan may not support some features.
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={16}
          color="#DC2626"
        />
      </View>

      {/* 8. Bottom Action Bar: [Save & New] [SAVE] [⋮] */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: isDark ? '#141417' : '#FFFFFF',
            borderTopColor: isDark ? '#27272A' : '#E2E8F0',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.saveNewBtn}
          onPress={() => handleSave(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.saveNewTxt,
              { color: isDark ? '#FAFAFA' : '#0F172A' },
            ]}
          >
            Save & New
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.savePrimaryBtn}
          onPress={() => handleSave(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.savePrimaryTxt}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreOptionsBtn}
          onPress={() => {
            Alert.alert('Sale Actions', 'Select an action:', [
              {
                text: 'Save & Push Print',
                onPress: () => {
                  const invoice = buildInvoicePayload();
                  onSaveInvoice(invoice, true);
                  onBack();
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={22}
            color="#0284C7"
          />
        </TouchableOpacity>
      </View>

      {/* 9. Popups & Modals */}
      <ChangeInvoiceModal
        visible={showInvoiceModal}
        currentInvoiceNo={invoiceNo}
        currentPrefix={invoicePrefix}
        onClose={() => setShowInvoiceModal(false)}
        onSave={(newNo, newPrefix) => {
          setInvoiceNo(newNo);
          setInvoicePrefix(newPrefix);
        }}
      />

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={saleDate}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(newDate) => setSaleDate(newDate)}
      />

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 2,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modePillContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
  },
  modePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  modePillActive: {
    backgroundColor: '#059669', // Emerald Green active pill
  },
  modePillTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  modePillTxtActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  settingsBtn: {
    padding: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  subHeaderCol: {
    flex: 1,
  },
  subHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  subHeaderValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subHeaderVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  subHeaderDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
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
    fontWeight: '600',
  },
  textInputSimple: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#0284C7',
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
    color: '#0284C7',
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
  itemFormula: {
    fontSize: 12,
    marginTop: 2,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
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
    color: '#0284C7',
  },
  dottedLine: {
    fontSize: 14,
    letterSpacing: 1,
  },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  planBannerTxt: {
    color: '#DC2626',
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
    backgroundColor: '#0284C7', // High-contrast Blue matching Image 1
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
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

