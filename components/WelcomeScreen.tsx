/**
 * components/WelcomeScreen.tsx
 * 
 * High-Speed Thermal POS Splash & Welcome Screen for CounterPress.
 * Enterprise Edition - Clean, professional fintech styling.
 * 
 * Features:
 * - Elevated Squircle Emblem container with ambient shadow
 * - Clean brand typography and two-tone title
 * - Modern 2x2 capability chips (0ms Print, 58/80mm, Offline, Cloud)
 * - Real-time initialization progress bar
 * - Enterprise corporate footer (clean and professional)
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

  // Entrance & Progress Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1. Logo Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6.5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Bottom Content Entrance
    Animated.timing(bottomFade, {
      toValue: 1,
      duration: 500,
      delay: 250,
      useNativeDriver: true,
    }).start();

    // 3. Engine Initialization Progress Bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2300,
      useNativeDriver: false,
    }).start();

    // 4. Subtle Pulsing Status Dot
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 5. Auto-transition into app after 2.4 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [fadeAnim, scaleAnim, bottomFade, progressAnim, pulseAnim, onFinish]);

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

      {/* Top Navigation Bar with Minimalist Skip Action */}
      <View style={styles.topBar}>
        <View
          style={[
            styles.posBadge,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={13} color={colors.primary} />
          <Text style={[styles.posBadgeTxt, { color: colors.textSecondary }]}>
            POS ENGINE
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.skipBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onFinish}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipTxt, { color: colors.textSecondary }]}>
            Skip
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Center Hero: Elevated Squircle Card & Brand Identity */}
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
          {/* Elevated Modern Squircle Emblem */}
          <View
            style={[
              styles.squircleContainer,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border,
                shadowColor: colors.primary,
              },
            ]}
          >
            <Image
              source={require('../assets/counter-press-without-orange-background.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* CounterPress Typography */}
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            Counter<Text style={{ color: colors.primary }}>Press</Text>
          </Text>

          {/* Clean Enterprise Tagline */}
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            High-Speed Retail Billing & Thermal POS
          </Text>

          {/* Minimalist Feature Chips (2x2 Grid) */}
          <View style={styles.featuresContainer}>
            <View style={styles.featuresRow}>
              <View
                style={[
                  styles.featureChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.secondary} />
                <Text style={[styles.featureChipTxt, { color: colors.textPrimary }]}>
                  0ms Thermal Print
                </Text>
              </View>

              <View
                style={[
                  styles.featureChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons name="printer-pos" size={14} color={colors.primary} />
                <Text style={[styles.featureChipTxt, { color: colors.textPrimary }]}>
                  58mm & 80mm
                </Text>
              </View>
            </View>

            <View style={styles.featuresRow}>
              <View
                style={[
                  styles.featureChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons name="database-check-outline" size={14} color={colors.success} />
                <Text style={[styles.featureChipTxt, { color: colors.textPrimary }]}>
                  100% Offline Ready
                </Text>
              </View>

              <View
                style={[
                  styles.featureChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons name="cloud-sync-outline" size={14} color={colors.accent} />
                <Text style={[styles.featureChipTxt, { color: colors.textPrimary }]}>
                  Cloud Synced
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Container: Initialization Status + Enterprise Footer */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomFade }]}>
        {/* Engine Boot Status & Progress Line */}
        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.pulsingDot,
                {
                  backgroundColor: colors.primary,
                  opacity: pulseAnim,
                },
              ]}
            />
            <Text style={[styles.statusTxt, { color: colors.textSecondary }]}>
              Initializing Thermal POS Engine...
            </Text>
          </View>

          <View
            style={[
              styles.progressBarBg,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['5%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Clean Enterprise Corporate Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerShieldRow}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={13}
              color={colors.textMuted}
            />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              CounterPress POS • Enterprise Edition v1.0.0
            </Text>
          </View>
          <Text style={[styles.footerSubtext, { color: colors.textMuted }]}>
            High-Performance Offline Thermal Billing System
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  posBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  posBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  skipTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  squircleContainer: {
    width: 140,
    height: 140,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  logoImage: {
    width: 105,
    height: 105,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featureChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  featureChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: '100%',
    gap: 16,
  },
  statusBox: {
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusTxt: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerContainer: {
    alignItems: 'center',
    gap: 3,
  },
  footerShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  footerSubtext: {
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
