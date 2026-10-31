/**
 * components/SaleScreen/SaleInvoiceSubheader.tsx
 * 
 * Subheader bar for the POS Sale Screen.
 * Features:
 * - Invoice No. block with dropdown arrow (opens Change Invoice Modal)
 * - Vertical divider
 * - Date block with dropdown arrow (opens Calendar Modal)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleInvoiceSubheaderProps {
  fullInvoiceNumber: string;
  formattedDate: string;
  onPressInvoiceNo: () => void;
  onPressDate: () => void;
}

export function SaleInvoiceSubheader({
  fullInvoiceNumber,
  formattedDate,
  onPressInvoiceNo,
  onPressDate,
}: SaleInvoiceSubheaderProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.subheaderBar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
      ]}
    >
      {/* Invoice No. Block */}
      <TouchableOpacity
        style={styles.subheaderCol}
        onPress={onPressInvoiceNo}
        activeOpacity={0.7}
      >
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Invoice No.
        </Text>
        <View style={styles.subValueRow}>
          <Text style={[styles.subValue, { color: colors.textPrimary }]}>
            {fullInvoiceNumber}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.primary}
          />
        </View>
      </TouchableOpacity>

      {/* Vertical Divider */}
      <View
        style={[
          styles.verticalDivider,
          { backgroundColor: colors.borderLight },
        ]}
      />

      {/* Date Block */}
      <TouchableOpacity
        style={styles.subheaderCol}
        onPress={onPressDate}
        activeOpacity={0.7}
      >
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
          Date
        </Text>
        <View style={styles.subValueRow}>
          <Text style={[styles.subValue, { color: colors.textPrimary }]}>
            {formattedDate}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.primary}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  subheaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  subheaderCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 16,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  subValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});

