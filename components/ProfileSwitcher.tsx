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
import { Colors } from '../constants/theme';

interface ProfileSwitcherProps {
  selectedProfile: PrinterProfileId;
  onSelectProfile: (profile: PrinterProfileId) => void;
}

export function ProfileSwitcher({
  selectedProfile,
  onSelectProfile,
}: ProfileSwitcherProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>SELECT PRINTER PROFILE</Text>
      <View style={styles.tabRow}>
        {/* Profile 1: SC588 */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedProfile === 'SC588' && styles.tabButtonActive,
          ]}
          onPress={() => onSelectProfile('SC588')}
        >
          <Text
            style={[
              styles.tabTitle,
              selectedProfile === 'SC588' && styles.tabTitleActive,
            ]}
          >
            SC588 (58mm)
          </Text>
          <Text
            style={[
              styles.tabSub,
              selectedProfile === 'SC588' && styles.tabSubActive,
            ]}
          >
            32 Col • 2-Inch
          </Text>
        </TouchableOpacity>

        {/* Profile 2: EZO 80UB */}
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedProfile === 'EZO80' && styles.tabButtonActive,
          ]}
          onPress={() => onSelectProfile('EZO80')}
        >
          <Text
            style={[
              styles.tabTitle,
              selectedProfile === 'EZO80' && styles.tabTitleActive,
            ]}
          >
            EZO 80UB (80mm)
          </Text>
          <Text
            style={[
              styles.tabSub,
              selectedProfile === 'EZO80' && styles.tabSubActive,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  tabTitleActive: {
    color: Colors.textPrimary,
  },
  tabSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabSubActive: {
    color: Colors.primary,
  },
});
