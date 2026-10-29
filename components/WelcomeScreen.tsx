/**
 * components/WelcomeScreen.tsx
 * 
 * Unique Animated Welcome / Splash Screen for FlashBill.
 * Features:
 * - Centered FlashBill brand emblem (using new flashBill2.png logo)
 * - App title & retail billing tagline
 * - Hardware platform badges at bottom: "Mobile + Thermal POS"
 * - Zero font dependency on boot for instant, crash-free launch
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
        { backgroundColor: isDark ? '#0A1322' : '#F8FAFC' },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0A1322' : '#F8FAFC'}
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
          <View style={styles.logoShadowBox}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.appName,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}
          >
            Flash<Text style={{ color: colors.primary }}>Bill</Text>
          </Text>

          <Text
            style={[
              styles.tagline,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}
          >
            Lightning-Fast Thermal POS Billing
          </Text>

          <View style={styles.speedPill}>
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
            { color: isDark ? '#64748B' : '#94A3B8' },
          ]}
        >
          AVAILABLE ON
        </Text>

        <View style={styles.platformRow}>
          {/* Mobile Platform */}
          <View style={styles.platformCard}>
            <View
              style={[
                styles.iconTile,
                {
                  backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            >
              <Text style={{ fontSize: 28 }}>📱</Text>
            </View>
            <Text
              style={[
                styles.platformLabel,
                { color: isDark ? '#F1F5F9' : '#0F172A' },
              ]}
            >
              Mobile
            </Text>
            <Text style={styles.platformSub}>Android POS</Text>
          </View>

          {/* Plus Connector */}
          <View style={styles.plusBox}>
            <Text style={[styles.plusTxt, { color: colors.primary }]}>+</Text>
          </View>

          {/* Thermal Bluetooth POS */}
          <View style={styles.platformCard}>
            <View
              style={[
                styles.iconTile,
                {
                  backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            >
              <Text style={{ fontSize: 28 }}>🖨️</Text>
            </View>
            <Text
              style={[
                styles.platformLabel,
                { color: isDark ? '#F1F5F9' : '#0F172A' },
              ]}
            >
              Thermal POS
            </Text>
            <Text style={styles.platformSub}>Bluetooth</Text>
          </View>
        </View>

        <Text style={styles.versionTxt}>v1.0.0 • Production Ready</Text>
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
    shadowColor: '#00D2FF',
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
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  speedTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  availableOnTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  platformCard: {
    alignItems: 'center',
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 6,
  },
  platformLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  platformSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  plusBox: {
    paddingBottom: 16,
  },
  plusTxt: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  versionTxt: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 16,
    letterSpacing: 0.4,
  },
});
