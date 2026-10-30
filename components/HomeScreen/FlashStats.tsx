/**
 * components/HomeScreen/FlashStats.tsx
 * 
 * Distinctive High-Speed Retail POS Metric Cards.
 * Utilizes the brand colors across 3 interactive metric tiles:
 * - Sales Volume (Orange)
 * - Bills & Items (Green)
 * - Active Hardware Mode (Indigo/Cyan)
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PrinterProfile } from '../../types/printer';

interface FlashStatsProps {
  grandTotal: string;
  totalQty: string;
  itemsCount: number;
  activeConfig: PrinterProfile;
}

export function FlashStats({
  grandTotal,
  totalQty,
  itemsCount,
  activeConfig,
}: FlashStatsProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* 1. Today's Bill Total Card (Safety Orange) */}
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: colors.primary,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            CURRENT INVOICE
          </Text>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="currency-inr"
              size={16}
              color={colors.primary}
            />
          </View>
        </View>

        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          ₹ {grandTotal}
        </Text>
        <Text style={[styles.statSub, { color: colors.primary }]}>
          Ready to Dispatch
        </Text>
      </View>

      {/* 2. Items & Qty Card (Emerald Green) */}
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: colors.success,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            ITEMS & QUANTITY
          </Text>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.successLight },
            ]}
          >
            <MaterialCommunityIcons
              name="basket-outline"
              size={16}
              color={colors.success}
            />
          </View>
        </View>

        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {totalQty}{' '}
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Qty</Text>
        </Text>
        <Text style={[styles.statSub, { color: colors.success }]}>
          {itemsCount} Unique Products
        </Text>
      </View>

      {/* 3. Hardware Profile Card (Indigo Purple) */}
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: colors.secondary,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            ACTIVE HARDWARE
          </Text>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="printer-pos"
              size={16}
              color={colors.secondary}
            />
          </View>
        </View>

        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
          {activeConfig.lineWidth} Col
        </Text>
        <Text style={[styles.statSub, { color: colors.secondary }]}>
          {activeConfig.paperWidth} • {activeConfig.hasAutoCutter ? 'Auto-Cut' : 'Manual'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    gap: 12,
    paddingBottom: 4,
    marginBottom: 16,
  },
  statCard: {
    width: 170,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});

