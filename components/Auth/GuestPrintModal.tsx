/**
 * components/Auth/GuestPrintModal.tsx
 * 
 * High-Converting Conversion Modal for Guest / Demo Users (Module 1.4).
 * Appears whenever an unauthenticated guest attempts to print or connect a thermal printer.
 * 
 * Features:
 * - Clear retail value proposition explaining why registration unlocks thermal printing
 * - 1-Tap navigation to Register Store screen
 * - Graceful dismissal to continue exploring the POS demo sandbox
 * - Light and Dark theme dynamic styling
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface GuestPrintModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export function GuestPrintModal({
  visible,
  onClose,
  onRegister,
}: GuestPrintModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

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
              {/* Top Accent Icon */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : '#EFF6FF',
                    borderColor: isDark ? '#3B82F6' : '#BFDBFE',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="printer-pos"
                  size={38}
                  color={colors.primary}
                />
              </View>

              {/* Title & Subtitle */}
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Thermal Printing Requires Store Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Connect your 58mm or 80mm Bluetooth printer, customize your receipt header, and print instant paper bills by creating your free store account.
              </Text>

              {/* Value Benefits Grid */}
              <View
                style={[
                  styles.benefitsBox,
                  {
                    backgroundColor: colors.surfaceLight,
                    borderColor: colors.borderLight,
                  },
                ]}
              >
                <View style={styles.benefitRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#F59E0B" />
                  <Text style={[styles.benefitTxt, { color: colors.textPrimary }]}>
                    0ms ultra-fast checkout printing on ESC/POS
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <MaterialCommunityIcons name="store" size={18} color="#10B981" />
                  <Text style={[styles.benefitTxt, { color: colors.textPrimary }]}>
                    Your shop name, address & phone on receipt
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <MaterialCommunityIcons name="cloud-check" size={18} color="#0EA5E9" />
                  <Text style={[styles.benefitTxt, { color: colors.textPrimary }]}>
                    Permanent Google Cloud backup & multi-phone sync
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#8B5CF6" />
                  <Text style={[styles.benefitTxt, { color: colors.textPrimary }]}>
                    100% Free Forever Tier (No credit card needed)
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    onClose();
                    onRegister();
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="store-plus" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnTxt}>Create Free Store Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceLight,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryBtnTxt, { color: colors.textSecondary }]}>
                    Continue Exploring Demo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  benefitsBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitTxt: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  actionCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
});

