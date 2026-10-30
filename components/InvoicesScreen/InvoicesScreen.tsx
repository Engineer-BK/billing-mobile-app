/**
 * components/InvoicesScreen/InvoicesScreen.tsx
 * 
 * Invoices & Transactions Screen for FlashBill.
 * Features:
 * - Real-time Search Field: Filters across Customer Name, Date, Invoice No, and Amount
 * - Total Revenue & Invoices Count Metrics
 * - Invoice Cards with:
 *   - Invoice #, Date, Time, Customer Name, Items Count, Total Amount
 *   - 1-Tap Direct Printer button to print immediately
 *   - Card tap to open receipt preview modal and print
 * - ReceiptModal for full thermal receipt inspection
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData } from '../../types/billing';
import { PrinterProfile } from '../../types/printer';
import { ReceiptModal } from './ReceiptModal';
import { InvoiceOptionsMenu } from './InvoiceOptionsMenu';

interface InvoicesScreenProps {
  invoices: InvoiceData[];
  activeConfig: PrinterProfile;
  onPressPrint: (invoice: InvoiceData) => void;
  onPressNewSale: () => void;
  onDeleteInvoice: (invoiceNo: string) => void;
}

export function InvoicesScreen({
  invoices,
  activeConfig,
  onPressPrint,
  onPressNewSale,
  onDeleteInvoice,
}: InvoicesScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected invoice for receipt preview modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  // Selected invoice for 3-dot options popup modal (disappears on outside click)
  const [menuInvoice, setMenuInvoice] = useState<InvoiceData | null>(null);

  // Filter invoices based on search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase().trim();

    return invoices.filter((inv) => {
      const cust = (inv.customerName || '').toLowerCase();
      const invNo = (inv.invoiceNo || '').toLowerCase();
      const dt = (inv.date || '').toLowerCase();
      const amt = (inv.grandTotal || '').toLowerCase();

      return (
        cust.includes(q) ||
        invNo.includes(q) ||
        dt.includes(q) ||
        amt.includes(q)
      );
    });
  }, [invoices, searchQuery]);

  // Aggregate metrics
  const totalRevenue = useMemo(() => {
    const sum = invoices.reduce(
      (acc, inv) => acc + (parseFloat(inv.grandTotal) || 0),
      0
    );
    return sum.toFixed(2).replace(/\.00$/, '');
  }, [invoices]);

  return (
    <View style={styles.container}>
      {/* 1. Header & Summary Strip */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Invoices & Receipts
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {invoices.length} Bills • Total Sales: ₹{totalRevenue}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.newSaleHeaderBtn,
            { backgroundColor: colors.primary },
          ]}
          onPress={onPressNewSale}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.newSaleHeaderTxt}>New Sale</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Real-Time Search Bar */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderLight,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search customer, date, or invoice #..."
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3. Invoices List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item, index) => `${item.invoiceNo}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt"
              size={56}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {searchQuery ? 'No Invoices Matched' : 'No Invoices Yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery
                ? `No bills matching "${searchQuery}". Try another keyword.`
                : 'Create your first sale to start recording and printing bills.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={[styles.emptyCreateBtn, { backgroundColor: colors.primary }]}
                onPress={onPressNewSale}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyCreateTxt}>+ Create First Sale</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const customer = item.customerName || 'Walk-in Customer';

          return (
            <TouchableOpacity
              style={[
                styles.invoiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedInvoice(item)}
              activeOpacity={0.7}
            >
              {/* Row 1: Invoice #, Date, Status */}
              <View style={styles.cardTopRow}>
                <View style={styles.invoiceBadgeRow}>
                  <View
                    style={[
                      styles.invoiceBadge,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.invoiceBadgeTxt, { color: colors.primary }]}>
                      #{item.invoiceNo}
                    </Text>
                  </View>
                  <Text style={[styles.dateTxt, { color: colors.textSecondary }]}>
                    {item.date} {item.time ? `• ${item.time}` : ''}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: colors.successLight },
                  ]}
                >
                  <Text style={[styles.statusTxt, { color: colors.success }]}>
                    PAID SALE
                  </Text>
                </View>
              </View>

              {/* Row 2: Customer Name & Items Details */}
              <View style={styles.cardMidRow}>
                <View style={styles.customerRow}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.customerName, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {customer}
                  </Text>
                </View>

                <Text style={[styles.itemsCountTxt, { color: colors.textSecondary }]}>
                  {item.items.length} items • {item.totalQty} total qty
                </Text>
              </View>

              {/* Row 3: Total Amount & Direct Actions */}
              <View style={[styles.cardBottomRow, { borderTopColor: colors.borderLight }]}>
                <View>
                  <Text style={[styles.totalLbl, { color: colors.textSecondary }]}>
                    Total Amount
                  </Text>
                  <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
                    ₹ {item.grandTotal}
                  </Text>
                </View>

                <View style={styles.actionsGroup}>
                  {/* Direct 1-Tap Printer Button */}
                  <TouchableOpacity
                    style={[
                      styles.printerActionBtn,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => onPressPrint(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="printer-pos"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.printerActionTxt, { color: colors.primary }]}>
                      Print
                    </Text>
                  </TouchableOpacity>

                  {/* 3-Dot Options & Delete Menu Button */}
                  <TouchableOpacity
                    style={[
                      styles.menuBtn,
                      {
                        backgroundColor: colors.surfaceLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                    onPress={() => setMenuInvoice(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* 4. Fullscreen Receipt Inspector Modal */}
      <ReceiptModal
        visible={!!selectedInvoice}
        invoice={selectedInvoice}
        activeConfig={activeConfig}
        onClose={() => setSelectedInvoice(null)}
        onPrint={(inv) => {
          onPressPrint(inv);
        }}
        onDelete={onDeleteInvoice}
      />

      {/* 5. 3-Dot Options Popup Modal (Disappears when clicking outside) */}
      <InvoiceOptionsMenu
        visible={!!menuInvoice}
        invoice={menuInvoice}
        onClose={() => setMenuInvoice(null)}
        onPrint={(inv) => onPressPrint(inv)}
        onPreview={(inv) => setSelectedInvoice(inv)}
        onDelete={(inv) => onDeleteInvoice(inv.invoiceNo)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  newSaleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newSaleHeaderTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  listContent: {
    paddingBottom: 24,
  },
  invoiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  invoiceBadgeTxt: {
    fontSize: 12,
    fontWeight: '900',
  },
  dateTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardMidRow: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemsCountTxt: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  totalLbl: {
    fontSize: 11,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  printerActionTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyCreateBtn: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCreateTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

