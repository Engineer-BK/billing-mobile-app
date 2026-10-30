/**
 * components/HomeScreen/RecentBillsCard.tsx
 * 
 * Active Transaction Hub & Invoice Summary Card.
 * Displays:
 * - Customer & Invoice metadata badge
 * - Total amount & items summary
 * - 1-tap Print, Share, and Live Preview expander triggers
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { InvoiceData } from '../../types/billing';

interface RecentBillsCardProps {
  invoice: InvoiceData;
  showPreview: boolean;
  onTogglePreview: () => void;
  onPressPrint: () => void;
  onPressShare: () => void;
}

export function RecentBillsCard({
  invoice,
  showPreview,
  onTogglePreview,
  onPressPrint,
  onPressShare,
}: RecentBillsCardProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Metadata Row */}
      <View style={styles.topRow}>
        <View style={styles.customerCol}>
          <Text style={[styles.customerName, { color: colors.textPrimary }]}>
            {invoice.customerName || 'Walk-in Customer'}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.saleBadge,
                { backgroundColor: colors.successLight },
              ]}
            >
              <Text style={[styles.saleBadgeTxt, { color: colors.success }]}>
                PAID SALE
              </Text>
            </View>
            <Text style={[styles.invoiceNo, { color: colors.textSecondary }]}>
              #{invoice.invoiceNo}
            </Text>
          </View>
        </View>

        <Text style={[styles.dateTxt, { color: colors.textSecondary }]}>
          {invoice.date}
        </Text>
      </View>

      {/* Financial Details Row */}
      <View style={[styles.amountRow, { borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.amountLbl, { color: colors.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.amountVal, { color: colors.textPrimary }]}>
            ₹ {invoice.grandTotal}
          </Text>
        </View>

        <View>
          <Text style={[styles.amountLbl, { color: colors.textSecondary }]}>
            Items / Qty
          </Text>
          <Text style={[styles.qtyVal, { color: colors.textPrimary }]}>
            {invoice.items.length} items • {invoice.totalQty}
          </Text>
        </View>

        {/* 1-Tap Action Icons */}
        <View style={styles.actionsBox}>
          {/* Print Trigger */}
          <TouchableOpacity
            style={[
              styles.actionCircle,
              { backgroundColor: colors.successLight },
            ]}
            onPress={onPressPrint}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="printer-outline"
              size={18}
              color={colors.success}
            />
          </TouchableOpacity>

          {/* Share Trigger */}
          <TouchableOpacity
            style={[
              styles.actionCircle,
              { backgroundColor: colors.surfaceLight },
            ]}
            onPress={onPressShare}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* View / Hide Thermal Paper Live Simulation */}
      <TouchableOpacity
        style={[
          styles.previewToggleBtn,
          {
            backgroundColor: showPreview
              ? 'rgba(249, 115, 22, 0.12)'
              : colors.surfaceLight,
            borderColor: showPreview ? colors.primary : colors.borderLight,
          },
        ]}
        onPress={onTogglePreview}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={showPreview ? 'eye-off-outline' : 'receipt'}
          size={16}
          color={showPreview ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.previewToggleTxt,
            { color: showPreview ? colors.primary : colors.textSecondary },
          ]}
        >
          {showPreview ? 'Hide Monospace Receipt Preview' : 'Show Thermal Monospace Receipt Preview'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerCol: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  saleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  invoiceNo: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  amountLbl: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewToggleTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
});

