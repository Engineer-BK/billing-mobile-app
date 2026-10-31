/**
 * components/WelcomeScreen.tsx
 * 
 * High-Speed Thermal POS Splash & Welcome Screen for FlashBill.
 * Features:
 * - Direct use of the transparent FlashBill brand emblem (assets/flash-bill-icon-for-any-usecases-app-icon-with-no-background.png)
 * - Pure, borderless, crisp emblem rendering with smooth spring/fade animation
 * - Elegant light theme default background with zero clipping artifacts
 * - Prominent Developer Info: Er. Basir Ahmed Khan, B.Tech(Software Engineer)
 * - Dual-Engine platform badges: Mobile POS + Thermal Bluetooth POS
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface WelcomeScreenProps {
  onFinish: () => void;
}

export function WelcomeScreen({ onFinish }: WelcomeScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Bottom Content Entrance
    Animated.timing(bottomFade, {
      toValue: 1,
      duration: 500,
      delay: 350,
      useNativeDriver: true,
    }).start();

    // 3. Auto-transition into app after 2.4 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, bottomFade, onFinish]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Bar with Skip Action */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.skipBtn,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.borderLight,
            },
          ]}
          onPress={onFinish}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipTxt, { color: colors.textSecondary }]}>
            Skip ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center Hero: Pure Transparent FlashBill Emblem & Branding */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Transparent Emblem with Subtle Ambient Halo */}
          <View
            style={[
              styles.haloContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(14, 165, 233, 0.12)'
                  : colors.primaryLight,
              },
            ]}
          >
            <Image
              source={require('../assets/flash-bill-icon-for-any-usecases-app-icon-with-no-background.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* FlashBill Typography */}
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            Flash<Text style={{ color: colors.primary }}>Bill</Text>
          </Text>

          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Lightning-Fast Thermal POS Billing
          </Text>

          {/* Dual Engine 58mm & 80mm Badge */}
          <View
            style={[
              styles.speedPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={{ fontSize: 13 }}>⚡</Text>
            <Text style={[styles.speedTxt, { color: colors.primary }]}>
              DUAL-ENGINE 58mm & 80mm POS
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Container: Platforms + Developer Info */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomFade }]}>
        {/* Hardware Architecture Badges */}
        <View style={styles.platformRow}>
          {/* Mobile POS Card */}
          <View
            style={[
              styles.platformCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>📱</Text>
            <Text style={[styles.platformLabel, { color: colors.textPrimary }]}>
              Mobile POS
            </Text>
            <Text style={[styles.platformSub, { color: colors.textSecondary }]}>
              Android App
            </Text>
          </View>

          <View style={styles.plusBox}>
            <Text style={[styles.plusTxt, { color: colors.secondary }]}>⚡</Text>
          </View>

          {/* Thermal Bluetooth POS Card */}
          <View
            style={[
              styles.platformCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>🖨️</Text>
            <Text style={[styles.platformLabel, { color: colors.textPrimary }]}>
              Thermal POS
            </Text>
            <Text style={[styles.platformSub, { color: colors.textSecondary }]}>
              Bluetooth 80/58
            </Text>
          </View>
        </View>

        {/* Developer Credit Card */}
        <View
          style={[
            styles.devCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.devHeaderRow}>
            <MaterialCommunityIcons
              name="shield-check"
              size={13}
              color={colors.primary}
            />
            <Text style={[styles.devLabel, { color: colors.textMuted }]}>
              DEVELOPER INFO
            </Text>
          </View>
          <Text style={[styles.devName, { color: colors.textPrimary }]}>
            Er. Basir Ahmed Khan
          </Text>
          <Text style={[styles.devRole, { color: colors.primary }]}>
            B.Tech (Software Engineer)
          </Text>
          <Text style={[styles.versionBadge, { color: colors.textMuted }]}>
            FlashBill v1.0.0 • Production POS
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  haloContainer: {
    width: 146,
    height: 146,
    borderRadius: 73,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  speedTxt: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
    width: '100%',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  platformCard: {
    flex: 1,
    maxWidth: 135,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  platformLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  platformSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  plusBox: {
    paddingHorizontal: 2,
  },
  plusTxt: {
    fontSize: 20,
    fontWeight: '900',
  },
  devCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  devLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  devName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  devRole: {
    fontSize: 11,
    fontWeight: '700',
  },
  versionBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.4,
  },
});
