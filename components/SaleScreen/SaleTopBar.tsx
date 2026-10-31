/**
 * components/SaleScreen/SaleTopBar.tsx
 * 
 * Clean POS Sale Screen Top Bar.
 * Features:
 * - Back button with smooth navigation return
 * - "Sale" screen title
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleTopBarProps {
  onBack: () => void;
}

export function SaleTopBar({ onBack }: SaleTopBarProps): React.JSX.Element {
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
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
});


