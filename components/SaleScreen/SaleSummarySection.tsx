/**
 * components/SaleScreen/SaleSummarySection.tsx
 * 
 * Summary Breakdown & Plan Notice for POS Sale Screen.
 * Features:
 * - Subtotal row (when items > 0 & discount applied)
 * - Total Discount row (highlighted in emerald green)
 * - Total Amount with large currency display & items/qty count
 * - Plan notice banner
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleSummarySectionProps {
  itemsCount: number;
  totalQty: string;
  subtotal: string;
  totalDiscount: string;
  finalAmount: string;
  hasDiscount: boolean;
}

export function SaleSummarySection({
  itemsCount,
  totalQty,
  subtotal,
  totalDiscount,
  finalAmount,
  hasDiscount,
}: SaleSummarySectionProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* 1. Subtotal & Discount Rows (if discount applied) */}
      <View
        style={[
          styles.summarySection,
          { borderTopColor: colors.border },
        ]}
      >
        {itemsCount > 0 && hasDiscount ? (
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
                Total Discount Saved
              </Text>
              <Text style={[styles.subRowValue, { color: colors.success, fontWeight: '800' }]}>
                -₹{totalDiscount}
              </Text>
            </View>
          </>
        ) : null}

        {/* 2. Final Total Amount Row */}
        <View style={styles.totalRow}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
              Total Amount
            </Text>
            {itemsCount > 0 ? (
              <Text style={[styles.itemsSummaryTxt, { color: colors.textSecondary }]}>
                {itemsCount} items • {totalQty} total qty
              </Text>
            ) : null}
          </View>

          <View style={styles.totalValueRow}>
            <Text style={[styles.rupeeSymbol, { color: colors.textPrimary }]}>
              ₹
            </Text>
            {finalAmount && finalAmount !== '0' ? (
              <Text style={[styles.totalNumber, { color: colors.primary }]}>
                {finalAmount}
              </Text>
            ) : (
              <Text style={[styles.dottedLine, { color: colors.textMuted }]}>
                ----------------------
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 3. Bottom Plan Notice Banner */}
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
        <Text style={[styles.planBannerTxt, { color: colors.error }]}>
          Your current plan may not support some features.
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={colors.error}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  summarySection: {
    borderTopWidth: 1,
    paddingTop: 12,
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
    borderRadius: 8,
    marginTop: 14,
  },
  planBannerTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
});

