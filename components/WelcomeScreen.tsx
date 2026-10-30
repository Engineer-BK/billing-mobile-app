/**
 * components/WelcomeScreen.tsx
 * 
 * Unique Animated Welcome / Splash Screen for FlashBill.
 * Features:
 * - Centered FlashBill brand emblem (using new flashBill2.png logo)
 * - App title & retail billing tagline
 * - Hardware platform badges at bottom: "Mobile + Thermal POS"
 * - Zero font dependency on boot for instant, crash-free launch
 * - Fully bound to FlashBill branding colors (constants/theme.ts)
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
import { useTheme } from '../hooks/useTheme';

interface WelcomeScreenProps {
  onFinish: () => void;
}

export function WelcomeScreen({ onFinish }: WelcomeScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Bottom Badge Entrance
    Animated.timing(bottomFade, {
      toValue: 1,
      duration: 600,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // 3. Auto-transition after 2.4 seconds
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

      {/* Top Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.skipBtn, { backgroundColor: colors.surfaceLight }]}
          onPress={onFinish}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipTxt, { color: colors.textSecondary }]}>
            Skip ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Center Hero Emblem & Branding */}
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
          {/* New FlashBill2 Logo with glow */}
          <View style={[styles.logoShadowBox, { shadowColor: colors.primary }]}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.appName,
              { color: colors.textPrimary },
            ]}
          >
            Flash<Text style={{ color: colors.primary }}>Bill</Text>
          </Text>

          <Text
            style={[
              styles.tagline,
              { color: colors.textSecondary },
            ]}
          >
            Lightning-Fast Thermal POS Billing
          </Text>

          <View style={[styles.speedPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <Text style={{ fontSize: 13 }}>⚡</Text>
            <Text style={[styles.speedTxt, { color: colors.primary }]}>
              DUAL-ENGINE 58mm & 80mm
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Platform Architecture: Mobile + Bluetooth POS (matches requested layout) */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomFade }]}>
        <Text
          style={[
            styles.availableOnTitle,
            { color: colors.textMuted },
          ]}
        >
          AVAILABLE ON
        </Text>

        <View style={styles.platformRow}>
          {/* Mobile Platform */}
          <View style={[styles.platformCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.iconTile,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text style={{ fontSize: 28 }}>📱</Text>
            </View>
            <Text
              style={[
                styles.platformLabel,
                { color: colors.textPrimary },
              ]}
            >
              Mobile
            </Text>
            <Text style={[styles.platformSub, { color: colors.textSecondary }]}>Android POS</Text>
          </View>

          {/* Plus Connector */}
          <View style={styles.plusBox}>
            <Text style={[styles.plusTxt, { color: colors.secondary }]}>⚡</Text>
          </View>

          {/* Thermal Bluetooth POS */}
          <View style={[styles.platformCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View
              style={[
                styles.iconTile,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text style={{ fontSize: 28 }}>🖨️</Text>
            </View>
            <Text
              style={[
                styles.platformLabel,
                { color: colors.textPrimary },
              ]}
            >
              Thermal POS
            </Text>
            <Text style={[styles.platformSub, { color: colors.textSecondary }]}>Bluetooth</Text>
          </View>
        </View>

        <Text style={[styles.versionTxt, { color: colors.textMuted }]}>v1.0.0 • Production Ready</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoShadowBox: {
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 18,
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 28,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  speedTxt: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  availableOnTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
    width: '100%',
  },
  platformCard: {
    flex: 1,
    maxWidth: 130,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  platformLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  platformSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  plusBox: {
    paddingHorizontal: 4,
  },
  plusTxt: {
    fontSize: 22,
    fontWeight: '900',
  },
  versionTxt: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
