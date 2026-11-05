/**
 * components/About/AboutModal.tsx
 * 
 * Classy, comprehensive "About FlashBill" modal for FlashBill POS.
 * Displays:
 * - App overview & core mission (Offline-first 0ms thermal billing)
 * - Current version & official release date
 * - Google Play Store update launcher (deep-link + web fallback)
 * - Developer info & direct email support link (bachirak47@gmail.com)
 * - Clean, non-collapsing, hardware-accelerated layout
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  Linking,
  Alert,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const APP_VERSION = '1.0.0';
export const APP_BUILD = '100';
export const APP_RELEASE_DATE = 'November 4, 2026';
export const DEVELOPER_EMAIL = 'bachirak47@gmail.com';
export const DEVELOPER_NAME = 'Er. Basir Ahmed Khan';
export const DEVELOPER_QUALIFICATION = 'B.Tech (Software Engineer)';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.aftabrental.billingapp';
export const PLAY_STORE_MARKET_URL = 'market://details?id=com.aftabrental.billingapp';

export function AboutModal({ visible, onClose }: AboutModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const [copied, setCopied] = useState<boolean>(false);

  // Bounded modal height: keeps modal centered and elevated above Android navigation bar
  const maxModalHeight = Math.min(Math.round(screenHeight * 0.82), 620);

  const handleCopyEmail = () => {
    try {
      Clipboard.setString(DEVELOPER_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Email Copied', DEVELOPER_EMAIL);
    }
  };

  const handleOpenPlayStore = async () => {
    try {
      const canOpen = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
      if (canOpen) {
        await Linking.openURL(PLAY_STORE_MARKET_URL);
      } else {
        await Linking.openURL(PLAY_STORE_URL);
      }
    } catch {
      Linking.openURL(PLAY_STORE_URL).catch(() => {
        Alert.alert(
          'Play Store Link',
          `Visit CounterPress on Google Play Store:\n${PLAY_STORE_URL}`
        );
      });
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('CounterPress POS - Feedback & Support');
    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${subject}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Developer Email',
        `Send feedback or feature requests directly to:\n${DEVELOPER_EMAIL}`
      );
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* Fullscreen touchable backdrop to dismiss without capturing scroll gestures inside card */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close about modal"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrapper}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: isDark ? '#000000' : '#8899A6',
                maxHeight: maxModalHeight,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.headerRow, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIconBox,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="information-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.headerTitleCol}>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    About CounterPress
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    App Details, Version & Developer
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.borderLight,
                  },
                ]}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
                accessibilityLabel="Close about modal"
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content Body */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              bounces={false}
            >
              {/* App Brand & Identity Hero */}
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.appLogoBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/counter-press-without-orange-background.png')}
                    style={styles.appLogoImg}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.heroTextCol}>
                  <View style={styles.heroTitleRow}>
                    <Text style={[styles.heroAppName, { color: colors.textPrimary }]}>
                      CounterPress POS
                    </Text>
                    <View style={[styles.proBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.proBadgeTxt, { color: colors.primary }]}>PRO</Text>
                    </View>
                  </View>
                  <Text style={[styles.heroTagline, { color: colors.textSecondary }]}>
                    High-Speed Offline Billing & Thermal POS
                  </Text>
                </View>
              </View>

              {/* App Description Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  ABOUT THE APPLICATION
                </Text>

                <View
                  style={[
                    styles.descCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text style={[styles.descText, { color: colors.textPrimary }]}>
                    CounterPress is a specialized, enterprise-grade mobile Point of Sale and billing application built for retail shops, supermarkets, grocery stores, and mobile vendors.
                  </Text>
                  <Text style={[styles.descSubtext, { color: colors.textSecondary }]}>
                    Engineered with an offline-first architecture, CounterPress delivers 0ms instant Bluetooth thermal receipt printing on 58mm and 80mm paper rolls, fast barcode lookup, preset catalog management, and automated Google Cloud backup.
                  </Text>
                </View>
              </View>

              {/* Developer & Support Contact Section (Moved right after About the App) */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  DEVELOPER & LEAD ENGINEER
                </Text>

                <View
                  style={[
                    styles.developerCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <View style={styles.devHeader}>
                    <View
                      style={[
                        styles.devAvatarBox,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Image
                        source={require('../../assets/developer_image.png')}
                        style={styles.devAvatarImg}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.devTextCol}>
                      <Text style={[styles.devName, { color: colors.textPrimary }]}>
                        {DEVELOPER_NAME}
                      </Text>
                      <Text style={[styles.devRole, { color: colors.primary, fontWeight: '700' }]}>
                        {DEVELOPER_QUALIFICATION}
                      </Text>
                    </View>
                  </View>

                  {/* Email Support Box with Copy Action */}
                  <View
                    style={[
                      styles.emailContainer,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={styles.emailLeft}>
                      <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} />
                      <Text style={[styles.emailTxt, { color: colors.textPrimary }]} numberOfLines={1}>
                        {DEVELOPER_EMAIL}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.copyBtn,
                        {
                          backgroundColor: copied
                            ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7')
                            : colors.surfaceLight,
                          borderColor: copied ? '#10B981' : colors.borderLight,
                        },
                      ]}
                      onPress={handleCopyEmail}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                      accessibilityLabel="Copy developer email"
                    >
                      <MaterialCommunityIcons
                        name={copied ? 'check' : 'content-copy'}
                        size={15}
                        color={copied ? '#10B981' : colors.primary}
                      />
                      <Text
                        style={[
                          styles.copyBtnTxt,
                          { color: copied ? '#10B981' : colors.primary },
                        ]}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Action: Send Email */}
                  <TouchableOpacity
                    style={[styles.emailActionBtn, { borderColor: colors.primary }]}
                    onPress={handleSendEmail}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="email-fast-outline" size={18} color={colors.primary} />
                    <Text style={[styles.emailActionBtnTxt, { color: colors.primary }]}>
                      Send Email to Developer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Version & Release Info Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  VERSION & RELEASE INFO
                </Text>

                <View
                  style={[
                    styles.infoTableCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  {/* Current Version */}
                  <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
                    <View style={styles.infoRowLeft}>
                      <MaterialCommunityIcons name="code-tags" size={18} color={colors.primary} />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Current Version
                      </Text>
                    </View>
                    <View style={[styles.versionPill, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.versionPillTxt, { color: colors.primary }]}>
                        v{APP_VERSION} ({APP_BUILD})
                      </Text>
                    </View>
                  </View>

                  {/* Release Date */}
                  <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
                    <View style={styles.infoRowLeft}>
                      <MaterialCommunityIcons name="calendar-clock-outline" size={18} color={colors.secondary} />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Release Date
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                      {APP_RELEASE_DATE}
                    </Text>
                  </View>

                  {/* Architecture */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                      <MaterialCommunityIcons name="shield-check-outline" size={18} color="#10B981" />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Engine & Status
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '800' }]}>
                      Production • Offline POS
                    </Text>
                  </View>
                </View>
              </View>

              {/* Google Play Store Updates Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  GOOGLE PLAY STORE
                </Text>

                <View
                  style={[
                    styles.playStoreCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <View style={styles.playStoreHeader}>
                    <View style={[styles.playIconBox, { backgroundColor: '#0F9D58' }]}>
                      <MaterialCommunityIcons name="google-play" size={22} color="#FFFFFF" />
                    </View>
                    <View style={styles.playTextCol}>
                      <Text style={[styles.playCardTitle, { color: colors.textPrimary }]}>
                        Check for Updates
                      </Text>
                      <Text style={[styles.playCardSub, { color: colors.textSecondary }]}>
                        Keep CounterPress updated with latest printer drivers & fixes
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.playStoreBtn, { backgroundColor: colors.primary }]}
                    onPress={handleOpenPlayStore}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="google-play" size={18} color="#FFFFFF" />
                    <Text style={styles.playStoreBtnTxt}>Update on Google Play</Text>
                    <MaterialCommunityIcons name="open-in-new" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* App Trademark & Footer Note */}
              <View style={styles.footerNoteBox}>
                <Text style={[styles.footerHeartTxt, { color: colors.textSecondary }]}>
                  Crafted with ❤️ for fast Indian & global retail businesses.
                </Text>
                <Text style={[styles.footerCopyrightTxt, { color: colors.textMuted }]}>
                  © 2026 CounterPress POS. All rights reserved.
                </Text>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 36,
    paddingBottom: Platform.OS === 'android' ? 56 : 36,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrollBody: {
    flexShrink: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
  },
  appLogoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appLogoImg: {
    width: 38,
    height: 38,
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroAppName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  proBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeTxt: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  descCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  descText: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
  descSubtext: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  infoTableCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  versionPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionPillTxt: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  playStoreCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  playStoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  playIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playTextCol: {
    flex: 1,
  },
  playCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  playCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  playStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    gap: 8,
  },
  playStoreBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  developerCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  devAvatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  devAvatarImg: {
    width: '100%',
    height: '100%',
  },
  devTextCol: {
    flex: 1,
  },
  devName: {
    fontSize: 14,
    fontWeight: '800',
  },
  devRole: {
    fontSize: 11,
    marginTop: 1,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  emailLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 6,
  },
  emailTxt: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    gap: 4,
    flexShrink: 0,
  },
  copyBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  emailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  emailActionBtnTxt: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  footerNoteBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerHeartTxt: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerCopyrightTxt: {
    fontSize: 10,
    textAlign: 'center',
  },
});

