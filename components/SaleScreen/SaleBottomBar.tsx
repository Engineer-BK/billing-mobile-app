/**
 * components/SaleScreen/SaleBottomBar.tsx
 * 
 * Bottom fixed action bar for POS Sale Screen.
 * Features:
 * - "Save & New" action: Saves bill and prepares next sequential invoice
 * - "Save" primary action: Commits sale to records
 * - "⋮" More options button (1-tap direct thermal print & clear)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleBottomBarProps {
  onSave: (andNew: boolean) => void;
  onMoreOptions: () => void;
}

export function SaleBottomBar({
  onSave,
  onMoreOptions,
}: SaleBottomBarProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bottomActionBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      {/* Save & New Button */}
      <TouchableOpacity
        style={styles.saveNewBtn}
        onPress={() => onSave(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.saveNewTxt, { color: colors.textPrimary }]}>
          Save & New
        </Text>
      </TouchableOpacity>

      {/* Primary Save Button */}
      <TouchableOpacity
        style={[
          styles.savePrimaryBtn,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => onSave(false)}
        activeOpacity={0.8}
      >
        <Text style={styles.savePrimaryTxt}>Save</Text>
      </TouchableOpacity>

      {/* ⋮ More Options Trigger */}
      <TouchableOpacity
        style={styles.moreOptionsBtn}
        onPress={onMoreOptions}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  saveNewBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNewTxt: {
    fontSize: 15,
    fontWeight: '700',
  },
  savePrimaryBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  savePrimaryTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moreOptionsBtn: {
    padding: 6,
  },
});

