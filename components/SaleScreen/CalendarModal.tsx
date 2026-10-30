/**
 * components/SaleScreen/CalendarModal.tsx
 * 
 * Material Design Calendar Date Picker matching the uploaded screenshot.
 * Features:
 * - Blue Header with selected Year and formatted Day/Month (e.g. "Sat, 31 Oct")
 * - Month navigation with "<" and ">" arrows
 * - Days of week grid (S M T W T F S)
 * - Circular highlight on the selected day
 * - CANCEL and OK action buttons
 * - Full Dark / Light theme support
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function CalendarModal({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}: CalendarModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Temporary state while calendar modal is open
  const [currentMonth, setCurrentMonth] = useState<number>(
    selectedDate.getMonth()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    selectedDate.getFullYear()
  );
  const [tempDate, setTempDate] = useState<Date>(new Date(selectedDate));

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Generate days grid for currentMonth and currentYear
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(d);
  }

  const handleDayPress = (day: number) => {
    const newSelected = new Date(currentYear, currentMonth, day);
    setTempDate(newSelected);
  };

  const handleConfirm = () => {
    onSelectDate(tempDate);
    onClose();
  };

  // Format header display string (e.g. "Sat, 31 Oct")
  const dayName = DAY_NAMES[tempDate.getDay()];
  const dayNum = tempDate.getDate();
  const monthNameShort = SHORT_MONTH_NAMES[tempDate.getMonth()];
  const yearNum = tempDate.getFullYear();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    return (
      tempDate.getDate() === day &&
      tempDate.getMonth() === currentMonth &&
      tempDate.getFullYear() === currentYear
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogCard,
                {
                  backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                  borderColor: isDark ? '#27272A' : '#E2E8F0',
                },
              ]}
            >
              {/* Blue Header Banner */}
              <View style={styles.headerBanner}>
                <Text style={styles.headerYear}>{yearNum}</Text>
                <Text style={styles.headerDayDate}>
                  {`${dayName}, ${dayNum} ${monthNameShort}`}
                </Text>
              </View>

              {/* Month Selector Navigation */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.navArrow}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={26}
                    color={isDark ? '#FAFAFA' : '#1E293B'}
                  />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.monthTitle,
                    { color: isDark ? '#FAFAFA' : '#1E293B' },
                  ]}
                >
                  {`${MONTH_NAMES[currentMonth]} ${currentYear}`}
                </Text>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.navArrow}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={26}
                    color={isDark ? '#FAFAFA' : '#1E293B'}
                  />
                </TouchableOpacity>
              </View>

              {/* Day of Week Headers */}
              <View style={styles.weekHeadersRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, index) => (
                  <View key={index} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.weekHeaderTxt,
                        { color: isDark ? '#71717A' : '#64748B' },
                      ]}
                    >
                      {w}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {daysGrid.map((day, idx) => {
                  if (day === null) {
                    return <View key={idx} style={styles.dayCell} />;
                  }

                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dayCell}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          selected && styles.dayCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberTxt,
                            {
                              color: selected
                                ? '#FFFFFF'
                                : today
                                ? '#0284C7'
                                : isDark
                                ? '#FAFAFA'
                                : '#1E293B',
                              fontWeight: selected || today ? '800' : '500',
                            },
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Buttons: CANCEL / OK */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.footerBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerBtnTxt}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  style={styles.footerBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerBtnTxt}>OK</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 20,
  },
  headerBanner: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerYear: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerDayDate: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  navArrow: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  weekHeadersRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekHeaderTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  dayNumberTxt: {
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  footerBtnTxt: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});

