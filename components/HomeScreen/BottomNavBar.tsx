/**
 * components/HomeScreen/BottomNavBar.tsx
 * 
 * High-Speed Retail POS Bottom Navigation Dock.
 * Features:
 * - 4 First-Class Equal Tabs: [ Home ] [ Sale ] [ Invoices ] [ Printers ]
 * - Consistent across entire app: always visible on Home, Sale, Invoices, and Printers
 * - Active indicator pill and distinct icons
 * - Light and Dark theme dynamic binding
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type NavTabId = 'home' | 'sale' | 'bills' | 'hardware';

interface BottomNavBarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onPressNewSale?: () => void;
}

export function BottomNavBar({
  activeTab,
  onSelectTab,
}: BottomNavBarProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const tabs: Array<{
    id: NavTabId;
    label: string;
    activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
    inactiveIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  }> = [
    {
      id: 'home',
      label: 'Home',
      activeIcon: 'home-variant',
      inactiveIcon: 'home-variant-outline',
    },
    {
      id: 'sale',
      label: 'Sale',
      activeIcon: 'cart',
      inactiveIcon: 'cart-outline',
    },
    {
      id: 'bills',
      label: 'Invoices',
      activeIcon: 'receipt',
      inactiveIcon: 'receipt',
    },
    {
      id: 'hardware',
      label: 'Printers',
      activeIcon: 'printer',
      inactiveIcon: 'printer-outline',
    },
  ];

  return (
    <View
      style={[
        styles.dockContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: isDark ? '#000000' : '#8899A6',
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isActive && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.inactiveIcon}
                  size={22}
                  color={isActive ? colors.primary : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.tabTxt,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 16,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTxt: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
