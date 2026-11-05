/**
 * components/License/ActivationModal.tsx
 * 
 * High-Converting Store Activation & Voucher Redemption Modal (Module 2.4).
 * 
 * Features:
 * - 100% Complete, non-scrollable Verified State dialog with zero clipping
 * - 16-character alphanumeric voucher code input with automatic formatting
 * - 1-Tap "Activate Store" with Firestore transaction verification
 * - "Contact Admin on WhatsApp" for direct B2B UPI payment & instant key delivery
 * - Visual indicators for Activated vs Free Tier accounts
 * - Light and Dark theme dynamic styling
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useLicense } from '../../context/LicenseContext';
import { licenseService } from '../../services/licenseService';

interface ActivationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ActivationModal({
  visible,
  onClose,
}: ActivationModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { isActivated, plan, licenseKey, redeemVoucher } = useLicense();

  const [inputKey, setInputKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Format key as user types (XXXX-XXXX-XXXX-XXXX)
  const handleKeyChange = (text: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const formatted = licenseService.formatLicenseKey(text);
    setInputKey(formatted);
  };

  // Submit Voucher Redemption
  const handleRedeem = async () => {
    if (!inputKey.trim()) {
      setErrorMessage('Please enter your 16-character activation code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await redeemVoucher(inputKey);
      if (res.success) {
        setSuccessMessage(res.message);
        setInputKey('');
        Alert.alert(
          '🎉 Store Activated!',
          res.message,
          [{ text: 'Start Printing', onPress: onClose }]
        );
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to redeem voucher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open WhatsApp directly to Admin
  const handleContactWhatsApp = async () => {
    const url = licenseService.getWhatsAppSalesUrl(user?.shopName, user?.email);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp Not Found',
          'Please WhatsApp us at +91 86385 14961 with your store name to get your activation token.'
        );
      }
    } catch {
      Alert.alert(
        'Contact Admin',
        'Please WhatsApp us at +91 86385 14961 with your store name to get your activation token.'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardWrap}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: isDark ? '#000000' : '#8899A6',
                  },
                ]}
              >
                {/* 1. ACTIVATED STATE: 100% Complete & Non-Scrollable */}
                {isActivated ? (
                  <View style={styles.activatedCardBody}>
                    {/* Header Row: Badge & Close */}
                    <View style={styles.headerRow}>
                      <View
                        style={[
                          styles.planBadge,
                          { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7' },
                        ]}
                      >
                        <MaterialCommunityIcons name="shield-check" size={15} color="#16A34A" />
                        <Text style={styles.planBadgeTxt}>{plan} PRO LICENSE</Text>
                      </View>

                      <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.closeBtn}
                      >
                        <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Celebration Icon & Title */}
                    <View style={styles.titleSection}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                            borderColor: '#10B981',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons name="check-decagram" size={38} color="#10B981" />
                      </View>

                      <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Store Activated & Verified
                      </Text>
                      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Your store "{user?.shopName || 'CounterPress Store'}" has lifetime access to 0ms thermal printing on 58mm and 80mm rolls.
                      </Text>
                    </View>

                    {/* Active License Details Box */}
                    <View
                      style={[
                        styles.activeLicenseBox,
                        {
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#F0FDF4',
                          borderColor: '#86EFAC',
                        },
                      ]}
                    >
                      <View style={styles.licenseRow}>
                        <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>Status:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <View style={styles.greenDot} />
                          <Text style={styles.activeTxt}>Active & Verified</Text>
                        </View>
                      </View>

                      <View style={styles.licenseRow}>
                        <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>Plan:</Text>
                        <Text style={[styles.licenseValue, { color: colors.textPrimary }]}>{plan}</Text>
                      </View>

                      {licenseKey ? (
                        <View style={styles.licenseRow}>
                          <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>Key:</Text>
                          <Text style={[styles.licenseKeyTxt, { color: colors.primary }]}>{licenseKey}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Prominent Bottom Action Button */}
                    <TouchableOpacity
                      style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                      onPress={onClose}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.doneBtnTxt}>Continue to POS</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* 2. FREE TIER / VOUCHER REDEMPTION STATE */
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                  >
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                      <View
                        style={[
                          styles.planBadge,
                          {
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons name="lock-outline" size={14} color="#D97706" />
                        <Text style={[styles.planBadgeTxt, { color: '#D97706' }]}>
                          FREE TIER (PRINTER LOCKED)
                        </Text>
                      </View>

                      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Icon & Title */}
                    <View style={styles.titleSection}>
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : '#EFF6FF',
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons name="key-star" size={34} color={colors.primary} />
                      </View>

                      <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Activate Thermal Printing
                      </Text>
                      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Unlock 0ms high-speed thermal printing, store headers, and permanent cloud ledger.
                      </Text>
                    </View>

                    {/* Voucher Redemption Form */}
                    <View style={styles.formContainer}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                        ENTER 16-CHAR ACTIVATION VOUCHER
                      </Text>

                      <View
                        style={[
                          styles.inputBox,
                          {
                            backgroundColor: colors.surfaceLight,
                            borderColor: errorMessage ? '#EF4444' : colors.border,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={colors.primary} />
                        <TextInput
                          style={[styles.textInput, { color: colors.textPrimary }]}
                          value={inputKey}
                          onChangeText={handleKeyChange}
                          placeholder="FLASH-XXXX-XXXX-XXXX"
                          placeholderTextColor={colors.textMuted}
                          autoCapitalize="characters"
                          maxLength={20}
                          autoCorrect={false}
                        />
                        {inputKey.length > 0 ? (
                          <TouchableOpacity onPress={() => setInputKey('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {/* Error or Success Feedback Banner */}
                      {errorMessage ? (
                        <View style={styles.errorBox}>
                          <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                          <Text style={styles.errorTxt}>{errorMessage}</Text>
                        </View>
                      ) : null}

                      {successMessage ? (
                        <View style={styles.successBox}>
                          <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                          <Text style={styles.successTxt}>{successMessage}</Text>
                        </View>
                      ) : null}

                      {/* Redeem Button */}
                      <TouchableOpacity
                        style={[
                          styles.primaryBtn,
                          {
                            backgroundColor: colors.primary,
                            opacity: isSubmitting ? 0.7 : 1,
                          },
                        ]}
                        onPress={handleRedeem}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <MaterialCommunityIcons name="rocket-launch" size={18} color="#FFFFFF" />
                            <Text style={styles.primaryBtnTxt}>Activate Store Now</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      {/* Divider */}
                      <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                        <Text style={[styles.dividerTxt, { color: colors.textMuted }]}>DON'T HAVE A KEY?</Text>
                        <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                      </View>

                      {/* WhatsApp Sales Button */}
                      <TouchableOpacity
                        style={styles.whatsAppBtn}
                        onPress={handleContactWhatsApp}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
                        <Text style={styles.whatsAppBtnTxt}>Get Key via WhatsApp (Instant UPI)</Text>
                      </TouchableOpacity>

                      <Text style={[styles.helpSubtext, { color: colors.textMuted }]}>
                        Send your store name on WhatsApp for instant activation key or remote enablement in 30 seconds.
                      </Text>
                    </View>
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardWrap: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  activatedCardBody: {
    padding: 22,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  planBadgeTxt: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#16A34A',
  },
  closeBtn: {
    padding: 4,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  activeLicenseBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 9,
    marginBottom: 18,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licenseLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  activeTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  licenseValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  licenseKeyTxt: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 6,
  },
  doneBtnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingVertical: 0,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  errorTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 6,
  },
  successTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    flex: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 14,
    gap: 8,
  },
  primaryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerTxt: {
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  whatsAppBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  helpSubtext: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 15,
    paddingHorizontal: 8,
  },
});
