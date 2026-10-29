/**
 * App.tsx - Dual-Engine Thermal POS Billing Coordinator
 * 
 * Clean, modular coordinator screen managing:
 * - Bluetooth printer lifecycle (via useBluetoothScanner)
 * - Hardware profile switching (SC588 58mm vs EZO 80UB 80mm)
 * - Live Receipt Monospace Preview
 * - ESC/POS Hardware Print Engine Dispatcher
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Hardware profiles & default receipt data
import { PrinterProfileId } from './types/printer';
import { PRINTER_PROFILES } from './constants/printers';
import { SAMPLE_INVOICE } from './constants/receipt';
import { Colors } from './constants/theme';

// Custom hooks & services
import { useBluetoothScanner } from './hooks/useBluetoothScanner';
import { dispatchPrintReceipt } from './services/printJobService';

// Modular UI components
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { DeviceStatusCard } from './components/DeviceStatusCard';
import { DevicePickerSheet } from './components/DevicePickerSheet';
import { ReceiptPreview } from './components/ReceiptPreview/ReceiptPreview';

export default function App(): React.JSX.Element {
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfileId>('SC588');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Active hardware profile configuration
  const activeConfig = PRINTER_PROFILES[selectedProfile];

  // Bluetooth scanning, permission handling, and device binding
  const {
    targetAddress,
    printerName,
    isScanning,
    deviceList,
    showDeviceList,
    discoverAndBindPrinter,
    connectToDevice,
    disconnectPrinter,
  } = useBluetoothScanner({
    onProfileAutoDetected: (detected) => setSelectedProfile(detected),
  });

  // Dispatches ESC/POS byte stream to physical printer
  const handlePrint = async (): Promise<void> => {
    if (!targetAddress) {
      Alert.alert('Action Blocked', 'Please link your hardware first using the discovery module.');
      return;
    }

    try {
      setIsPrinting(true);
      const result = await dispatchPrintReceipt(activeConfig, SAMPLE_INVOICE);
      if (result.success) {
        Alert.alert('Print Dispatched', result.message || 'Receipt sent to printer.');
      } else {
        Alert.alert('Print Error', result.message || 'Could not print receipt.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Print Exception', msg);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* App Title Bar */}
        <View style={styles.header}>
          <Text style={styles.title}>POS Billing & Print</Text>
          <Text style={styles.subtitle}>
            SC588 (58mm) • EZO 80UB (80mm Auto-Cut)
          </Text>
        </View>

        {/* 1. Connection Dashboard Card */}
        <DeviceStatusCard
          printerName={printerName}
          targetAddress={targetAddress}
          activeConfig={activeConfig}
          onDisconnect={disconnectPrinter}
        />

        {/* 2. Bluetooth Scan / Connect Trigger */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.discoveryBtn]}
          onPress={discoverAndBindPrinter}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.actionBtnTxt}>
              {targetAddress ? '🔄 Re-scan / Switch Printer' : '🔍 Discover & Bind Printer'}
            </Text>
          )}
        </TouchableOpacity>

        {/* 3. Discovered Devices Picker Sheet */}
        <DevicePickerSheet
          visible={showDeviceList}
          devices={deviceList}
          onSelectDevice={connectToDevice}
        />

        {/* 4. Hardware Profile Switcher (58mm vs 80mm) */}
        <ProfileSwitcher
          selectedProfile={selectedProfile}
          onSelectProfile={setSelectedProfile}
        />

        {/* 5. Primary Push Print CTA Button */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.printBtn,
            (!targetAddress || isPrinting) && styles.btnDisabled,
          ]}
          onPress={handlePrint}
          disabled={!targetAddress || isPrinting}
        >
          {isPrinting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.printBtnTxt}>
              {`🖨️ Push Print Receipt (${activeConfig.lineWidth} Col)`}
            </Text>
          )}
        </TouchableOpacity>

        {/* 6. Live True-to-Life Receipt Monospace Preview */}
        <ReceiptPreview
          activeConfig={activeConfig}
          invoice={SAMPLE_INVOICE}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionBtnTxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  discoveryBtn: {
    backgroundColor: Colors.secondary,
  },
  printBtn: {
    backgroundColor: Colors.success,
  },
  printBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
