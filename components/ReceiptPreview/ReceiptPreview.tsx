/**
 * components/ReceiptPreview/ReceiptPreview.tsx
 * 
 * True-to-Life Thermal POS Receipt Preview Card.
 * Matches the ESC/POS print engine 1-to-1:
 * - Header: "Billing Receipt" (no store name)
 * - Real-time Date & Time detection:
 *   - 80mm: Left [Invoice No, Customer], Right [Date, Time]
 *   - 58mm: Compact 32-col layout [Inv No, Date] / [Cust, Time]
 * - Qty/Unit column with units (e.g. "2 KG", "12 DZ")
 * - Summary totals: Total Items/Qty, Subtotal, Total Discount, Final Amount
 * - Real cream thermal paper simulation with feed lines padding
 */

import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { PrinterProfile } from '../../types/printer';
import { InvoiceData } from '../../types/billing';
import { DashedDivider } from './DashedDivider';
import { useTheme } from '../../hooks/useTheme';
import { storageService } from '../../services/storageService';
import { wrapTextToWords } from '../../services/printJobService';

interface ReceiptPreviewProps {
  activeConfig: PrinterProfile;
  invoice: InvoiceData;
  footerGreeting?: string;
}

export function ReceiptPreview({
  activeConfig,
  invoice,
  footerGreeting: propsFooterGreeting,
}: ReceiptPreviewProps): React.JSX.Element {
  const { colors } = useTheme();
  const is58mm = activeConfig.id === 'SC588';

  // Live dynamic festive footer greeting (synced with Settings)
  const [liveFooterGreeting, setLiveFooterGreeting] = useState<string>(
    propsFooterGreeting ?? 'Thank you! Visit again.'
  );

  useEffect(() => {
    if (propsFooterGreeting !== undefined) {
      setLiveFooterGreeting(propsFooterGreeting);
      return;
    }

    // 1. Initial load from storageService
    storageService.loadReceiptFooter().then((saved) => {
      setLiveFooterGreeting(saved);
    });

    // 2. Real-time subscription to storage updates from SettingsModal
    const unsubscribe = storageService.onFooterChange((updatedFooter) => {
      setLiveFooterGreeting(updatedFooter);
    });

    return () => {
      unsubscribe();
    };
  }, [propsFooterGreeting]);

  // 1.5-Inch Spacing Simulation (~50dp on mobile screens)
  const topPadding = 50;
  const bottomPadding = 50;

  // Compute live timestamp
  const { displayDate, displayTime } = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const liveDate = `${day}/${month}/${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const liveTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    return {
      displayDate: invoice.date || liveDate,
      displayTime: invoice.time || liveTime,
    };
  }, [invoice.date, invoice.time]);

  // Alphabetical items sorting (A to Z)
  const sortedItems = useMemo(() => {
    return [...invoice.items].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [invoice.items]);

  const customerName = invoice.customerName?.trim() || 'Walk-in Customer';
  const subtotalVal = invoice.subtotal || invoice.grandTotal;
  const discountVal = invoice.totalDiscount || (invoice.discountAmount ? invoice.discountAmount : '0.00');
  const finalAmountVal = invoice.finalAmount || invoice.grandTotal;

  return (
    <View style={styles.previewContainer}>
      {/* Title & Roll Spec Header */}
      <View style={styles.previewHeaderRow}>
        <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>
          {`Live Layout Preview (${activeConfig.lineWidth} Columns)`}
        </Text>
        <Text style={[styles.paperWidthTag, { color: colors.primary }]}>
          {activeConfig.paperWidth}
        </Text>
      </View>

      {/* Cream Physical Receipt Paper */}
      <View
        style={[
          styles.receiptPaper,
          {
            backgroundColor: colors.paperBackground,
            borderColor: colors.paperBorder,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          },
          is58mm ? styles.receiptPaper58 : styles.receiptPaper80,
        ]}
      >
        {/* Header: "Delivery Slip" */}
        <Text allowFontScaling={false} style={styles.paperCenterBold}>
          Delivery Slip
        </Text>

        <DashedDivider />

        {/* Metadata Block */}
        <View style={styles.metadataGrid}>
          {/* Row 1: Invoice No & Date */}
          <View style={styles.metaRow}>
            <Text allowFontScaling={false} style={styles.metaTxtLeft} numberOfLines={1}>
              {is58mm ? `Inv No: ${invoice.invoiceNo}` : `Invoice No: ${invoice.invoiceNo}`}
            </Text>
            <Text allowFontScaling={false} style={styles.metaTxtRight}>
              {is58mm ? `Date: ${displayDate.slice(0, 8)}` : `Date: ${displayDate}`}
            </Text>
          </View>

          {/* Row 2: Customer & Time */}
          {is58mm && customerName.length > 11 ? (
            <>
              <View style={styles.metaRow}>
                <Text allowFontScaling={false} style={styles.metaTxtLeft} numberOfLines={1}>
                  Cust: {customerName}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text allowFontScaling={false} style={styles.metaTxtLeft}>
                  Time: {displayTime}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.metaRow}>
              <Text allowFontScaling={false} style={styles.metaTxtLeft} numberOfLines={1}>
                {is58mm ? `Cust: ${customerName}` : `Customer: ${customerName.substring(0, 18)}`}
              </Text>
              <Text allowFontScaling={false} style={styles.metaTxtRight}>
                Time: {displayTime}
              </Text>
            </View>
          )}
        </View>

        <DashedDivider />

        {/* Dynamic 5-Column Table Header (#, Name, Qty, Price, Amount) */}
        <View style={styles.tableRow}>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              { flex: activeConfig.gridMetrics[0], fontSize: is58mm ? 9.5 : 10.5 },
            ]}
          >
            #
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              { flex: activeConfig.gridMetrics[1], fontSize: is58mm ? 9.5 : 10.5 },
            ]}
          >
            Name
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[2], fontSize: is58mm ? 9.5 : 10.5 },
            ]}
          >
            Qty
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[3], fontSize: is58mm ? 9.5 : 10.5 },
            ]}
          >
            Price
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[4], fontSize: is58mm ? 9.5 : 10.5 },
            ]}
          >
            Amount
          </Text>
        </View>

        <DashedDivider />

        {/* Alphabetically Ordered Items Loop with Multi-Line Word-Wrapping & Per-Item Dashed Dividers */}
        {sortedItems.map((it, idx) => {
          const sNo = String(idx + 1);
          const unitStr = it.unit ? ` ${it.unit}` : '';
          const qtyUnitStr = `${it.qty}${unitStr}`.trim();
          const cleanPrice = String(it.price || '').replace(/\.00$/, '');
          const cleanAmt = String(it.amt || '').replace(/\.00$/, '');

          const discPct = parseFloat(it.discountPercent || '0') || 0;
          const discAmt = parseFloat(it.discountAmount || '0') || 0;
          const hasDiscount = discPct > 0 || discAmt > 0;

          const q = parseFloat(it.qty) || 0;
          const p = parseFloat(it.price) || 0;
          const gross = q * p;
          const calcPct = discPct > 0 ? discPct : (gross > 0 ? Math.round((discAmt / gross) * 100) : 0);
          const calcAmt = discAmt > 0 ? discAmt : (gross * (discPct / 100));
          const amtStr = calcAmt > 0 ? `(-₹${calcAmt.toFixed(2).replace(/\.00$/, '')})` : '';
          const pctStr = calcPct > 0 ? `${calcPct}%` : '';
          const discDetails = [pctStr, amtStr].filter(Boolean).join(' ');

          const nameColWidth = is58mm ? 11 : 21;
          const nameLines = wrapTextToWords(it.name, nameColWidth);
          const cellFontSize = is58mm ? 9.5 : 10.5;

          return (
            <View key={`${it.sNo}_${idx}`}>
              {/* Line 1: # + First Line of Name + Qty + Price + Amount */}
              <View style={styles.tableRow}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colCell,
                    { flex: activeConfig.gridMetrics[0], fontSize: cellFontSize, fontWeight: '700' },
                  ]}
                >
                  {sNo}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colCell,
                    { flex: activeConfig.gridMetrics[1], fontSize: cellFontSize, fontWeight: '700' },
                  ]}
                >
                  {nameLines[0] || ''}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colCell,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[2], fontSize: cellFontSize },
                  ]}
                >
                  {qtyUnitStr}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colCell,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[3], fontSize: cellFontSize },
                  ]}
                >
                  {cleanPrice}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colCell,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[4], fontSize: cellFontSize, fontWeight: '700' },
                  ]}
                >
                  {cleanAmt}
                </Text>
              </View>

              {/* Continuation Lines for Name (Indented to align under Name column) */}
              {nameLines.slice(1).map((lineTxt, lineIdx) => (
                <View
                  key={`line_${lineIdx}`}
                  style={[styles.tableRow, { paddingLeft: is58mm ? 16 : 20 }]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      { fontSize: cellFontSize, fontWeight: '600', color: '#1E293B', flex: 1 },
                    ]}
                  >
                    {lineTxt}
                  </Text>
                </View>
              ))}

              {/* Dedicated discount note (if available) */}
              {hasDiscount && (
                <View style={[styles.tableRow, { paddingLeft: is58mm ? 16 : 20, marginTop: 1 }]}>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      { color: '#16A34A', fontSize: is58mm ? 9 : 10, fontWeight: '700' },
                    ]}
                  >
                    {`* Dis: ${discDetails}`}
                  </Text>
                </View>
              )}

              {/* Dashed line divider between each item */}
              <DashedDivider />
            </View>
          );
        })}

        {/* Dynamic Summary Block: Total Items/Qty, Subtotal, Total Discount, Final Amount */}
        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>
            Total Items/Qty:
          </Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {invoice.totalQty}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>
            Subtotal:
          </Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {subtotalVal}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>
            Total Discount:
          </Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            -{discountVal}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.grandTotalLabel}>
            Final Amount:
          </Text>
          <Text allowFontScaling={false} style={styles.grandTotalValue}>
            {finalAmountVal}
          </Text>
        </View>

        <DashedDivider />

        {/* Centered Polite / Festive Closing (Dynamic & removed if empty) */}
        {liveFooterGreeting.trim().length > 0 && (
          <Text
            allowFontScaling={false}
            style={[styles.paperCenterBold, { fontSize: 11, marginVertical: 4, textAlign: 'center' }]}
          >
            {liveFooterGreeting.trim()}
          </Text>
        )}

        {/* Cutter / Tear Indicator */}
        {activeConfig.hasAutoCutter ? (
          <View style={styles.cutLineBox}>
            <Text allowFontScaling={false} style={styles.cutLineTxt}>
              - - - - - - - - ✂️ AUTO-CUT - - - - - - - -
            </Text>
          </View>
        ) : (
          <View style={styles.tearLineBox}>
            <Text allowFontScaling={false} style={styles.tearLineTxt}>
              ▲ ▲ ▲ TEAR AGAINST SERRATED EDGE ▲ ▲ ▲
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    marginVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  paperWidthTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  receiptPaper: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptPaper58: {
    width: '82%',
    maxWidth: 320,
  },
  receiptPaper80: {
    width: '100%',
  },
  paperCenterBold: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#000000',
    letterSpacing: 0.8,
    marginVertical: 2,
  },
  metadataGrid: {
    marginVertical: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 1,
  },
  metaTxtLeft: {
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#111111',
    flex: 1,
  },
  metaTxtRight: {
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#111111',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  colHeader: {
    fontSize: 10.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#000000',
  },
  colCell: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#111111',
  },
  txtRight: {
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 1.5,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#222222',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#111111',
  },
  grandTotalLabel: {
    fontSize: 12.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#000000',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#000000',
  },
  cutLineBox: {
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#CCC5A8',
    borderStyle: 'dashed',
  },
  cutLineTxt: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#777777',
    letterSpacing: 0.5,
  },
  tearLineBox: {
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#CCC5A8',
  },
  tearLineTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#777777',
    letterSpacing: 0.4,
  },
});
