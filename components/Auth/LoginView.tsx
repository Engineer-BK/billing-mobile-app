/**
 * components/Auth/LoginView.tsx
 * 
 * POS Store Login View.
 * Features:
 * - Email and Password inputs with prefix icons & clear actions
 * - Password visibility toggle
 * - "Remember Me" toggle
 * - Forgot Password trigger modal
 * - Quick Demo Sign In for instant testing
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onOpenForgotPassword: (email: string) => void;
}

export function LoginView({
  onSwitchToRegister,
  onOpenForgotPassword,
}: LoginViewProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { signIn, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleLogin = async () => {
    clearError();
    const res = await signIn(email, password);
    if (!res.success && res.error) {
      Alert.alert('Sign In Error', res.error);
    }
  };

  // Quick fill for testing
  const handleQuickDemo = () => {
    setEmail('demo.store@counterpress.in');
    setPassword('counterpress123');
  };

  return (
    <View style={styles.container}>
      {/* Error banner if any */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#F87171' }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text style={styles.errorBannerTxt}>{error}</Text>
        </View>
      )}

      {/* Field 1: Store Email */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>STORE EMAIL</Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={colors.primary}
            style={styles.fieldIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={email}
            onChangeText={(txt) => {
              if (error) clearError();
              setEmail(txt);
            }}
            placeholder="store@domain.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {email.length > 0 && (
            <TouchableOpacity onPress={() => setEmail('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Field 2: Password */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>PASSWORD</Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={colors.primary}
            style={styles.fieldIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={password}
            onChangeText={(txt) => {
              if (error) clearError();
              setPassword(txt);
            }}
            placeholder="Enter your store password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Options Row: Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberMeRow}
          onPress={() => setRememberMe((prev) => !prev)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={20}
            color={rememberMe ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.rememberMeTxt, { color: colors.textSecondary }]}>
            Keep me signed in
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpenForgotPassword(email)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.forgotTxt, { color: colors.primary }]}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Sign In Button */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          isLoading && { opacity: 0.75 },
        ]}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.btnContent}>
            <MaterialCommunityIcons name="login" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnTxt}>Sign In to Store</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Demo Quick Fill for Instant Testing */}
      <TouchableOpacity
        style={[
          styles.demoBtn,
          {
            backgroundColor: colors.surfaceLight,
            borderColor: colors.borderLight,
          },
        ]}
        onPress={handleQuickDemo}
      >
        <MaterialCommunityIcons name="flash-outline" size={16} color={colors.primary} />
        <Text style={[styles.demoBtnTxt, { color: colors.primary }]}>
          Auto-fill Demo Credentials
        </Text>
      </TouchableOpacity>

      {/* Switch to Register link */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerTxt, { color: colors.textSecondary }]}>
          Don't have a CounterPress account?
        </Text>
        <TouchableOpacity onPress={onSwitchToRegister} style={styles.linkTouch}>
          <Text style={[styles.linkTxt, { color: colors.primary }]}>Create Store Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerTxt: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberMeTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  forgotTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    gap: 6,
  },
  demoBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
    flexWrap: 'wrap',
  },
  footerTxt: {
    fontSize: 13,
  },
  linkTouch: {
    paddingVertical: 2,
  },
  linkTxt: {
    fontSize: 13,
    fontWeight: '800',
  },
});

