/**
 * components/PrintersScreen/PrintersModal.tsx
 * 
 * Full-screen modal housing the complete Thermal Printers configuration and Bluetooth scanner.
 * Allows merchants to configure hardware from Settings, Drawer, or top Header pill without
 * cluttering the primary bottom navigation dock.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PrintersScreen } from './PrintersScreen';
import { PrinterProfileId, PrinterProfile } from '../../types/printer';
import { InvoiceData } from '../../types/billing';
import { BluetoothDevice } from '../../services/bluetoothPrinter';

interface PrintersModalProps {
  visible: boolean;
  onClose: () => void;
  targetAddress: string | null;
  printerName: string;
  isScanning: boolean;
  isPrinting: boolean;
  deviceList: BluetoothDevice[];
  selectedProfile: PrinterProfileId;
  activeConfig: PrinterProfile;
  sampleInvoice: InvoiceData;
  lastError: string | null;
  isAutoDetected?: boolean;
  onClearError?: () => void;
  onSelectProfile: (profileId: PrinterProfileId) => void;
  onScan: () => void;
  onConnect: (address: string, name: string) => void;
  onDisconnect: () => void;
  onTestPrint: () => void;
  onPaperFeed: () => void;
}

export function PrintersModal(props: PrintersModalProps): React.JSX.Element {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Top Navigation Bar with Integrated Scan Action */}
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          {/* Close Modal Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
            onPress={props.onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Centered Header Title */}
          <View style={styles.titleCol}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Hardware & Printers
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              Bluetooth Thermal POS Setup
            </Text>
          </View>

          {/* Right Action: Quick Scan BT Button */}
          <TouchableOpacity
            style={[
              styles.topScanBtn,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            onPress={props.onScan}
            disabled={props.isScanning}
            activeOpacity={0.7}
          >
            {props.isScanning ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialCommunityIcons name="bluetooth-audio" size={16} color={colors.primary} />
                <Text style={[styles.topScanTxt, { color: colors.primary }]}>Scan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Embedded Complete Printers Screen (hide duplicate header card) */}
        <View style={styles.content}>
          <PrintersScreen
            targetAddress={props.targetAddress}
            printerName={props.printerName}
            isScanning={props.isScanning}
            isPrinting={props.isPrinting}
            deviceList={props.deviceList}
            selectedProfile={props.selectedProfile}
            activeConfig={props.activeConfig}
            sampleInvoice={props.sampleInvoice}
            lastError={props.lastError}
            isAutoDetected={props.isAutoDetected}
            onClearError={props.onClearError}
            onSelectProfile={props.onSelectProfile}
            onScan={props.onScan}
            onConnect={props.onConnect}
            onDisconnect={props.onDisconnect}
            onTestPrint={props.onTestPrint}
            onPaperFeed={props.onPaperFeed}
            hideHeaderCard={true}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  topScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  topScanTxt: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
});
