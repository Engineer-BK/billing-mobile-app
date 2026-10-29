/**
 * components/HeaderBar.tsx
 * 
 * Top Application Bar featuring:
 * - POS Billing App branding
 * - 1-Tap ☀️ / 🌙 Dark & Light Mode Theme Switcher
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export function HeaderBar(): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.titleCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.brandBadge, { backgroundColor: colors.primary }]}>
            POS
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Billing & Print
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          SC588 (58mm) • EZO 80UB (80mm Auto-Cut)
        </Text>
      </View>

      {/* 1-Tap Dark / Light Switcher Pill */}
      <TouchableOpacity
        style={[
          styles.themeToggleBtn,
          {
            backgroundColor: colors.surfaceLight,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
        <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 14,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});

