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

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { PrinterProfile } from '../../types/printer';
import { InvoiceData } from '../../types/billing';
import { DashedDivider } from './DashedDivider';
import { useTheme } from '../../hooks/useTheme';

interface ReceiptPreviewProps {
  activeConfig: PrinterProfile;
  invoice: InvoiceData;
}

export function ReceiptPreview({
  activeConfig,
  invoice,
}: ReceiptPreviewProps): React.JSX.Element {
  const { colors } = useTheme();
  const is58mm = activeConfig.id === 'SC588';

  // Dynamic on-screen simulation of physical feedLines (topSpace & bottomSpace)
  const topPadding = Math.max(4, activeConfig.feedLines.topSpace * 8 + 6);
  const bottomPadding = Math.max(6, activeConfig.feedLines.bottomSpace * 2.5 + 8);

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
        {/* Header: "Billing Receipt" */}
        <Text allowFontScaling={false} style={styles.paperCenterBold}>
          Billing Receipt
        </Text>

        <DashedDivider />

        {/* Metadata Block */}
        {/* 80mm: Left [Invoice No, Customer], Right [Date, Time] */}
        {/* 58mm: Left [Inv No, Cust], Right [Date, Time] */}
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
          <View style={styles.metaRow}>
            <Text allowFontScaling={false} style={styles.metaTxtLeft} numberOfLines={1}>
              {is58mm ? `Cust: ${customerName.substring(0, 10)}` : `Customer: ${customerName.substring(0, 18)}`}
            </Text>
            <Text allowFontScaling={false} style={styles.metaTxtRight}>
              Time: {displayTime}
            </Text>
          </View>
        </View>

        <DashedDivider />

        {/* Dynamic Table Header (Proportional Columns) */}
        <View style={styles.tableRow}>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              { flex: activeConfig.gridMetrics[0] },
            ]}
          >
            #
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              { flex: activeConfig.gridMetrics[1] },
            ]}
          >
            {is58mm ? 'Item' : 'Item Description'}
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[2] },
            ]}
          >
            Qty/Unit
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[3] },
            ]}
          >
            Price
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[4] },
            ]}
          >
            Amount
          </Text>
        </View>

        <DashedDivider />

        {/* Dynamic Items Rows (Includes Unit e.g. "2 KG") */}
        {invoice.items.map((it) => {
          const unitStr = it.unit ? ` ${it.unit}` : '';
          const qtyUnitStr = `${it.qty}${unitStr}`.trim();

          return (
            <View key={it.sNo} style={styles.tableRow}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.colCell,
                  { flex: activeConfig.gridMetrics[0] },
                ]}
              >
                {it.sNo}
              </Text>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.colCell,
                  { flex: activeConfig.gridMetrics[1] },
                ]}
              >
                {it.name.substring(0, activeConfig.nameCharLimit)}
              </Text>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.colCell,
                  styles.txtRight,
                  { flex: activeConfig.gridMetrics[2] },
                ]}
              >
                {qtyUnitStr}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.colCell,
                  styles.txtRight,
                  { flex: activeConfig.gridMetrics[3] },
                ]}
              >
                {it.price}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.colCell,
                  styles.txtRight,
                  { flex: activeConfig.gridMetrics[4] },
                ]}
              >
                {it.amt}
              </Text>
            </View>
          );
        })}

        <DashedDivider />

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
    marginVertical: 1.5,
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
