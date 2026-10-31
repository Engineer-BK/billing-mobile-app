/**
 * components/Auth/AuthScreen.tsx
 * 
 * Top-Level Authentication Screen for FlashBill.
 * Orchestrates:
 * - Branded Hero Header with FlashBill icon & cloud-sync badge
 * - Segmented Tab Controller (Sign In vs Register Store)
 * - Dynamic LoginView & RegisterView switching
 * - ForgotPasswordModal trigger
 * - Light / Dark mode toggle in top corner
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export type AuthTab = 'login' | 'register';

interface AuthScreenProps {
  initialTab?: AuthTab;
}

export function AuthScreen({ initialTab = 'login' }: AuthScreenProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');

  const handleOpenForgot = (email: string) => {
    setForgotEmail(email);
    setShowForgotModal(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Top Utility Bar (Theme Switcher) */}
      <View style={styles.topUtilityRow}>
        <View style={styles.badgeRow}>
          <MaterialCommunityIcons name="cloud-check-outline" size={16} color={colors.primary} />
          <Text style={[styles.badgeTxt, { color: colors.primary }]}>Google Cloud Sync Ready</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
          onPress={toggleTheme}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={isDark ? 'weather-sunny' : 'weather-night'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Branding Header */}
          <View style={styles.heroSection}>
            <View style={[styles.logoCircle, { backgroundColor: isDark ? '#0A1128' : '#F0F9FF' }]}>
              <Image
                source={require('../../assets/flashBill-bg-removed-png-icon.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>FlashBill POS</Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              Fast Thermal Billing • Permanent Cloud Sync
            </Text>
          </View>

          {/* Segmented Controller [ Sign In ] [ Register Store ] */}
          <View
            style={[
              styles.segmentedTrack,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentedTab,
                activeTab === 'login' && [
                  styles.activeSegmentedTab,
                  { backgroundColor: colors.surface },
                ],
              ]}
              onPress={() => setActiveTab('login')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="login"
                size={16}
                color={activeTab === 'login' ? colors.primary : colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentedTabTxt,
                  {
                    color: activeTab === 'login' ? colors.primary : colors.textMuted,
                    fontWeight: activeTab === 'login' ? '800' : '600',
                  },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentedTab,
                activeTab === 'register' && [
                  styles.activeSegmentedTab,
                  { backgroundColor: colors.surface },
                ],
              ]}
              onPress={() => setActiveTab('register')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="store-plus-outline"
                size={16}
                color={activeTab === 'register' ? colors.primary : colors.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentedTabTxt,
                  {
                    color: activeTab === 'register' ? colors.primary : colors.textMuted,
                    fontWeight: activeTab === 'register' ? '800' : '600',
                  },
                ]}
              >
                Register Store
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card Container */}
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: isDark ? '#000000' : '#8899A6',
              },
            ]}
          >
            {activeTab === 'login' ? (
              <LoginView
                onSwitchToRegister={() => setActiveTab('register')}
                onOpenForgotPassword={handleOpenForgot}
              />
            ) : (
              <RegisterView onSwitchToLogin={() => setActiveTab('login')} />
            )}
          </View>

          {/* Security & Offline Badge */}
          <View style={styles.securityFooter}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
            <Text style={[styles.securityTxt, { color: colors.textMuted }]}>
              End-to-End Encrypted • 100% Free Forever Tier
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={forgotEmail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
  },
  logoImg: {
    width: 52,
    height: 52,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  segmentedTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeSegmentedTab: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedTabTxt: {
    fontSize: 13,
  },
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
});

