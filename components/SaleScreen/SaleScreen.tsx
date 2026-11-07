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

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { InvoiceData, InvoiceItem } from '../../types/billing';
import { PresetItem } from '../../types/item';
import { SavedCustomer, CustomerSuggestionItem } from '../../types/customer';
import { storageService } from '../../services/storageService';
import { customerService } from '../../services/customerService';
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
  presetItems?: PresetItem[];
  onBack?: () => void;
  onSaveInvoice: (invoice: InvoiceData, shouldPrint?: boolean, andNew?: boolean) => void;
}

// Helper to title-case each word (e.g. "ali ahmed" -> "Ali Ahmed")
const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function SaleScreen({
  initialInvoiceNo = 1,
  shopName,
  presetItems = [],
  onBack,
  onSaveInvoice,
}: SaleScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // Invoice Number & Prefix state (starts from 1 by default)
  const [invoiceNo, setInvoiceNo] = useState<string>(initialInvoiceNo.toString());
  const [invoicePrefix, setInvoicePrefix] = useState<string>('');

  // Keep invoiceNo strictly synchronized with initialInvoiceNo from Invoices tab
  useEffect(() => {
    if (initialInvoiceNo && initialInvoiceNo > 0) {
      setInvoiceNo(initialInvoiceNo.toString());
    } else {
      storageService.loadNextInvoiceNumber().then((savedNum) => {
        if (savedNum && savedNum > 0) {
          setInvoiceNo(savedNum.toString());
        }
      });
    }
  }, [initialInvoiceNo]);

  // Date state
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  // Customer Details & Suggestions State
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isCustomerFocused, setIsCustomerFocused] = useState<boolean>(false);
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);
  const phoneInputRef = useRef<TextInput>(null);

  // Load saved customers from database on mount or session change
  useEffect(() => {
    customerService.getCustomers(user?.uid).then((list) => {
      setSavedCustomers(list);
    });
  }, [user?.uid]);

  // Dynamic customer suggestions: System presets ("Cash", "Walk-in") + Saved Customers
  const filteredCustomerSuggestions = useMemo((): CustomerSuggestionItem[] => {
    const q = customerName.trim().toLowerCase();

    const presets: CustomerSuggestionItem[] = [
      { name: 'Cash', canDelete: false, isPreset: true },
      { name: 'Walk-in Customer', canDelete: false, isPreset: true },
    ];

    if (!q) {
      // When field is focused but empty, show presets + up to 5 most recent customers
      const recent = savedCustomers.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        canDelete: true,
      }));
      return [...presets, ...recent];
    }

    // Filter presets
    const matchedPresets = presets.filter(
      (p) => p.name.toLowerCase() !== q && p.name.toLowerCase().includes(q)
    );

    // Filter saved customers by name or phone
    const matchedSaved = savedCustomers
      .filter((c) => {
        if (c.name.toLowerCase() === q) return false;
        const nameMatches = c.name.toLowerCase().includes(q);
        const phoneMatches = c.phone ? c.phone.includes(q) : false;
        return nameMatches || phoneMatches;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        canDelete: true,
      }));

    const combined = [...matchedPresets, ...matchedSaved];
    combined.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });

    return combined.slice(0, 7);
  }, [customerName, savedCustomers]);

  // Select a suggestion and auto-populate name & phone
  const handleSelectCustomer = (sug: CustomerSuggestionItem) => {
    setCustomerName(sug.name);
    if (sug.phone) {
      setPhoneNumber(sug.phone);
    }
    setIsCustomerFocused(false);
    phoneInputRef.current?.focus();
  };

  // Delete a customer with the cross (✕) button
  const handleDeleteCustomer = (sug: CustomerSuggestionItem) => {
    const target = sug.id || sug.name;
    // Optimistic UI update
    setSavedCustomers((prev) =>
      prev.filter((c) => c.id !== target && c.name.toLowerCase() !== sug.name.toLowerCase())
    );
    // Persist deletion locally and in Firestore
    customerService.deleteCustomer(target, user?.uid).then((updated) => {
      setSavedCustomers(updated);
    }).catch((e) => console.warn('Customer deletion notice:', e));
  };

  // Cart / Items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Restore unsaved sale draft on mount
  useEffect(() => {
    storageService.loadSaleDraft().then((draft) => {
      if (draft) {
        if (draft.customerName) setCustomerName(draft.customerName);
        if (draft.phoneNumber) setPhoneNumber(draft.phoneNumber);
        if (Array.isArray(draft.items) && draft.items.length > 0) setItems(draft.items);
      }
    });
  }, []);

  // Auto-persist unsaved sale draft to AsyncStorage across tab switches or app exits
  useEffect(() => {
    if (customerName || phoneNumber || items.length > 0) {
      storageService.saveSaleDraft({ customerName, phoneNumber, items });
    }
  }, [customerName, phoneNumber, items]);

  // Modals state
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
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

  // Edit Item from cart (opens AddItemModal in edit mode)
  const handleEditItem = (item: InvoiceItem, index: number) => {
    setEditingItemIndex(index);
    setShowAddItemModal(true);
  };

  // Update existing Item in cart
  const handleUpdateItem = (updatedItem: InvoiceItem, index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updatedItem,
        sNo: (index + 1).toString(),
      };
      return updated;
    });
    setEditingItemIndex(null);
    setShowAddItemModal(false);
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
        price: finalAmount && finalAmount !== '0' ? finalAmount : '0',
        amt: finalAmount && finalAmount !== '0' ? finalAmount : '0',
      },
    ];

    const currentFinal = finalAmount && finalAmount !== '0' ? finalAmount : '0';

    return {
      shopName: shopName || 'Delivery Slip',
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
      status: 'PAID',
    };
  };

  // Helper to reset all input fields and prepare next invoice
  const resetSaleForm = (nextNum?: number) => {
    const upcomingNum = nextNum || ((parseInt(invoiceNo, 10) || 1) + 1);
    setInvoiceNo(upcomingNum.toString());
    setCustomerName('');
    setPhoneNumber('');
    setItems([]);
    setSaleDate(new Date());
    storageService.clearSaleDraft();
  };

  // Handle Save
  const handleSave = (andNew = false) => {
    // Save customer to database for future auto-suggestions
    const cleanCustName = customerName.trim();
    if (cleanCustName && cleanCustName.toLowerCase() !== 'cash' && cleanCustName.toLowerCase() !== 'walk-in customer') {
      customerService.saveCustomer(cleanCustName, phoneNumber.trim() || undefined, user?.uid).then((updated) => {
        setSavedCustomers(updated);
      }).catch((e) => console.warn('Customer save notice:', e));
    }

    const invoice = buildInvoicePayload();
    const nextNum = (parseInt(invoiceNo, 10) || 1) + 1;
    storageService.saveNextInvoiceNumber(nextNum);

    // 1. Immediately reset form input fields (customer name, phone, items) and advance invoice #
    resetSaleForm(nextNum);

    // 2. Commit invoice and automatically navigate to Invoices tab if !andNew
    onSaveInvoice(invoice, false, andNew);

    if (andNew) {
      Alert.alert(
        'Invoice Saved',
        `Invoice #${fullInvoiceNumber} saved! Ready for Invoice #${invoicePrefix}${nextNum}.`
      );
    }
  };

  // Handle More Options (Opens 3-dot popup modal)
  const handleMoreOptions = () => {
    setShowOptionsModal(true);
  };

  // Clear / Reset Sale
  const handleClearSale = () => {
    if (items.length > 0 || customerName || phoneNumber) {
      Alert.alert(
        'Reset Sale?',
        'Are you sure you want to clear current items and customer details?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: () => {
              setCustomerName('');
              setPhoneNumber('');
              setItems([]);
              storageService.clearSaleDraft();
            },
          },
        ]
      );
    } else {
      Alert.alert('New Sale', 'Sale form is ready for new items.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top App Bar */}
      <SaleTopBar onBack={onBack} onClearSale={handleClearSale} />

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
        {/* Customer Input Card with Quick Cash Suggestion & Dropdown */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <MaterialCommunityIcons name="account-outline" size={16} color={colors.primary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                CUSTOMER NAME
              </Text>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>*</Text>
            </View>
            {customerName !== 'Cash' && (
              <TouchableOpacity
                style={[
                  styles.quickCashChip,
                  { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#DCFCE7' },
                ]}
                onPress={() => {
                  setCustomerName('Cash');
                  phoneInputRef.current?.focus();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="cash" size={13} color="#16A34A" />
                <Text style={styles.quickCashTxt}>Cash</Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.surface,
                borderColor: customerName ? colors.primary : colors.borderLight,
              },
            ]}
          >
            <TextInput
              style={[styles.inputText, { color: colors.textPrimary }]}
              value={customerName}
              onChangeText={(text) => {
                setCustomerName(capitalizeWords(text));
                setIsCustomerFocused(true);
              }}
              onFocus={() => setIsCustomerFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsCustomerFocused(false), 250);
              }}
              autoCapitalize="words"
              placeholder="e.g. Cash (or Basir Khan)"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneInputRef.current?.focus()}
            />
            {customerName.length > 0 && (
              <TouchableOpacity onPress={() => setCustomerName('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Autocomplete Dropdown Suggestions with Tap-to-Select and Cross (✕) to Delete */}
          {isCustomerFocused && filteredCustomerSuggestions.length > 0 && (
            <View
              style={[
                styles.customerSuggestionsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                  shadowColor: isDark ? '#000000' : '#8899A6',
                },
              ]}
            >
              <View style={styles.customerSuggestionHeader}>
                <Text style={[styles.customerSuggestionHeaderTxt, { color: colors.textMuted }]}>
                  {customerName.trim() ? 'SUGGESTIONS (TAP TO SELECT)' : 'SAVED CUSTOMERS (TAP TO SELECT)'}
                </Text>
              </View>
              {filteredCustomerSuggestions.map((sug) => (
                <View
                  key={sug.id || sug.name}
                  style={[
                    styles.customerSuggestionItem,
                    { borderTopColor: colors.borderLight },
                  ]}
                >
                  {/* Left Touch Area: Selects customer name & auto-fills phone */}
                  <TouchableOpacity
                    style={styles.customerSuggestionLeft}
                    onPress={() => handleSelectCustomer(sug)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.customerIconCircle,
                        {
                          backgroundColor:
                            sug.name === 'Cash'
                              ? isDark
                                ? 'rgba(16, 185, 129, 0.15)'
                                : '#DCFCE7'
                              : colors.primaryLight,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={sug.name === 'Cash' ? 'cash' : 'account-outline'}
                        size={17}
                        color={sug.name === 'Cash' ? '#16A34A' : colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.customerSuggestionTxt, { color: colors.textPrimary }]}>
                        {sug.name}
                      </Text>
                      {sug.phone ? (
                        <Text style={[styles.customerSuggestionPhone, { color: colors.textSecondary }]}>
                          📞 {sug.phone}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  {/* Right Touch Area: Cross (✕) to Delete Saved Customer, or Chevron for Presets */}
                  {sug.canDelete ? (
                    <TouchableOpacity
                      style={[
                        styles.deleteCustomerBtn,
                        {
                          backgroundColor: isDark
                            ? 'rgba(239, 68, 68, 0.15)'
                            : '#FEE2E2',
                        },
                      ]}
                      onPress={() => handleDeleteCustomer(sug)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={`Delete ${sug.name} from saved customers`}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={15}
                        color={colors.error || '#EF4444'}
                      />
                    </TouchableOpacity>
                  ) : (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={colors.textMuted}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Phone Number Input Card */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              PHONE NUMBER
            </Text>
            <Text style={[styles.optionalBadge, { color: colors.textMuted }]}>Optional</Text>
          </View>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.surface,
                borderColor: phoneNumber ? colors.primary : colors.borderLight,
              },
            ]}
          >
            <TextInput
              ref={phoneInputRef}
              style={[styles.inputText, { color: colors.textPrimary }]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="e.g. 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={() => phoneInputRef.current?.blur()}
            />
            {phoneNumber.length > 0 && (
              <TouchableOpacity onPress={() => setPhoneNumber('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dynamic Items List with Numbering */}
        <SaleItemsList
          items={items}
          onOpenAddItemModal={() => {
            setEditingItemIndex(null);
            setShowAddItemModal(true);
          }}
          onRemoveItem={handleRemoveItem}
          onEditItem={handleEditItem}
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
        itemIndex={editingItemIndex !== null ? editingItemIndex + 1 : items.length + 1}
        presetItems={presetItems}
        editingItem={editingItemIndex !== null ? items[editingItemIndex] : null}
        editingIndex={editingItemIndex}
        onClose={() => {
          setShowAddItemModal(false);
          setEditingItemIndex(null);
        }}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
      />

      {/* 3-Dot More Options Popup Modal (Disappears on outside click) */}
      <SaleOptionsModal
        visible={showOptionsModal}
        invoiceNo={fullInvoiceNumber}
        amount={finalAmount}
        itemsCount={items.length}
        onClose={() => setShowOptionsModal(false)}
        onPrintDirectly={() => {
          const cleanCustName = customerName.trim();
          if (cleanCustName && cleanCustName.toLowerCase() !== 'cash' && cleanCustName.toLowerCase() !== 'walk-in customer') {
            customerService.saveCustomer(cleanCustName, phoneNumber.trim() || undefined, user?.uid).then((updated) => {
              setSavedCustomers(updated);
            }).catch((e) => console.warn('Customer save notice:', e));
          }
          const invoice = buildInvoicePayload();
          const nextNum = (parseInt(invoiceNo, 10) || 1) + 1;
          storageService.saveNextInvoiceNumber(nextNum);
          resetSaleForm(nextNum);
          setShowOptionsModal(false);
          onSaveInvoice(invoice, true, false);
        }}
        onClearItems={() => setItems([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 16,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  quickCashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quickCashTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  customerSuggestionsCard: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  customerSuggestionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  customerSuggestionHeaderTxt: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  customerSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  customerSuggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  customerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerSuggestionTxt: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  customerSuggestionPhone: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  deleteCustomerBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
