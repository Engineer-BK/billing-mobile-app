/**
 * components/HomeScreen/QuickActionGrid.tsx
 * 
 * High-Speed POS Retail Command Deck.
 * 4 distinctive action cards powered by FlashBill branding colors:
 * - Emerald: 🛒 + New Sale (Create fresh transaction)
 * - Cyan/Tech Blue: 🧾 Invoices & Bills (View bill history & search)
 * - Lightning Gold: 🖨️ Thermal Printers (Jump directly to dedicated printer tab)
 * - Royal Blue: 📦 Product Catalog (150+ Grocery Items)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface QuickActionGridProps {
  onPressNewSale: () => void;
  onPressInvoices: () => void;
  onPressCatalog: () => void;
  onPressPrinters: () => void;
}

export function QuickActionGrid({
  onPressNewSale,
  onPressInvoices,
  onPressCatalog,
  onPressPrinters,
}: QuickActionGridProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </Text>

      <View style={styles.gridRow}>
        {/* 1. New Sale (Hero Emerald) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressNewSale}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: colors.successLight },
            ]}
          >
            <MaterialCommunityIcons
              name="cart-plus"
              size={24}
              color={colors.success}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            New Sale
          </Text>
          <Text style={[styles.cardSub, { color: colors.success }]}>
            Create Bill • 1-Tap
          </Text>
        </TouchableOpacity>

        {/* 2. Invoices (Electric Tech Blue) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressInvoices}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="receipt"
              size={24}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Invoices
          </Text>
          <Text style={[styles.cardSub, { color: colors.primary }]}>
            History & Search
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        {/* 3. Product Catalog (Royal Blue) */}
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
              { backgroundColor: colors.primaryLight },
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

        {/* 4. Thermal Printers Shortcut (Lightning Gold) */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onPressPrinters}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconTile,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <MaterialCommunityIcons
              name="printer-pos"
              size={24}
              color={colors.secondary}
            />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Printers
          </Text>
          <Text style={[styles.cardSub, { color: colors.secondary }]}>
            58mm / 80mm Setup
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
