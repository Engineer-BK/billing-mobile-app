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

import React, { useState, useEffect } from 'react';
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
import { PresetItem } from '../../types/item';
import { storageService } from '../../services/storageService';
import { reportService } from '../../services/reportService';

export interface FestivalOccasion {
  id: string;
  label: string;
  wish: string;
  emoji: string;
  category: 'default' | 'muslim' | 'national' | 'hindu' | 'christian';
}

export const FESTIVAL_OCCASIONS: FestivalOccasion[] = [
  { id: 'default', label: 'Default', wish: 'DEFAULT', emoji: '✨', category: 'default' },
  { id: 'remove', label: 'None (Remove)', wish: 'REMOVE', emoji: '🚫', category: 'default' },
  // Muslim / Islamic Festivals & Auspicious Occasions (Priority for store demographic)
  { id: 'eid_fitr', label: 'Eid Mubarak', wish: 'Eid Mubarak!', emoji: '🌙', category: 'muslim' },
  { id: 'eid_adha', label: 'Bakrid Mubarak', wish: 'Bakrid Mubarak!', emoji: '🌙', category: 'muslim' },
  { id: 'ramadan', label: 'Ramzan Mubarak', wish: 'Ramzan Mubarak!', emoji: '🌙', category: 'muslim' },
  { id: 'juma', label: 'Juma Mubarak', wish: 'Juma Mubarak!', emoji: '🕌', category: 'muslim' },
  { id: 'milad', label: 'Milad-un-Nabi', wish: 'Milad-un-Nabi Mubarak!', emoji: '🕌', category: 'muslim' },
  { id: 'shab_barat', label: 'Shab-e-Barat', wish: 'Shab-e-Barat Mubarak!', emoji: '🌙', category: 'muslim' },
  { id: 'shab_qadr', label: 'Shab-e-Qadr', wish: 'Shab-e-Qadr Mubarak!', emoji: '✨', category: 'muslim' },
  { id: 'chand_raat', label: 'Chand Raat', wish: 'Chand Raat Mubarak!', emoji: '🌙', category: 'muslim' },
  { id: 'muharram', label: 'Islamic New Year', wish: 'Islamic New Year Mubarak!', emoji: '🌙', category: 'muslim' },
  // Indian National & Secular Occasions
  { id: 'new_year', label: 'Happy New Year', wish: 'Happy New Year!', emoji: '🎆', category: 'national' },
  { id: 'ind_day', label: 'Independence Day', wish: 'Happy Independence Day!', emoji: '🇮🇳', category: 'national' },
  { id: 'rep_day', label: 'Republic Day', wish: 'Happy Republic Day!', emoji: '🇮🇳', category: 'national' },
  // Hindu Celebrations in India
  { id: 'diwali', label: 'Happy Diwali', wish: 'Happy Diwali!', emoji: '🪔', category: 'hindu' },
  { id: 'holi', label: 'Happy Holi', wish: 'Happy Holi!', emoji: '🎨', category: 'hindu' },
  { id: 'dussehra', label: 'Happy Dussehra', wish: 'Happy Dussehra!', emoji: '🏹', category: 'hindu' },
  { id: 'raksha', label: 'Raksha Bandhan', wish: 'Happy Raksha Bandhan!', emoji: '🧵', category: 'hindu' },
  { id: 'sankranti', label: 'Makar Sankranti', wish: 'Happy Makar Sankranti!', emoji: '🪁', category: 'hindu' },
  // Christian Celebrations in India
  { id: 'christmas', label: 'Merry Christmas', wish: 'Merry Christmas!', emoji: '🎄', category: 'christian' },
  { id: 'easter', label: 'Happy Easter', wish: 'Happy Easter!', emoji: '🐣', category: 'christian' },
];

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProfile: PrinterProfileId;
  onSelectProfile: (profile: PrinterProfileId) => void;
  onOpenStoreProfile: () => void;
  onOpenPrintersTab: () => void;
  presetItems?: PresetItem[];
}

export function SettingsModal({
  visible,
  onClose,
  selectedProfile,
  onSelectProfile,
  onOpenStoreProfile,
  onOpenPrintersTab,
  presetItems = [],
}: SettingsModalProps): React.JSX.Element {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { height: screenHeight } = useWindowDimensions();

  // Settings State (with sensible retail defaults)
  const [autoPrint, setAutoPrint] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [footerNote, setFooterNote] = useState<string>('Thank you! Visit again.');
  const [activeFestivalId, setActiveFestivalId] = useState<string>('default');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadItemsReport = async () => {
    setIsExporting(true);
    try {
      await reportService.downloadItemsJsonReport(
        presetItems,
        user?.shopName || 'store'
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (visible) {
      storageService.loadReceiptFooter().then((saved) => {
        if (saved !== null && saved !== undefined) {
          setFooterNote(saved);
          if (!saved.trim()) {
            setActiveFestivalId('remove');
          } else if (saved.trim().toLowerCase() === 'thank you! visit again.') {
            setActiveFestivalId('default');
          } else {
            const matched = FESTIVAL_OCCASIONS.find(
              (f) => f.wish && f.wish !== 'REMOVE' && f.wish !== 'DEFAULT' && saved.startsWith(f.wish)
            );
            setActiveFestivalId(matched ? matched.id : 'custom');
          }
        }
      });
    }
  }, [visible]);

  const handleSelectFestival = (fest: FestivalOccasion) => {
    setActiveFestivalId(fest.id);
    let newNote = '';
    if (fest.id === 'remove') {
      newNote = '';
    } else if (fest.id === 'default' || !fest.wish) {
      newNote = 'Thank you! Visit again.';
    } else {
      newNote = `${fest.wish} Thank you! Visit again.`;
    }
    setFooterNote(newNote);
    storageService.saveReceiptFooter(newNote);
  };

  const handleFooterNoteChange = (text: string) => {
    setFooterNote(text);
    storageService.saveReceiptFooter(text);
    if (!text.trim()) {
      setActiveFestivalId('remove');
    } else if (text.trim().toLowerCase() === 'thank you! visit again.') {
      setActiveFestivalId('default');
    } else {
      const matched = FESTIVAL_OCCASIONS.find(
        (f) => f.wish && f.wish !== 'REMOVE' && f.wish !== 'DEFAULT' && text.startsWith(f.wish)
      );
      setActiveFestivalId(matched ? matched.id : 'custom');
    }
  };

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

              {/* Section 3: Receipt Customization & Festive Greetings */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  RECEIPT CUSTOMIZATION & FESTIVE GREETINGS
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
                  <View style={styles.greetingHeaderRow}>
                    <Text style={[styles.fieldTitle, { color: colors.textPrimary }]}>
                      Receipt Footer Greeting
                    </Text>
                    <View style={styles.headerRightControls}>
                      {footerNote.length > 0 && (
                        <TouchableOpacity
                          onPress={() => handleFooterNoteChange('')}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                          style={styles.clearBtn}
                        >
                          <Text style={[styles.clearBtnTxt, { color: colors.error || '#EF4444' }]}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Text style={[styles.charCount, { color: colors.textMuted }]}>
                        {footerNote.length}/60
                      </Text>
                    </View>
                  </View>

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
                    onChangeText={handleFooterNoteChange}
                    placeholder="e.g. Eid Mubarak! Thank you! Visit again."
                    placeholderTextColor={colors.textMuted}
                    maxLength={60}
                  />

                  {/* Festive Wish Selector Section */}
                  <View style={styles.festiveContainer}>
                    <View style={styles.festiveHeader}>
                      <MaterialCommunityIcons name="party-popper" size={16} color={colors.primary} />
                      <Text style={[styles.festiveTitle, { color: colors.textPrimary }]}>
                        Festive Occasion Wishes (Optional)
                      </Text>
                    </View>
                    <Text style={[styles.festiveSubtitle, { color: colors.textSecondary }]}>
                      Tap any occasion to add a festive wish before your greeting:
                    </Text>

                    {/* Horizontal scroll of festive occasion chips */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.festivalChipsScroll}
                      nestedScrollEnabled={true}
                    >
                      {FESTIVAL_OCCASIONS.map((fest) => {
                        const isSelected = activeFestivalId === fest.id;
                        return (
                          <TouchableOpacity
                            key={fest.id}
                            style={[
                              styles.festivalChip,
                              {
                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                borderColor: isSelected ? colors.primary : colors.borderLight,
                              },
                            ]}
                            onPress={() => handleSelectFestival(fest)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.festEmoji}>{fest.emoji}</Text>
                            <Text
                              style={[
                                styles.festLabel,
                                {
                                  color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                  fontWeight: isSelected ? '800' : '600',
                                },
                              ]}
                            >
                              {fest.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Real-time Receipt Print Preview */}
                  <View
                    style={[
                      styles.previewPill,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="receipt" size={14} color={colors.primary} />
                    <Text
                      style={[styles.previewTxt, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {footerNote.trim().length > 0
                        ? `Print Preview: "${footerNote.trim()}"`
                        : 'Print Preview: (No footer greeting line - Removed)'}
                    </Text>
                  </View>

                  <Text style={[styles.inputHint, { color: colors.textMuted }]}>
                    Printed at bottom of all 58mm / 80mm thermal receipts
                  </Text>
                </View>
              </View>

              {/* Section 4: Reports & Data Backup */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    REPORTS & DATA EXPORT
                  </Text>
                  <View style={[styles.reportBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.reportBadgeTxt, { color: colors.primary }]}>
                      {(presetItems || []).length} Products
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.reportCard,
                    {
                      backgroundColor: colors.surfaceLight,
                      borderColor: colors.borderLight,
                    },
                  ]}
                  onPress={handleDownloadItemsReport}
                  disabled={isExporting}
                  activeOpacity={0.7}
                  accessibilityLabel="Download all items report as JSON"
                >
                  <View
                    style={[
                      styles.reportIconBox,
                      { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : '#EFF6FF' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={isExporting ? 'progress-download' : 'database-export-outline'}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.reportTextCol}>
                    <View style={styles.reportTitleRow}>
                      <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>
                        Download All Items Report as JSON
                      </Text>
                      <View
                        style={[
                          styles.jsonPill,
                          { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                        ]}
                      >
                        <Text style={[styles.jsonPillTxt, { color: colors.primary }]}>
                          DB SEED
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>
                      Export full catalog with stock & rates to mobile storage. Ready for 1-click database restore anytime.
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="download"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Section 5: Quick Navigation Hub */}
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
  greetingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clearBtnTxt: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  fieldTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  charCount: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  festiveContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  festiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  festiveTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  festiveSubtitle: {
    fontSize: 10.5,
    marginBottom: 8,
  },
  festivalChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  festivalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  festEmoji: {
    fontSize: 13,
  },
  festLabel: {
    fontSize: 11.5,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  previewTxt: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    fontStyle: 'italic',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  reportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reportBadgeTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  reportIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportTextCol: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  jsonPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  jsonPillTxt: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reportSubtitle: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
});
