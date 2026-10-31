/**
 * components/HomeScreen/BottomNavBar.tsx
 * 
 * High-Speed Retail POS Bottom Navigation Dock.
 * Features:
 * - 4 clean section tabs (Home, Bills, Catalog, Hardware)
 * - Prominent elevated "+ New Sale" FAB with currency-inr icon
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type NavTabId = 'home' | 'bills' | 'sale' | 'hardware';

interface BottomNavBarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onPressNewSale: () => void;
}

export function BottomNavBar({
  activeTab,
  onSelectTab,
  onPressNewSale,
}: BottomNavBarProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.dockContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'home' ? 'home-variant' : 'home-variant-outline'}
            size={22}
            color={activeTab === 'home' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabTxt,
              { color: activeTab === 'home' ? colors.primary : colors.textMuted },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Hardware / Printers */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab('hardware')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={
              activeTab === 'hardware'
                ? 'printer-check'
                : 'printer'
            }
            size={22}
            color={activeTab === 'hardware' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabTxt,
              { color: activeTab === 'hardware' ? colors.primary : colors.textMuted },
            ]}
          >
            Printers
          </Text>
        </TouchableOpacity>

        {/* Center Floating Action Button (New Sale) */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity
            style={[
              styles.fabButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            onPress={onPressNewSale}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.fabTxt}>New Sale</Text>
          </TouchableOpacity>
        </View>

        {/* Tab 3: Sale */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab('sale')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'sale' ? 'cart' : 'cart-outline'}
            size={22}
            color={activeTab === 'sale' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabTxt,
              { color: activeTab === 'sale' ? colors.primary : colors.textMuted },
            ]}
          >
            Sale
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Invoices / Bills */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onSelectTab('bills')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="receipt"
            size={22}
            color={activeTab === 'bills' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabTxt,
              { color: activeTab === 'bills' ? colors.primary : colors.textMuted },
            ]}
          >
            Invoices
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabTxt: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  fabWrapper: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  fabTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

