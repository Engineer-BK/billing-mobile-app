/**
 * components/HomeScreen/QuickActionGrid.tsx
 * 
 * High-Speed POS Command Deck.
 * 4 distinctive action cards powered by FlashBill branding colors:
 * - Green: 🖨️ 1-Tap Push Print
 * - Orange: ⚡ New Sale / Item Catalog
 * - Indigo: 🔄 Switch 58mm / 80mm Hardware
 * - Cyan: 🔍 Bluetooth Scanner
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface QuickActionGridProps {
  isPrinting: boolean;
  isScanning: boolean;
  hasPrinter: boolean;
  selectedProfile: string;
  onPressPrint: () => void;
  onPressScan: () => void;
  onPressToggleProfile: () => void;
  onPressCatalog: () => void;
}

export function QuickActionGrid({
  isPrinting,
  isScanning,
  hasPrinter,
  selectedProfile,
  onPressPrint,
  onPressScan,
  onPressToggleProfile,
  onPressCatalog,
}: QuickActionGridProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </Text>

      <View style={styles.gridRow}>
        {/* 1. 1-Tap Push Print (Hero Green) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            (!hasPrinter || isPrinting) && styles.cardDisabled,
          ]}
          onPress={onPressPrint}
          disabled={!hasPrinter || isPrinting}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
            ]}
          >
            {isPrinting ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <MaterialCommunityIcons
                name="printer-pos"
                size={24}
                color={colors.success}
              />
            )}
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Push Print
          </Text>
          <Text style={[styles.cardSub, { color: colors.success }]}>
            {hasPrinter ? 'Ready • 1-Tap' : 'Link Printer First'}
          </Text>
        </TouchableOpacity>

        {/* 2. Bluetooth Scanner (Tech Cyan) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressScan}
          disabled={isScanning}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: 'rgba(0, 210, 255, 0.15)' },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <MaterialCommunityIcons
                name="bluetooth-audio"
                size={24}
                color={colors.accent}
              />
            )}
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {isScanning ? 'Scanning...' : 'Pair Printer'}
          </Text>
          <Text style={[styles.cardSub, { color: colors.accent }]}>
            Nearby Devices
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        {/* 3. Hardware Switcher Toggle (Indigo Purple) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressToggleProfile}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: 'rgba(99, 102, 241, 0.15)' },
            ]}
          >
            <MaterialCommunityIcons
              name="swap-horizontal-bold"
              size={24}
              color={colors.secondary}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Switch Roll
          </Text>
          <Text style={[styles.cardSub, { color: colors.secondary }]}>
            {selectedProfile === 'SC588' ? 'Now: 58mm (32 Col)' : 'Now: 80mm (48 Col)'}
          </Text>
        </TouchableOpacity>

        {/* 4. Product Catalog / Stock (Safety Orange) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressCatalog}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: 'rgba(249, 115, 22, 0.15)' },
            ]}
          >
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Catalog
          </Text>
          <Text style={[styles.cardSub, { color: colors.primary }]}>
            150+ Grocery Items
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});

