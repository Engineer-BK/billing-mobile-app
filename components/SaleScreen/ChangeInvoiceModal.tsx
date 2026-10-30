/**
 * components/SaleScreen/ChangeInvoiceModal.tsx
 * 
 * "Change Invoice No." Modal Dialog matching the provided design.
 * Features:
 * - Clean modal sheet with close (✕) button
 * - Invoice Prefix pill toggle: [ None ] | [ Add Prefix ]
 * - Outlined floating-label input for Invoice No.
 * - Numeric input keyboard support
 * - Bound directly to theme branding colors (constants/theme.ts)
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ChangeInvoiceModalProps {
  visible: boolean;
  currentInvoiceNo: string;
  currentPrefix: string;
  onClose: () => void;
  onSave: (newInvoiceNo: string, prefix: string) => void;
}

export function ChangeInvoiceModal({
  visible,
  currentInvoiceNo,
  currentPrefix,
  onClose,
  onSave,
}: ChangeInvoiceModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  const [hasPrefix, setHasPrefix] = useState<boolean>(!!currentPrefix);
  const [prefix, setPrefix] = useState<string>(currentPrefix || 'INV-');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    currentInvoiceNo || '1'
  );

  const handleSave = () => {
    const finalNumber = invoiceNumber.trim() || '1';
    const finalPrefix = hasPrefix ? prefix.trim() : '';
    onSave(finalNumber, finalPrefix);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Fullscreen touchable backdrop: clicking outside dismisses modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close invoice number modal"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
              {/* Header: Title and Close (✕) Button */}
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.title,
                    { color: colors.textPrimary },
                  ]}
                >
                  Change Invoice No.
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Invoice Prefix Section */}
              <Text
                style={[
                  styles.label,
                  { color: colors.textSecondary },
                ]}
              >
                Invoice Prefix
              </Text>

              <View style={styles.prefixToggleRow}>
                {/* Option 1: None */}
                <TouchableOpacity
                  style={[
                    styles.prefixPill,
                    !hasPrefix
                      ? {
                          borderColor: colors.error,
                          backgroundColor: isDark
                            ? 'rgba(239, 68, 68, 0.15)'
                            : '#FEE2E2',
                        }
                      : {
                          borderColor: colors.borderLight,
                          backgroundColor: colors.surfaceLight,
                        },
                  ]}
                  onPress={() => setHasPrefix(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.prefixPillTxt,
                      {
                        color: !hasPrefix
                          ? colors.error
                          : colors.textMuted,
                        fontWeight: !hasPrefix ? '700' : '500',
                      },
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>

                {/* Option 2: Add Prefix */}
                <TouchableOpacity
                  style={[
                    styles.prefixPill,
                    hasPrefix
                      ? {
                          borderColor: colors.primary,
                          backgroundColor: colors.primaryLight,
                        }
                      : {
                          borderColor: colors.borderLight,
                          backgroundColor: colors.surfaceLight,
                        },
                  ]}
                  onPress={() => setHasPrefix(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.prefixPillTxt,
                      {
                        color: hasPrefix
                          ? colors.primary
                          : colors.textMuted,
                        fontWeight: hasPrefix ? '700' : '500',
                      },
                    ]}
                  >
                    Add Prefix
                  </Text>
                </TouchableOpacity>
              </View>

              {/* If Prefix is enabled: Prefix Input */}
              {hasPrefix && (
                <View style={styles.inputWrapper}>
                  <View
                    style={[
                      styles.floatingBadge,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                      Prefix
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: colors.primary,
                        color: colors.textPrimary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={prefix}
                    onChangeText={setPrefix}
                    placeholder="e.g. INV-"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {/* Floating-Label Invoice No. Input */}
              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.floatingBadge,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.floatingLabel, { color: colors.primary }]}>
                    Invoice No.
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.primary,
                      color: colors.textPrimary,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  keyboardType="numeric"
                  autoFocus
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Primary SAVE Button (Uses colors.primary) */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnTxt}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  prefixToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  prefixPill: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  prefixPillTxt: {
    fontSize: 13,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 22,
  },
  floatingBadge: {
    position: 'absolute',
    top: -8,
    left: 14,
    zIndex: 2,
    paddingHorizontal: 6,
  },
  floatingLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
});
