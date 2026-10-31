/**
 * components/SaleScreen/SaleTopBar.tsx
 * 
 * Clean POS Sale Screen Top Bar.
 * Features:
 * - Back button to return to Home dashboard tab
 * - "Sale" screen title with "Live POS" badge
 * - "Reset" action to quickly start a fresh sale
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleTopBarProps {
  onBack?: () => void;
  onClearSale?: () => void;
}

export function SaleTopBar({ onBack, onClearSale }: SaleTopBarProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.topBar,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {/* Back Arrow to return to Home Tab */}
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        {/* Screen Title */}
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Sale
        </Text>

        <View style={[styles.liveBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.liveTxt, { color: colors.primary }]}>NEW BILL</Text>
        </View>
      </View>

      {/* Optional Reset / Clear Button */}
      {onClearSale ? (
        <TouchableOpacity
          onPress={onClearSale}
          style={[
            styles.resetBtn,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.borderLight,
            },
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.resetTxt, { color: colors.textSecondary }]}>Clear</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
});
