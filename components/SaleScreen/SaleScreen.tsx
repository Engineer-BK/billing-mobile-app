/**
 * components/SaleScreen/SaleScreen.tsx
 * 
 * Modular POS "New Sale" Screen Orchestrator.
 * Split into cleanly decoupled sub-components:
 * - SaleTopBar: Back arrow, "Sale" title, [Credit | Cash] toggle pill, settings
 * - SaleInvoiceSubheader: "Invoice No." & "Date" interactive popup triggers
 * - Customer & Phone outlined floating-label inputs
 * - SaleItemsList: Dynamic items list with sequential #1, #2 numbering & auto-reordering on delete
 * - SaleSummarySection: Subtotal, total discount savings, final amount, plan banner
 * - SaleBottomBar: "Save & New" and primary "Save" CTAs with options menu
 * - Modals: ChangeInvoiceModal, CalendarModal, AddItemModal
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData, InvoiceItem } from '../../types/billing';
import { SaleTopBar } from './SaleTopBar';
import { SaleInvoiceSubheader } from './SaleInvoiceSubheader';
import { SaleItemsList } from './SaleItemsList';
import { SaleSummarySection } from './SaleSummarySection';
import { SaleBottomBar } from './SaleBottomBar';
import { ChangeInvoiceModal } from './ChangeInvoiceModal';
import { CalendarModal } from './CalendarModal';
import { AddItemModal } from './AddItemModal';
import { SaleOptionsModal } from './SaleOptionsModal';

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

  // Invoice Number & Prefix state (starts from 1 by default)
  const [invoiceNo, setInvoiceNo] = useState<string>(initialInvoiceNo.toString());
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
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);

  // Format date as DD/MM/YYYY
  const formattedDate = useMemo(() => {
    const day = String(saleDate.getDate()).padStart(2, '0');
    const month = String(saleDate.getMonth() + 1).padStart(2, '0');
    const year = saleDate.getFullYear();
    return `${day}/${month}/${year}`;
  }, [saleDate]);

  // Combined full invoice number (e.g. "1" or "INV-1")
  const fullInvoiceNumber = useMemo(() => {
    return invoicePrefix ? `${invoicePrefix}${invoiceNo}` : invoiceNo;
  }, [invoicePrefix, invoiceNo]);

  // Live financial calculations across all items
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

  // Add Item to cart
  const handleAddItem = (newItem: InvoiceItem) => {
    setItems((prev) => [
      ...prev,
      { ...newItem, sNo: (prev.length + 1).toString() },
    ]);
  };

  // Remove Item with automatic renumbering of remaining items (#1, #2, ...)
  const handleRemoveItem = (index: number) => {
    setItems((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, sNo: (idx + 1).toString() }))
    );
  };

  // Build invoice payload helper
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

  // Handle More Options (Opens 3-dot popup modal)
  const handleMoreOptions = () => {
    setShowOptionsModal(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* 1. Top App Bar */}
      <SaleTopBar
        paymentMode={paymentMode}
        onSelectPaymentMode={setPaymentMode}
        onBack={onBack}
      />

      {/* 2. Subheader Bar (Invoice No. & Date) */}
      <SaleInvoiceSubheader
        fullInvoiceNumber={fullInvoiceNumber}
        formattedDate={formattedDate}
        onPressInvoiceNo={() => setShowInvoiceModal(true)}
        onPressDate={() => setShowCalendarModal(true)}
      />

      {/* 3. Scrollable Form Body */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollBodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Outlined Floating-Label Input */}
        <View style={styles.inputContainer}>
          <View style={[styles.floatingLabelBadge, { backgroundColor: colors.surface }]}>
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

        {/* Phone Number Input */}
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

        {/* Dynamic Items List with Numbering */}
        <SaleItemsList
          items={items}
          onOpenAddItemModal={() => setShowAddItemModal(true)}
          onRemoveItem={handleRemoveItem}
        />

        {/* Summary Breakdown & Notice Banner */}
        <SaleSummarySection
          itemsCount={items.length}
          totalQty={totalQty}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          finalAmount={finalAmount}
          hasDiscount={hasDiscount}
        />
      </ScrollView>

      {/* 4. Bottom Action Bar */}
      <SaleBottomBar
        onSave={handleSave}
        onMoreOptions={handleMoreOptions}
      />

      {/* --- Modals --- */}
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

      {/* 3-Dot More Options Popup Modal (Disappears on outside click) */}
      <SaleOptionsModal
        visible={showOptionsModal}
        invoiceNo={fullInvoiceNumber}
        amount={finalAmount}
        itemsCount={items.length}
        onClose={() => setShowOptionsModal(false)}
        onPrintDirectly={() => {
          const invoice = buildInvoicePayload();
          onSaveInvoice(invoice, true);
        }}
        onClearItems={() => setItems([])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
});
