/**
 * components/PrintersScreen/PrintersScreen.tsx
 * 
 * Hardware & Thermal Bluetooth POS Printer Manager for FlashBill.
 * 
 * Features:
 * - Active Printer Status Hero Card with full-width printer name & live status
 * - Hardware Roll Switcher (58mm ↔ 80mm) with spacious cards & zero icon collision
 * - Bluetooth Device Discovery List with 1-tap connect and clear pairing guide
 * - Quick Diagnostic Actions: 1-Tap Test Print, Paper Feed, Disconnect
 * - Live Monospace Receipt Layout Verification collapsible preview
 * - Dark & Light mode dynamic theme binding
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PrinterProfileId, PrinterProfile } from '../../types/printer';
import { BluetoothDevice } from '../../services/bluetoothPrinter';
import { InvoiceData } from '../../types/billing';
import { ReceiptPreview } from '../ReceiptPreview/ReceiptPreview';

interface PrintersScreenProps {
  targetAddress: string | null;
  printerName: string;
  isScanning: boolean;
  isPrinting: boolean;
  deviceList: BluetoothDevice[];
  selectedProfile: PrinterProfileId;
  activeConfig: PrinterProfile;
  sampleInvoice: InvoiceData;
  lastError?: string | null;
  isAutoDetected?: boolean;
  hideHeaderCard?: boolean;
  onClearError?: () => void;
  onSelectProfile: (profile: PrinterProfileId) => void;
  onScan: () => void;
  onConnect: (address: string, name: string) => void;
  onDisconnect: () => void;
  onTestPrint: () => void;
  onPaperFeed: () => void;
}

export function PrintersScreen({
  targetAddress,
  printerName,
  isScanning,
  isPrinting,
  deviceList,
  selectedProfile,
  activeConfig,
  sampleInvoice,
  lastError,
  isAutoDetected = false,
  hideHeaderCard = false,
  onClearError,
  onSelectProfile,
  onScan,
  onConnect,
  onDisconnect,
  onTestPrint,
  onPaperFeed,
}: PrintersScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Collapsible Receipt Simulator toggle
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  const isConnected = !!targetAddress;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Optional Top Header & Summary Strip (Hidden when rendered inside PrintersModal) */}
      {!hideHeaderCard && (
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Thermal Printers
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {isConnected ? `Linked to ${printerName}` : 'No Printer Linked'} • {activeConfig.lineWidth} Col ({activeConfig.paperWidth})
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.scanHeaderBtn,
              { backgroundColor: colors.primary },
              isScanning && { opacity: 0.8 },
            ]}
            onPress={onScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="bluetooth-audio" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.scanHeaderTxt}>
              {isScanning ? 'Scanning...' : 'Scan BT'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hardware Diagnostic Error Banner (Visible when any printer connection error occurs) */}
      {lastError ? (
        <View
          style={[
            styles.diagnosticErrorCard,
            {
              backgroundColor: isDark ? '#3B1219' : '#FEF2F2',
              borderColor: colors.error,
            },
          ]}
        >
          <View style={styles.diagnosticHeaderRow}>
            <View style={styles.diagnosticTitleLeft}>
              <MaterialCommunityIcons name="alert-octagon" size={20} color={colors.error} />
              <Text style={[styles.diagnosticTitle, { color: colors.error }]}>
                Hardware Connection Diagnostic
              </Text>
            </View>
            {onClearError ? (
              <TouchableOpacity onPress={onClearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={[styles.diagnosticErrorText, { color: colors.textPrimary }]}>
            {lastError}
          </Text>

          <View
            style={[
              styles.troubleshootBox,
              { backgroundColor: isDark ? '#2A1016' : '#FFFFFF', borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.troubleshootHeading, { color: colors.error }]}>
              Quick Troubleshooting Guide:
            </Text>
            <Text style={[styles.troubleshootItem, { color: colors.textSecondary }]}>
              • Ensure printer is turned ON and blue Bluetooth LED is blinking.
            </Text>
            <Text style={[styles.troubleshootItem, { color: colors.textSecondary }]}>
              • Pair device in phone Bluetooth settings first (PIN: 0000 or 1234).
            </Text>
            <Text style={[styles.troubleshootItem, { color: colors.textSecondary }]}>
              • Turn printer OFF for 3 seconds, turn ON, and tap Scan below.
            </Text>
          </View>
        </View>
      ) : null}

      {/* 2. Active Connected Printer Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: isConnected ? colors.success : colors.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          {/* Left Icon Circle */}
          <View
            style={[
              styles.printerIconCircle,
              {
                backgroundColor: isConnected
                  ? colors.successLight
                  : (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF'),
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isConnected ? 'printer-check' : 'printer-pos'}
              size={28}
              color={isConnected ? colors.success : colors.primary}
            />
          </View>

          {/* Middle Meta Details */}
          <View style={styles.heroMetaCol}>
            {/* Status Pill on its own row: Never collides with printer name */}
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isConnected
                      ? colors.successLight
                      : (isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7'),
                    borderColor: isConnected ? colors.success : '#F59E0B',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isConnected ? colors.success : '#D97706',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeTxt,
                    {
                      color: isConnected ? colors.success : '#D97706',
                    },
                  ]}
                >
                  {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                </Text>
              </View>

              {isConnected && isAutoDetected && (
                <View
                  style={[
                    styles.autoDetectBadge,
                    {
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                      borderColor: colors.success,
                    },
                  ]}
                >
                  <Text style={[styles.autoDetectTxt, { color: colors.success }]}>
                    ⚡ Auto-Detected
                  </Text>
                </View>
              )}
            </View>

            {/* Printer Name (Full width, NEVER truncates into "No Printer Con...") */}
            <Text
              style={[styles.printerNameTxt, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {isConnected ? printerName : 'No Printer Connected'}
            </Text>

            <Text
              style={[
                styles.macAddressTxt,
                { color: isConnected ? colors.accent : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {targetAddress ? `MAC: ${targetAddress}` : 'Ready to pair nearby Bluetooth printer'}
            </Text>
          </View>
        </View>

        {/* Profile Specifications Badges */}
        <View style={styles.specsBadgeRow}>
          <View
            style={[
              styles.specBadge,
              { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.specBadgeTxt, { color: colors.primary, fontWeight: '700' }]}>
              {activeConfig.badge}
            </Text>
          </View>

          <View
            style={[
              styles.specBadge,
              { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.specBadgeTxt, { color: colors.textSecondary }]}>
              {activeConfig.lineWidth} Columns ({activeConfig.paperWidth})
            </Text>
          </View>

          {activeConfig.hasAutoCutter ? (
            <View
              style={[
                styles.specBadge,
                { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
              ]}
            >
              <Text style={[styles.specBadgeTxt, { color: colors.success }]}>
                ✂️ Auto-Cutter
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.specBadge,
                { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
              ]}
            >
              <Text style={[styles.specBadgeTxt, { color: colors.textSecondary }]}>
                Manual Tear Bar
              </Text>
            </View>
          )}
        </View>

        {/* Quick Size Switcher Button (When Connected) */}
        {isConnected && (
          <View
            style={[
              styles.quickSwitchRow,
              { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
            ]}
          >
            <View style={styles.quickSwitchLeftCol}>
              <MaterialCommunityIcons name="printer-pos" size={16} color={colors.primary} />
              <Text style={[styles.quickSwitchLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                Active Roll: <Text style={{ color: colors.primary, fontWeight: '700' }}>{activeConfig.paperWidth}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.quickSwitchBtn,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => onSelectProfile(selectedProfile === 'SC588' ? 'EZO80' : 'SC588')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={14} color={colors.primary} />
              <Text style={[styles.quickSwitchBtnTxt, { color: colors.primary }]}>
                {selectedProfile === 'SC588' ? 'Switch to 80mm' : 'Switch to 58mm'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Actions Row */}
        {isConnected ? (
          <View style={[styles.heroActionsRow, { borderTopColor: colors.borderLight }]}>
            {/* Test Print Action */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
              onPress={onTestPrint}
              disabled={isPrinting}
              activeOpacity={0.7}
            >
              {isPrinting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="printer-pos"
                  size={18}
                  color={colors.primary}
                />
              )}
              <Text style={[styles.actionBtnTxt, { color: colors.primary }]}>
                {isPrinting ? 'Printing...' : 'Test Print'}
              </Text>
            </TouchableOpacity>

            {/* Paper Feed Action */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surfaceLight,
                  borderColor: colors.borderLight,
                },
              ]}
              onPress={onPaperFeed}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-down-bold-box-outline"
                size={18}
                color={colors.textPrimary}
              />
              <Text style={[styles.actionBtnTxt, { color: colors.textPrimary }]}>
                Feed
              </Text>
            </TouchableOpacity>

            {/* Disconnect Action */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.15)'
                    : '#FEE2E2',
                  borderColor: colors.error,
                },
              ]}
              onPress={onDisconnect}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="link-variant-off"
                size={18}
                color={colors.error}
              />
              <Text style={[styles.actionBtnTxt, { color: colors.error }]}>
                Disconnect
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryLinkBtn, { backgroundColor: colors.primary }]}
            onPress={onScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="bluetooth-connect" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.primaryLinkBtnTxt}>
              {isScanning ? 'Searching Nearby Printers...' : 'Pair & Connect Thermal Printer'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Hardware Roll Width Selector (58mm ↔ 80mm) */}
      <View
        style={[
          styles.sectionBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="tune" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            SELECT HARDWARE ROLL WIDTH
          </Text>
        </View>

        <View style={styles.profilesRow}>
          {/* Option A: 58mm Roll (2-Inch) */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  selectedProfile === 'SC588'
                    ? (isDark ? 'rgba(37, 99, 235, 0.12)' : '#EFF6FF')
                    : colors.surfaceLight,
                borderColor:
                  selectedProfile === 'SC588'
                    ? colors.primary
                    : colors.borderLight,
                borderWidth: selectedProfile === 'SC588' ? 2 : 1,
              },
            ]}
            onPress={() => onSelectProfile('SC588')}
            activeOpacity={0.8}
          >
            <View style={styles.profileCardTop}>
              <View
                style={[
                  styles.profileIconCircle,
                  {
                    backgroundColor:
                      selectedProfile === 'SC588' ? colors.primary : colors.borderLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="receipt"
                  size={16}
                  color={selectedProfile === 'SC588' ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              {selectedProfile === 'SC588' ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.primary}
                />
              ) : (
                <View style={[styles.radioCircle, { borderColor: colors.borderLight }]} />
              )}
            </View>

            <Text style={[styles.profileMainTitle, { color: colors.textPrimary }]}>
              58mm Roll
            </Text>
            <Text
              style={[
                styles.profileSpecSub,
                { color: selectedProfile === 'SC588' ? colors.primary : colors.textMuted },
              ]}
            >
              2-Inch • 32 Columns
            </Text>
            <View style={[styles.profileTag, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.profileTagTxt, { color: colors.textSecondary }]}>
                Compact POS
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option B: 80mm Roll (3-Inch) */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  selectedProfile === 'EZO80'
                    ? (isDark ? 'rgba(37, 99, 235, 0.12)' : '#EFF6FF')
                    : colors.surfaceLight,
                borderColor:
                  selectedProfile === 'EZO80'
                    ? colors.primary
                    : colors.borderLight,
                borderWidth: selectedProfile === 'EZO80' ? 2 : 1,
              },
            ]}
            onPress={() => onSelectProfile('EZO80')}
            activeOpacity={0.8}
          >
            <View style={styles.profileCardTop}>
              <View
                style={[
                  styles.profileIconCircle,
                  {
                    backgroundColor:
                      selectedProfile === 'EZO80' ? colors.primary : colors.borderLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="printer"
                  size={16}
                  color={selectedProfile === 'EZO80' ? '#FFFFFF' : colors.textSecondary}
                />
              </View>

              {selectedProfile === 'EZO80' ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.primary}
                />
              ) : (
                <View style={[styles.radioCircle, { borderColor: colors.borderLight }]} />
              )}
            </View>

            <Text style={[styles.profileMainTitle, { color: colors.textPrimary }]}>
              80mm Roll
            </Text>
            <Text
              style={[
                styles.profileSpecSub,
                { color: selectedProfile === 'EZO80' ? colors.primary : colors.textMuted },
              ]}
            >
              3-Inch • 48 Columns
            </Text>
            <View style={[styles.profileTag, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.profileTagTxt, { color: colors.textSecondary }]}>
                Standard POS
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Discovered Bluetooth Devices List */}
      <View
        style={[
          styles.sectionBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.deviceSectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="bluetooth" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              DISCOVERED PRINTERS ({deviceList.length})
            </Text>
          </View>

          <TouchableOpacity
            onPress={onScan}
            disabled={isScanning}
            style={[styles.refreshBtn, { backgroundColor: colors.surfaceLight }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color={colors.primary}
              />
            )}
            <Text style={[styles.refreshTxt, { color: colors.primary }]}>
              {isScanning ? 'Scanning...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={[styles.scanningBanner, { backgroundColor: colors.primaryLight }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.scanningBannerTxt, { color: colors.primary }]}>
              Searching for nearby Bluetooth ESC/POS printers...
            </Text>
          </View>
        )}

        {deviceList.length > 0 ? (
          <View style={styles.devicesList}>
            {deviceList.map((dev: BluetoothDevice) => {
              const isThisConnected = targetAddress === dev.address;

              return (
                <View
                  key={dev.address}
                  style={[
                    styles.deviceItem,
                    {
                      borderColor: isThisConnected
                        ? colors.success
                        : colors.borderLight,
                      backgroundColor: isThisConnected
                        ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4')
                        : colors.surfaceLight,
                    },
                  ]}
                >
                  <View style={styles.deviceLeft}>
                    <View
                      style={[
                        styles.deviceIconCircle,
                        {
                          backgroundColor: isThisConnected
                            ? colors.successLight
                            : colors.surface,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={isThisConnected ? 'printer-check' : 'printer'}
                        size={20}
                        color={isThisConnected ? colors.success : colors.textPrimary}
                      />
                    </View>

                    <View style={styles.deviceTextCol}>
                      <Text
                        style={[styles.deviceName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {dev.name || 'Unnamed BT Printer'}
                      </Text>
                      <Text style={[styles.deviceMac, { color: colors.textSecondary }]}>
                        {dev.address}
                      </Text>
                    </View>
                  </View>

                  {/* Connect / Connected Button */}
                  <TouchableOpacity
                    style={[
                      styles.connectBtn,
                      {
                        backgroundColor: isThisConnected
                          ? colors.successLight
                          : colors.primary,
                        borderColor: isThisConnected
                          ? colors.success
                          : colors.primary,
                      },
                    ]}
                    onPress={() => onConnect(dev.address, dev.name || dev.address)}
                    disabled={isThisConnected}
                    activeOpacity={0.8}
                  >
                    {isThisConnected ? (
                      <View style={styles.connectedBtnRow}>
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color={colors.success}
                        />
                        <Text style={[styles.connectBtnTxt, { color: colors.success }]}>
                          Linked
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.connectBtnTxt, { color: '#FFFFFF' }]}>
                        Connect
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyDevicesBox}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceLight }]}>
              <MaterialCommunityIcons
                name="bluetooth-connect"
                size={36}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.emptyDevicesTitle, { color: colors.textPrimary }]}>
              No Bluetooth Printers Found
            </Text>
            <Text style={[styles.emptyDevicesSubtitle, { color: colors.textSecondary }]}>
              Ensure printer power is ON & paired in phone Bluetooth settings.
            </Text>

            <TouchableOpacity
              style={[styles.emptyScanBtn, { backgroundColor: colors.primary }]}
              onPress={onScan}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="bluetooth-audio" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.emptyScanBtnTxt}>
                {isScanning ? 'Searching Nearby...' : 'Scan for Bluetooth Printers'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 5. Live Thermal Monospace Simulation */}
      <View
        style={[
          styles.sectionBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            marginBottom: 32,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.previewToggleHeader}
          onPress={() => setShowLivePreview(!showLivePreview)}
          activeOpacity={0.7}
        >
          <View style={styles.previewToggleLeft}>
            <MaterialCommunityIcons
              name="receipt"
              size={20}
              color={colors.primary}
            />
            <View>
              <Text style={[styles.previewToggleTitle, { color: colors.textPrimary }]}>
                Receipt Layout Verification
              </Text>
              <Text style={[styles.previewToggleSubtitle, { color: colors.textSecondary }]}>
                {selectedProfile === 'EZO80' ? '80mm 48-Column Monospace' : '58mm 32-Column Monospace'}
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons
            name={showLivePreview ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {showLivePreview && (
          <View style={styles.livePreviewContainer}>
            <ReceiptPreview
              activeConfig={activeConfig}
              invoice={sampleInvoice}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scanHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  scanHeaderTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  printerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroMetaCol: {
    flex: 1,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  autoDetectBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  autoDetectTxt: {
    fontSize: 10,
    fontWeight: '700',
  },
  printerNameTxt: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  macAddressTxt: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  specsBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  specBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSwitchLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 140,
  },
  quickSwitchLabel: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  quickSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickSwitchBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  primaryLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  primaryLinkBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  profilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  profileCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  profileMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileSpecSub: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  profileTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  profileTagTxt: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  deviceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refreshTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  scanningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  scanningBannerTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  devicesList: {
    gap: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  deviceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceTextCol: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  deviceMac: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  connectBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  connectedBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyDevicesBox: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyDevicesTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyDevicesSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  emptyScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyScanBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  previewToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  previewToggleSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  livePreviewContainer: {
    paddingTop: 12,
  },
  diagnosticErrorCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  diagnosticHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diagnosticTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diagnosticTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  diagnosticErrorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  troubleshootBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  troubleshootHeading: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  troubleshootItem: {
    fontSize: 11,
    lineHeight: 16,
  },
});
