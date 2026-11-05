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
  onPressMenu?: () => void;
  onPressSettings?: () => void;
  onPressAccount?: () => void;
  onPressSignOut?: () => void;
  cloudStatus?: 'synced' | 'syncing' | 'offline';
  isGuest?: boolean;
  isActivated?: boolean;
  onPressActivate?: () => void;
}

export function FlashHeader({
  storeName,
  printerName,
  isConnected,
  onPressPrinterPill,
  onPressMenu,
  onPressSettings,
  onPressAccount,
  onPressSignOut,
  cloudStatus = 'synced',
  isGuest = false,
  isActivated = false,
  onPressActivate,
}: FlashHeaderProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
      {/* Top Identity Row: [ ☰ Drawer ] [ Store Identity ] [ ⚙️ Settings ] */}
      <View style={styles.topRow}>
        {/* Left: Modern Hamburger Drawer Toggle */}
        {onPressMenu && (
          <TouchableOpacity
            style={[
              styles.menuPill,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
            onPress={onPressMenu}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="menu" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Center: Store Avatar & Name (Interactive Account Trigger) */}
        <TouchableOpacity
          style={styles.storeInfo}
          onPress={onPressAccount || onPressMenu}
          activeOpacity={0.75}
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
              source={require('../../assets/counter-press-without-orange-background.png')}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.storeTextCol}>
            <View style={styles.storeNameRow}>
              <Text style={[styles.storeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {storeName}
              </Text>
              {isGuest ? (
                <View
                  style={{
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    marginLeft: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706' }}>
                    DEMO
                  </Text>
                </View>
              ) : isActivated ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    marginLeft: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#0EA5E9"
                    style={styles.verifiedIcon}
                  />
                  <View
                    style={{
                      backgroundColor: isDark ? 'rgba(14, 165, 233, 0.2)' : '#E0F2FE',
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#0284C7' }}>PRO</Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onPressActivate || onPressAccount}
                  style={{
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    marginLeft: 6,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706' }}>
                    FREE TIER
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.subtitleRow}>
              <View
                style={[
                  styles.cloudIndicatorDot,
                  {
                    backgroundColor: isGuest
                      ? '#F59E0B'
                      : !isActivated
                      ? '#F59E0B'
                      : cloudStatus === 'synced'
                      ? '#10B981'
                      : cloudStatus === 'syncing'
                      ? '#F59E0B'
                      : '#94A3B8',
                  },
                ]}
              />
              <Text
                style={[
                  styles.storeSubtitle,
                  { color: isGuest || !isActivated ? '#D97706' : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {isGuest
                  ? 'Demo Mode • Printer Locked'
                  : !isActivated
                  ? 'Free Tier • Printer Locked (Tap to Activate)'
                  : (cloudStatus === 'synced'
                      ? 'Cloud Synced'
                      : cloudStatus === 'syncing'
                      ? 'Syncing...'
                      : 'Offline Mode') + ' • Pro Store'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right: Classy Single Settings Gear Action */}
        <View style={styles.rightActionsRow}>
          {onPressSettings && (
            <TouchableOpacity
              style={[
                styles.actionPill,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
              onPress={onPressSettings}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="cog-outline" size={21} color={colors.primary} />
            </TouchableOpacity>
          )}
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
            numberOfLines={1}
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  storeTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  verifiedIcon: {
    flexShrink: 0,
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
    flexShrink: 0,
  },
  storeSubtitle: {
    fontSize: 11,
    flexShrink: 1,
  },
  menuPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  printerStatusTxt: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  printerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  tapActionTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
});

