/**
 * components/HomeScreen/FlashHeader.tsx
 * 
 * Distinctive High-Speed Retail POS Header.
 * Features:
 * - Store identity & verified merchant badge
 * - Live Bluetooth Printer Link pill with 1-tap connection trigger
 * - 1-Tap ☀️ / 🌙 theme switch pill
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface FlashHeaderProps {
  storeName: string;
  printerName: string;
  isConnected: boolean;
  onPressPrinterPill: () => void;
  onPressAccount?: () => void;
  onPressSignOut?: () => void;
  cloudStatus?: 'synced' | 'syncing' | 'offline';
}

export function FlashHeader({
  storeName,
  printerName,
  isConnected,
  onPressPrinterPill,
  onPressAccount,
  onPressSignOut,
  cloudStatus = 'synced',
}: FlashHeaderProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
      {/* Top Identity Row */}
      <View style={styles.topRow}>
        {/* Store Avatar & Name (Interactive Account Trigger) */}
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={onPressAccount}
          activeOpacity={onPressAccount ? 0.75 : 1}
        >
          <View
            style={[
              styles.avatarBox,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Image
              source={require('../../assets/flash-bill-icon-for-any-usecases-app-icon-with-no-background.png')}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.storeTextCol}>
            <View style={styles.storeNameRow}>
              <Text style={[styles.storeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {storeName}
              </Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={16}
                color="#0EA5E9"
              />
            </View>
            <View style={styles.subtitleRow}>
              <View
                style={[
                  styles.cloudIndicatorDot,
                  {
                    backgroundColor:
                      cloudStatus === 'synced'
                        ? '#10B981'
                        : cloudStatus === 'syncing'
                        ? '#F59E0B'
                        : '#94A3B8',
                  },
                ]}
              />
              <Text style={[styles.storeSubtitle, { color: colors.textSecondary }]}>
                {cloudStatus === 'synced'
                  ? 'Cloud Synced'
                  : cloudStatus === 'syncing'
                  ? 'Syncing...'
                  : 'Offline Mode'}{' '}
                • Active
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Header Right Actions: Account & Theme Toggle */}
        <View style={styles.rightActionsRow}>
          {onPressAccount && (
            <TouchableOpacity
              style={[
                styles.themePill,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
              onPress={onPressAccount}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={19} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* ☀️ / 🌙 Theme Toggle Button */}
          <TouchableOpacity
            style={[
              styles.themePill,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={16}
              color={isDark ? colors.secondary : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Printer Link Status Banner Pill */}
      <TouchableOpacity
        style={[
          styles.printerPill,
          {
            backgroundColor: isConnected
              ? colors.successLight
              : colors.primaryLight,
            borderColor: isConnected ? colors.success : colors.primary,
          },
        ]}
        onPress={onPressPrinterPill}
        activeOpacity={0.8}
      >
        <View style={styles.printerLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? colors.success : colors.primary },
            ]}
          />
          <MaterialCommunityIcons
            name={isConnected ? 'printer-check' : 'printer-alert'}
            size={18}
            color={isConnected ? colors.success : colors.primary}
          />
          <Text
            style={[
              styles.printerStatusTxt,
              { color: isConnected ? colors.success : colors.primary },
            ]}
          >
            {isConnected ? `Printer Bound: ${printerName}` : 'No Printer Bound • Tap to Scan'}
          </Text>
        </View>

        <View style={styles.printerRight}>
          <Text
            style={[
              styles.tapActionTxt,
              { color: isConnected ? colors.success : colors.primary },
            ]}
          >
            {isConnected ? 'Change' : 'Connect'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={isConnected ? colors.success : colors.primary}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  storeTextCol: {
    justifyContent: 'center',
    maxWidth: 200,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  cloudIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  storeSubtitle: {
    fontSize: 11,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themePill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  printerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  printerStatusTxt: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  printerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tapActionTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
});

