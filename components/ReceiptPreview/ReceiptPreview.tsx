/**
 * components/ReceiptPreview/ReceiptPreview.tsx
 * 
 * True-to-Life Thermal POS Receipt Preview Card.
 * Responsively renders:
 * - 58mm (SC588): Compact 2-inch roll width (76%), centered
 * - 80mm (EZO 80UB): Wide 3-inch roll width (100%)
 * Displays proportional flex columns, dashed lines, and cutter indicators.
 */

import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { PrinterProfile } from '../../types/printer';
import { InvoiceData } from '../../types/billing';
import { DashedDivider } from './DashedDivider';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/theme';

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

  return (
    <View style={styles.previewContainer}>
      {/* Title & Roll Spec Header */}
      <View style={styles.previewHeaderRow}>
        <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>
          {`Live Layout Preview (${activeConfig.lineWidth} Columns)`}
        </Text>
        <Text style={[styles.paperWidthTag, { color: colors.accent }]}>
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
          },
          is58mm ? styles.receiptPaper58 : styles.receiptPaper80,
        ]}
      >
        {/* Header: Shop Name */}
        <Text allowFontScaling={false} style={styles.paperCenterBold}>
          {invoice.shopName}
        </Text>

        <DashedDivider />

        {/* Metadata Row: Date & Invoice No */}
        <View style={styles.metaRow}>
          <Text allowFontScaling={false} style={styles.metaTxt}>
            Date: {invoice.date}
          </Text>
          <Text allowFontScaling={false} style={styles.metaTxt}>
            Inv No: {invoice.invoiceNo}
          </Text>
        </View>

        {invoice.customerName ? (
          <View style={styles.metaRow}>
            <Text allowFontScaling={false} style={styles.metaTxt}>
              Customer: {invoice.customerName}
            </Text>
          </View>
        ) : null}

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
            {is58mm ? 'Name' : 'Item Description'}
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[2] },
            ]}
          >
            Qty
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[3] },
            ]}
          >
            {is58mm ? 'Pri' : 'Price'}
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.colHeader,
              styles.txtRight,
              { flex: activeConfig.gridMetrics[4] },
            ]}
          >
            {is58mm ? 'Amt' : 'Amount'}
          </Text>
        </View>

        <DashedDivider />

        {/* Dynamic Items Rows */}
        {invoice.items.map((it) => (
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
              style={[
                styles.colCell,
                styles.txtRight,
                { flex: activeConfig.gridMetrics[2] },
              ]}
            >
              {it.qty}
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
        ))}

        <DashedDivider />

        {/* Dynamic Summary Block */}
        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.summaryLabel}>
            Total Items/Qty:
          </Text>
          <Text allowFontScaling={false} style={styles.summaryValue}>
            {invoice.totalQty}
          </Text>
        </View>

        {invoice.discountAmount && Number(invoice.discountAmount) > 0 ? (
          <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.summaryLabel}>
              Discount ({invoice.discountPercent || ''}):
            </Text>
            <Text allowFontScaling={false} style={styles.summaryValue}>
              -{invoice.discountAmount}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <Text allowFontScaling={false} style={styles.grandTotalLabel}>
            Grand Total Amount:
          </Text>
          <Text allowFontScaling={false} style={styles.grandTotalValue}>
            {invoice.grandTotal}
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
    marginTop: 4,
    marginBottom: 30,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  previewTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  paperWidthTag: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  receiptPaper: {
    backgroundColor: Colors.paperBackground,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    paddingVertical: 12,
  },
  receiptPaper58: {
    width: '76%',
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  receiptPaper80: {
    width: '100%',
    paddingHorizontal: 12,
  },
  paperCenterBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 13.5,
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  metaTxt: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  colHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: '#000',
  },
  colCell: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#111',
  },
  txtRight: {
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  summaryLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#222',
  },
  summaryValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#111',
    textAlign: 'right',
  },
  grandTotalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000',
  },
  grandTotalValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000',
    textAlign: 'right',
  },
  cutLineBox: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingBottom: 4,
  },
  cutLineTxt: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#777',
    fontWeight: '600',
  },
  tearLineBox: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tearLineTxt: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#888',
  },
});
