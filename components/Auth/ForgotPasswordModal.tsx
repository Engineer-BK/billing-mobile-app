/**
 * components/Auth/ForgotPasswordModal.tsx
 * 
 * Clean popup modal for requesting password reset via email.
 * Features:
 * - Email validation
 * - Outside click dismiss
 * - Clear confirmation feedback
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function ForgotPasswordModal({
  visible,
  onClose,
  initialEmail = '',
}: ForgotPasswordModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState<string>(initialEmail);
  const [loading, setLoading] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your registered store email.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSentSuccess(true);
    } else {
      Alert.alert('Reset Error', res.error || 'Could not send reset link.');
    }
  };

  const handleClose = () => {
    setSentSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalWrapper}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: isDark ? '#000000' : '#8899A6',
                  },
                ]}
              >
                {/* Header with Icon */}
                <View style={styles.headerRow}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                    <MaterialCommunityIcons name="lock-reset" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.headerTxtCol}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                      Reset Password
                    </Text>
                    <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                      Enter your store email to receive a recovery link
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {sentSuccess ? (
                  <View style={styles.successBox}>
                    <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" />
                    <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                      Link Dispatched!
                    </Text>
                    <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                      We sent a password recovery link to{' '}
                      <Text style={{ fontWeight: '700', color: colors.primary }}>{email}</Text>.
                      Please check your inbox.
                    </Text>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                      onPress={handleClose}
                    >
                      <Text style={styles.actionBtnTxt}>Back to Sign In</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.formContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      REGISTERED EMAIL
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={20}
                        color={colors.textMuted}
                        style={styles.fieldIcon}
                      />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="e.g. store@gmail.com"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {email.length > 0 && (
                        <TouchableOpacity onPress={() => setEmail('')}>
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={18}
                            color={colors.textMuted}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: colors.primary },
                        loading && { opacity: 0.7 },
                      ]}
                      onPress={handleSend}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.actionBtnTxt}>Send Reset Link</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTxtCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  formContainer: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
  },
  successDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
});
