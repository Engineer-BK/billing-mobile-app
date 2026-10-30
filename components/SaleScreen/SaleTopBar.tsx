/**
 * components/SaleScreen/SaleTopBar.tsx
 * 
 * Top bar of the POS Sale Screen.
 * Features:
 * - Back button with smooth navigation return
 * - "Sale" screen title
 * - Mode Pill Toggle: [ Credit | Cash ]
 * - Settings gear trigger
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleTopBarProps {
  paymentMode: 'credit' | 'cash';
  onSelectPaymentMode: (mode: 'credit' | 'cash') => void;
  onBack: () => void;
}

export function SaleTopBar({
  paymentMode,
  onSelectPaymentMode,
  onBack,
}: SaleTopBarProps): React.JSX.Element {
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
      {/* Back Arrow */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Screen Title */}
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        Sale
      </Text>

      {/* Mode Pill Toggle: [ Credit | Cash ] */}
      <View
        style={[
          styles.modePillContainer,
          { backgroundColor: colors.surfaceLight },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modePill,
            paymentMode === 'credit' && { backgroundColor: colors.success },
          ]}
          onPress={() => onSelectPaymentMode('credit')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.modePillTxt,
              paymentMode === 'credit'
                ? styles.modePillTxtActive
                : { color: colors.textSecondary },
            ]}
          >
            Credit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modePill,
            paymentMode === 'cash' && { backgroundColor: colors.success },
          ]}
          onPress={() => onSelectPaymentMode('cash')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.modePillTxt,
              paymentMode === 'cash'
                ? styles.modePillTxtActive
                : { color: colors.textSecondary },
            ]}
          >
            Cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Gear */}
      <TouchableOpacity
        style={styles.settingsBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() =>
          Alert.alert(
            'Sale Settings',
            'Configure default invoice prefixes, tax rates, and customer notes.'
          )
        }
        activeOpacity={0.7}
      >
        <Ionicons
          name="settings-outline"
          size={22}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
  },
  modePillContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
  },
  modePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modePillTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  modePillTxtActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  settingsBtn: {
    padding: 4,
  },
});

