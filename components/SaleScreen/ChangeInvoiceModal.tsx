/**
 * components/SaleScreen/ChangeInvoiceModal.tsx
 * 
 * "Change Invoice No." Modal Dialog matching the provided design.
 * Features:
 * - Clean modal sheet with close (✕) button
 * - Invoice Prefix pill toggle: [ None ] | [ Add Prefix ]
 * - Outlined floating-label input for Invoice No.
 * - Numeric input keyboard support
 * - Full Dark / Light theme responsiveness
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                  borderColor: isDark ? '#27272A' : '#E2E8F0',
                },
              ]}
            >
              {/* Header: Title and Close (✕) Button */}
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? '#FAFAFA' : '#0F172A' },
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
                    color={isDark ? '#A1A1AA' : '#334155'}
                  />
                </TouchableOpacity>
              </View>

              {/* Invoice Prefix Section */}
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#A1A1AA' : '#475569' },
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
                          borderColor: '#DC2626',
                          backgroundColor: isDark
                            ? 'rgba(220, 38, 38, 0.15)'
                            : '#FEE2E2',
                        }
                      : {
                          borderColor: isDark ? '#3F3F46' : '#CBD5E1',
                          backgroundColor: 'transparent',
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
                          ? '#DC2626'
                          : isDark
                          ? '#A1A1AA'
                          : '#64748B',
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
                          borderColor: isDark ? '#3F3F46' : '#CBD5E1',
                          backgroundColor: 'transparent',
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
                          : isDark
                          ? '#A1A1AA'
                          : '#64748B',
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
                      { backgroundColor: isDark ? '#18181B' : '#FFFFFF' },
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
                        color: isDark ? '#FAFAFA' : '#0F172A',
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
                    { backgroundColor: isDark ? '#18181B' : '#FFFFFF' },
                  ]}
                >
                  <Text style={[styles.floatingLabel, { color: '#0284C7' }]}>
                    Invoice No.
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: '#0284C7',
                      color: isDark ? '#FAFAFA' : '#0F172A',
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

              {/* Primary SAVE Button */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: '#0284C7' },
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnTxt}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    shadowColor: '#0284C7',
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

