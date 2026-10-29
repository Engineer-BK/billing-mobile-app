/**
 * components/ProfileSwitcher.tsx
 * 
 * Interactive Hardware Profile Switcher.
 * Allows the user to toggle between:
 * - SC588 (58mm / 32 columns / manual tear)
 * - EZO 80UB (80mm / 48 columns / motorized auto-cutter)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PrinterProfileId } from '../types/printer';
import { useTheme } from '../hooks/useTheme';

interface ProfileSwitcherProps {
  selectedProfile: PrinterProfileId;
  onSelectProfile: (profile: PrinterProfileId) => void;
}

export function ProfileSwitcher({
  selectedProfile,
  onSelectProfile,
}: ProfileSwitcherProps): React.JSX.Element {
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
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        SELECT PRINTER PROFILE
      </Text>
      <View style={styles.tabRow}>
        {/* Profile 1: SC588 */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                selectedProfile === 'SC588'
                  ? colors.primaryLight
                  : colors.surfaceLight,
              borderColor:
                selectedProfile === 'SC588'
                  ? colors.primary
                  : 'transparent',
            },
          ]}
          onPress={() => onSelectProfile('SC588')}
        >
          <Text
            style={[
              styles.tabTitle,
              {
                color:
                  selectedProfile === 'SC588'
                    ? colors.textPrimary
                    : colors.textSecondary,
              },
            ]}
          >
            SC588 (58mm)
          </Text>
          <Text
            style={[
              styles.tabSub,
              {
                color:
                  selectedProfile === 'SC588'
                    ? colors.primary
                    : colors.textMuted,
              },
            ]}
          >
            32 Col • 2-Inch
          </Text>
        </TouchableOpacity>

        {/* Profile 2: EZO 80UB */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            {
              backgroundColor:
                selectedProfile === 'EZO80'
                  ? colors.primaryLight
                  : colors.surfaceLight,
              borderColor:
                selectedProfile === 'EZO80'
                  ? colors.primary
                  : 'transparent',
            },
          ]}
          onPress={() => onSelectProfile('EZO80')}
        >
          <Text
            style={[
              styles.tabTitle,
              {
                color:
                  selectedProfile === 'EZO80'
                    ? colors.textPrimary
                    : colors.textSecondary,
              },
            ]}
          >
            EZO 80UB (80mm)
          </Text>
          <Text
            style={[
              styles.tabSub,
              {
                color:
                  selectedProfile === 'EZO80'
                    ? colors.primary
                    : colors.textMuted,
              },
            ]}
          >
            48 Col • Auto-Cut
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
