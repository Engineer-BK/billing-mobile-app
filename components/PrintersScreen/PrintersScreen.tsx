/**
 * components/PrintersScreen/PrintersScreen.tsx
 * 
 * Dedicated Thermal POS Printer & Hardware Management Screen for FlashBill.
 * Mirrors the structure of InvoicesScreen to give the user a complete, focused
 * hardware control experience.
 * 
 * Features:
 * - 1. Top Header & Summary Strip: Real-time active status, profile info, and Bluetooth scan CTA
 * - 2. Current Connected Printer Hero Card: MAC address, connection pill, auto-cutter status,
 *      and 1-tap Test Print & Feed Paper actions
 * - 3. Hardware Roll Switcher: Interactive selection between 58mm (32 Col) and 80mm (48 Col)
 * - 4. Nearby Bluetooth Discovered Devices List: 1-tap Connect to any detected thermal POS printer
 * - 5. Live Thermal Monospace Simulation: Toggleable view of authentic thermal monospace receipt
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
import { PrinterProfile, PrinterProfileId } from '../../types/printer';
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
  onSelectProfile,
  onScan,
  onConnect,
  onDisconnect,
  onTestPrint,
  onPaperFeed,
}: PrintersScreenProps): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const isConnected = !!targetAddress;

  // Toggle state to preview monospace thermal layout
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Header & Summary Strip (Structured like InvoicesScreen) */}
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

      {/* 2. Current Connected Printer Hero Card */}
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
          <View
            style={[
              styles.printerIconCircle,
              {
                backgroundColor: isConnected
                  ? colors.successLight
                  : colors.primaryLight,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isConnected ? 'printer-check' : 'printer-pos'}
              size={28}
              color={isConnected ? colors.success : colors.primary}
            />
          </View>

          <View style={styles.heroMetaCol}>
            <View style={styles.heroNameRow}>
              <Text
                style={[styles.printerNameTxt, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {isConnected ? printerName : 'No Printer Connected'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isConnected
                      ? colors.successLight
                      : colors.surfaceLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isConnected
                        ? colors.success
                        : colors.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeTxt,
                    {
                      color: isConnected ? colors.success : colors.textMuted,
                    },
                  ]}
                >
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.macAddressTxt,
                { color: isConnected ? colors.accent : colors.textMuted },
              ]}
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
            <Text style={[styles.specBadgeTxt, { color: colors.textPrimary }]}>
              {activeConfig.displayName}
            </Text>
          </View>

          <View
            style={[
              styles.specBadge,
              { backgroundColor: colors.surfaceLight, borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.specBadgeTxt, { color: colors.primary }]}>
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
                Manual Tear
              </Text>
            </View>
          )}
        </View>

        {/* Quick Diagnostic Actions (Test Print, Paper Feed, Disconnect) */}
        <View style={[styles.heroActionsRow, { borderTopColor: colors.borderLight }]}>
          {/* Test Print Action */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isConnected ? colors.primaryLight : colors.surfaceLight,
                borderColor: isConnected ? colors.primary : colors.borderLight,
              },
            ]}
            onPress={onTestPrint}
            disabled={!isConnected || isPrinting}
            activeOpacity={0.7}
          >
            {isPrinting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name="printer-pos"
                size={18}
                color={isConnected ? colors.primary : colors.textMuted}
              />
            )}
            <Text
              style={[
                styles.actionBtnTxt,
                { color: isConnected ? colors.primary : colors.textMuted },
              ]}
            >
              {isPrinting ? 'Printing...' : 'Test Print'}
            </Text>
          </TouchableOpacity>

          {/* Paper Feed Action */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isConnected ? colors.surfaceLight : colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
            onPress={onPaperFeed}
            disabled={!isConnected}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-down-bold-box-outline"
              size={18}
              color={isConnected ? colors.textPrimary : colors.textMuted}
            />
            <Text
              style={[
                styles.actionBtnTxt,
                { color: isConnected ? colors.textPrimary : colors.textMuted },
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>

          {/* Disconnect Action */}
          {isConnected && (
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
          )}
        </View>
      </View>

      {/* 3. Hardware Roll Width Switcher (58mm ↔ 80mm) */}
      <View
        style={[
          styles.sectionBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          SELECT HARDWARE ROLL WIDTH
        </Text>

        <View style={styles.profilesRow}>
          {/* Option A: SC588 (58mm) */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  selectedProfile === 'SC588'
                    ? colors.primaryLight
                    : colors.surfaceLight,
                borderColor:
                  selectedProfile === 'SC588'
                    ? colors.primary
                    : colors.borderLight,
              },
            ]}
            onPress={() => onSelectProfile('SC588')}
            activeOpacity={0.8}
          >
            <View style={styles.profileCardHeader}>
              <Text
                style={[
                  styles.profileTitle,
                  {
                    color:
                      selectedProfile === 'SC588'
                        ? colors.textPrimary
                        : colors.textSecondary,
                  },
                ]}
              >
                SC588 (58mm)
              </Text>
              {selectedProfile === 'SC588' && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={colors.primary}
                />
              )}
            </View>
            <Text
              style={[
                styles.profileDesc,
                {
                  color:
                    selectedProfile === 'SC588'
                      ? colors.primary
                      : colors.textMuted,
                },
              ]}
            >
              32 Columns • 2-Inch Roll
            </Text>
            <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
              Standard compact POS receipt
            </Text>
          </TouchableOpacity>

          {/* Option B: EZO 80UB (80mm) */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  selectedProfile === 'EZO80'
                    ? colors.primaryLight
                    : colors.surfaceLight,
                borderColor:
                  selectedProfile === 'EZO80'
                    ? colors.primary
                    : colors.borderLight,
              },
            ]}
            onPress={() => onSelectProfile('EZO80')}
            activeOpacity={0.8}
          >
            <View style={styles.profileCardHeader}>
              <Text
                style={[
                  styles.profileTitle,
                  {
                    color:
                      selectedProfile === 'EZO80'
                        ? colors.textPrimary
                        : colors.textSecondary,
                  },
                ]}
              >
                EZO 80UB (80mm)
              </Text>
              {selectedProfile === 'EZO80' && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={colors.primary}
                />
              )}
            </View>
            <Text
              style={[
                styles.profileDesc,
                {
                  color:
                    selectedProfile === 'EZO80'
                      ? colors.primary
                      : colors.textMuted,
                },
              ]}
            >
              48 Columns • 3-Inch Roll
            </Text>
            <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
              High-density bill + Auto-Cutter
            </Text>
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
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DISCOVERED BLUETOOTH PRINTERS ({deviceList.length})
          </Text>

          <TouchableOpacity
            onPress={onScan}
            disabled={isScanning}
            style={styles.refreshBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={18}
              color={colors.primary}
            />
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
                        ? colors.surfaceLight
                        : 'transparent',
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
                            : colors.surfaceLight,
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
                          Active
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
            <MaterialCommunityIcons
              name="bluetooth-off"
              size={42}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyDevicesTitle, { color: colors.textPrimary }]}>
              No Bluetooth Printers Found
            </Text>
            <Text style={[styles.emptyDevicesSubtitle, { color: colors.textSecondary }]}>
              Make sure your thermal printer is turned ON, Bluetooth is enabled on your phone, and the printer is paired in phone settings.
            </Text>
            <TouchableOpacity
              style={[styles.emptyScanBtn, { backgroundColor: colors.primary }]}
              onPress={onScan}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bluetooth-audio" size={18} color="#FFFFFF" />
              <Text style={styles.emptyScanBtnTxt}>Scan Nearby Devices</Text>
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
    paddingBottom: 24,
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
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  printerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaCol: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  printerNameTxt: {
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  macAddressTxt: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  specsBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
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
  sectionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  profilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  profileDesc: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  deviceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshTxt: {
    fontSize: 12,
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
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyDevicesTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyDevicesSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 16,
  },
  emptyScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '800',
  },
  previewToggleSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  livePreviewContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
});
