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
 * - Smooth 60fps scrolling with zero gesture interference
 * - Safely bounded modal height with guaranteed clearance above Android system navigation bar
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
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
  const { height: screenHeight } = useWindowDimensions();

  // Settings State (with sensible retail defaults)
  const [autoPrint, setAutoPrint] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [footerNote, setFooterNote] = useState<string>('Thank you! Visit again.');

  // Safe bounded modal height: stays elevated with guaranteed clearance above Android nav buttons
  const maxModalHeight = Math.min(Math.round(screenHeight * 0.78), 580);

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
          accessibilityLabel="Close settings modal"
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
                accessibilityLabel="Close settings"
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Smooth Scrollable Settings Body */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              bounces={false}
            >
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
