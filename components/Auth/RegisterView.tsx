/**
 * components/Auth/RegisterView.tsx
 * 
 * POS Store Registration View.
 * Captures core retail shop metadata:
 * - Shop / Business Name (becomes printed receipt header)
 * - Owner Name
 * - Phone Number
 * - Email & Password
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

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export function RegisterView({ onSwitchToLogin }: RegisterViewProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [shopName, setShopName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleRegister = async () => {
    clearError();

    if (!shopName.trim()) {
      Alert.alert('Store Name Required', 'Please enter your shop or business name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your store email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'The passwords you entered do not match.');
      return;
    }

    const res = await signUp({
      shopName,
      ownerName,
      phone,
      email,
      pass: password,
    });

    if (!res.success && res.error) {
      Alert.alert('Registration Error', res.error);
    }
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

      {/* Field 1: Shop / Business Name */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          SHOP / STORE NAME <Text style={{ color: colors.primary }}>*</Text>
        </Text>
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
            name="store-outline"
            size={20}
            color={colors.primary}
            style={styles.fieldIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={shopName}
            onChangeText={(txt) => {
              if (error) clearError();
              setShopName(txt);
            }}
            placeholder="e.g. Aftab Supermarket & Retail"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
          {shopName.length > 0 && (
            <TouchableOpacity onPress={() => setShopName('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Field 2 & 3: Owner Name & Phone in 2 Columns */}
      <View style={styles.rowFields}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>OWNER NAME</Text>
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
              name="account-outline"
              size={18}
              color={colors.primary}
              style={styles.fieldIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Adil Khan"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>PHONE</Text>
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
              name="phone-outline"
              size={18}
              color={colors.primary}
              style={styles.fieldIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* Field 4: Store Email */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          STORE EMAIL <Text style={{ color: colors.primary }}>*</Text>
        </Text>
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
          />
        </View>
      </View>

      {/* Field 5: Password */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          PASSWORD (MIN 6 CHARS) <Text style={{ color: colors.primary }}>*</Text>
        </Text>
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
            onChangeText={setPassword}
            placeholder="Create secure password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Field 6: Confirm Password */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>CONFIRM PASSWORD</Text>
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
            name="lock-check-outline"
            size={20}
            color={colors.primary}
            style={styles.fieldIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Primary Register Button */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          isLoading && { opacity: 0.75 },
        ]}
        onPress={handleRegister}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.btnContent}>
            <MaterialCommunityIcons name="store-plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnTxt}>Create Store Account</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Switch to Login link */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerTxt, { color: colors.textSecondary }]}>
          Already registered your store?
        </Text>
        <TouchableOpacity onPress={onSwitchToLogin} style={styles.linkTouch}>
          <Text style={[styles.linkTxt, { color: colors.primary }]}>Sign In</Text>
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
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldGroup: {
    marginBottom: 14,
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
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
