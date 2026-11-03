/**
 * components/Settings/SettingsModal.tsx
 * 
 * Classy POS Settings & Preferences Modal for FlashBill.
 * Features:
 * - Thermal Print & Paper roll configurations (80mm vs 58mm)
 * - Auto-Print toggle upon invoice creation
 * - Custom Receipt Footer Note
 * - Theme Switcher (Dark / Light mode)
 * - Quick jump to Hardware Setup & Store Profile
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { PrinterProfileId } from '../../types/printer';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProfile: PrinterProfileId;
  onSelectProfile: (profile: PrinterProfileId) => void;
  onOpenStoreProfile: () => void;
  onOpenPrintersTab: () => void;
}

export function SettingsModal({
  visible,
  onClose,
  selectedProfile,
  onSelectProfile,
  onOpenStoreProfile,
  onOpenPrintersTab,
}: SettingsModalProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Settings State (with sensible retail defaults)
  const [autoPrint, setAutoPrint] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showDiscountBreakdown, setShowDiscountBreakdown] = useState<boolean>(true);
  const [footerNote, setFooterNote] = useState<string>('Thank you! Visit again.');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
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
                {/* Modal Header */}
                <View style={styles.headerRow}>
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
                      <MaterialCommunityIcons name="cog-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.headerTitleCol}>
                      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        POS Settings
                      </Text>
                      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Preferences & Print Automation
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
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Settings Scroll Body */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollBody}>
                  {/* Section 1: Appearance & Theme */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      APPEARANCE
                    </Text>

                    <View
                      style={[
                        styles.settingRow,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <View style={styles.settingInfo}>
                        <Ionicons
                          name={isDark ? 'moon' : 'sunny'}
                          size={20}
                          color={isDark ? colors.secondary : colors.primary}
                        />
                        <View style={styles.settingTextCol}>
                          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                          </Text>
                          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                            High-contrast retail theme
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.themePillToggle,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={toggleTheme}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.themePillTxt, { color: colors.primary }]}>
                          Switch to {isDark ? 'Light' : 'Dark'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Section 2: Thermal Printing & Automation */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      THERMAL PRINT AUTOMATION
                    </Text>

                    {/* Paper Size Selector (80mm vs 58mm) */}
                    <View
                      style={[
                        styles.paperSizeCard,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.paperSizeLabel, { color: colors.textPrimary }]}>
                        Default Paper Roll
                      </Text>
                      <View style={styles.profileToggleRow}>
                        <TouchableOpacity
                          style={[
                            styles.profileBtn,
                            selectedProfile === 'EZO80' && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                            selectedProfile !== 'EZO80' && {
                              backgroundColor: colors.surface,
                              borderColor: colors.borderLight,
                            },
                          ]}
                          onPress={() => onSelectProfile('EZO80')}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.profileBtnTxt,
                              {
                                color: selectedProfile === 'EZO80' ? '#FFFFFF' : colors.textPrimary,
                              },
                            ]}
                          >
                            80mm (3-Inch)
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.profileBtn,
                            selectedProfile === 'SC588' && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                            selectedProfile !== 'SC588' && {
                              backgroundColor: colors.surface,
                              borderColor: colors.borderLight,
                            },
                          ]}
                          onPress={() => onSelectProfile('SC588')}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.profileBtnTxt,
                              {
                                color: selectedProfile === 'SC588' ? '#FFFFFF' : colors.textPrimary,
                              },
                            ]}
                          >
                            58mm (2-Inch)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Auto-Print on Save Toggle */}
                    <View
                      style={[
                        styles.settingRow,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <View style={styles.settingInfo}>
                        <MaterialCommunityIcons
                          name="printer-pos"
                          size={20}
                          color={colors.primary}
                        />
                        <View style={styles.settingTextCol}>
                          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                            Auto-Print on Save
                          </Text>
                          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                            Direct print receipt after saving sale
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={autoPrint}
                        onValueChange={setAutoPrint}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={autoPrint ? colors.primary : '#FFFFFF'}
                      />
                    </View>

                    {/* Audio Feedback Toggle */}
                    <View
                      style={[
                        styles.settingRow,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <View style={styles.settingInfo}>
                        <MaterialCommunityIcons
                          name="volume-high"
                          size={20}
                          color={colors.secondary}
                        />
                        <View style={styles.settingTextCol}>
                          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                            POS Audio Chimes
                          </Text>
                          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                            Sound on barcode scan & sale complete
                          </Text>
                        </View>
                      </View>
                      <Switch
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                        trackColor={{ false: colors.border, true: colors.secondaryLight }}
                        thumbColor={soundEnabled ? colors.secondary : '#FFFFFF'}
                      />
                    </View>
                  </View>

                  {/* Section 3: Receipt Customization */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      RECEIPT CUSTOMIZATION
                    </Text>

                    <View
                      style={[
                        styles.customCard,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                    >
                      <Text style={[styles.fieldTitle, { color: colors.textPrimary }]}>
                        Receipt Footer Greeting
                      </Text>
                      <TextInput
                        style={[
                          styles.footerInput,
                          {
                            color: colors.textPrimary,
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        value={footerNote}
                        onChangeText={setFooterNote}
                        placeholder="e.g. Thank you! Visit again."
                        placeholderTextColor={colors.textMuted}
                        maxLength={40}
                      />
                      <Text style={[styles.inputHint, { color: colors.textMuted }]}>
                        Printed at bottom of all 58mm / 80mm receipts
                      </Text>
                    </View>
                  </View>

                  {/* Section 4: Quick Navigation Hub */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      QUICK ACTIONS
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                      onPress={() => {
                        onClose();
                        onOpenPrintersTab();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.quickActionLeft}>
                        <MaterialCommunityIcons
                          name="bluetooth-connect"
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={[styles.quickActionTxt, { color: colors.textPrimary }]}>
                          Configure Bluetooth Thermal Printers
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.quickActionBtn,
                        {
                          backgroundColor: colors.surfaceLight,
                          borderColor: colors.borderLight,
                        },
                      ]}
                      onPress={() => {
                        onClose();
                        onOpenStoreProfile();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.quickActionLeft}>
                        <MaterialCommunityIcons
                          name="store-outline"
                          size={18}
                          color={colors.secondary}
                        />
                        <Text style={[styles.quickActionTxt, { color: colors.textPrimary }]}>
                          Edit Store Name & Owner Details
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 10,
  },
  headerIconBox: {
    width: 42,
    height: 42,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
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
    paddingVertical: 12,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingTextCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  themePillToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  themePillTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  paperSizeCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  paperSizeLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  profileToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  customCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  footerInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  inputHint: {
    fontSize: 10,
    marginTop: 4,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  quickActionTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
});
