/**
 * components/SaleScreen/SaleBottomBar.tsx
 * 
 * Bottom fixed action bar for POS Sale Screen.
 * Features:
 * - "Save & New" action: Structured secondary outlined button with icon and soft blue tint
 * - "Save Bill" primary action: Solid high-contrast button with checkmark icon
 * - "⋮" More options button: 48px square surface button for thermal print & reset
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SaleBottomBarProps {
  isEditing?: boolean;
  onSave: (andNew: boolean) => void;
  onCancelEdit?: () => void;
  onMoreOptions: () => void;
}

export function SaleBottomBar({
  isEditing = false,
  onSave,
  onCancelEdit,
  onMoreOptions,
}: SaleBottomBarProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

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
      {/* 1. Secondary Action Button (Cancel Edit if editing, else Save & New) */}
      {isEditing ? (
        <TouchableOpacity
          style={[
            styles.saveNewBtn,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
              borderColor: colors.error,
            },
          ]}
          onPress={onCancelEdit}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={18}
            color={colors.error}
          />
          <Text style={[styles.saveNewTxt, { color: colors.error }]}>
            Cancel Edit
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.saveNewBtn,
            {
              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.12)' : '#EFF6FF',
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onSave(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.saveNewTxt, { color: colors.primary }]}>
            Save & New
          </Text>
        </TouchableOpacity>
      )}

      {/* 2. Primary Solid Action Button */}
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
        <MaterialCommunityIcons
          name="content-save-check-outline"
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.savePrimaryTxt}>
          {isEditing ? 'Update Bill' : 'Save Bill'}
        </Text>
      </TouchableOpacity>

      {/* 3. More Options (⋮) Button */}
      <TouchableOpacity
        style={[
          styles.moreOptionsBtn,
          {
            backgroundColor: colors.surfaceLight,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={onMoreOptions}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={22}
          color={colors.textPrimary}
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
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    gap: 10,
  },
  saveNewBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  saveNewTxt: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  savePrimaryBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  savePrimaryTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  moreOptionsBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
