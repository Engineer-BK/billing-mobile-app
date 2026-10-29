/**
 * App.tsx - FlashBill POS Coordinator
 * 
 * High-Speed Retail POS Application featuring:
 * - Animated Welcome / Splash Screen with FlashBill brand identity & Mobile badge
 * - Custom Flash POS Home Screen with full branding & metrics
 * - Live ESC/POS thermal printing (SC588 58mm & EZO 80UB 80mm with auto-cut)
 * - Dynamic Dark & Light retail theme provider
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';

// Hardware profiles & invoice constants
import { PrinterProfileId } from './types/printer';
import { PRINTER_PROFILES } from './constants/printers';
import { SAMPLE_INVOICE } from './constants/receipt';
import { groceryProducts } from './constants/items';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Custom Bluetooth hook & Print Service
import { useBluetoothScanner } from './hooks/useBluetoothScanner';
import { dispatchPrintReceipt } from './services/printJobService';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Welcome / Splash Screen
import { WelcomeScreen } from './components/WelcomeScreen';

// Distinctive FlashBill Home Screen Components
import { FlashHeader } from './components/HomeScreen/FlashHeader';
import { FlashStats } from './components/HomeScreen/FlashStats';
import { QuickActionGrid } from './components/HomeScreen/QuickActionGrid';
import { RecentBillsCard } from './components/HomeScreen/RecentBillsCard';
import { BottomNavBar, NavTabId } from './components/HomeScreen/BottomNavBar';

// Hardware & Preview Components
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { DeviceStatusCard } from './components/DeviceStatusCard';
import { DevicePickerSheet } from './components/DevicePickerSheet';
import { ReceiptPreview } from './components/ReceiptPreview/ReceiptPreview';

function MainScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Welcome / Splash Screen State (shows on app launch)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Preload Retail Vector Icon Fonts
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
  });

  // Active navigation tab & UI toggles
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [showHardwarePanel, setShowHardwarePanel] = useState<boolean>(false);

  // Active hardware profile configuration
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfileId>('EZO80');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
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

  // 1-Tap Print Handler
  const handlePrint = async (): Promise<void> => {
    if (!targetAddress) {
      Alert.alert(
        'Printer Needed',
        'Please link your thermal printer first.\n\nTap "Pair Printer" to discover your SC588 or EZO 80UB.'
      );
      setShowHardwarePanel(true);
      return;
    }

    try {
      setIsPrinting(true);
      const result = await dispatchPrintReceipt(activeConfig, SAMPLE_INVOICE);
      if (result.success) {
        Alert.alert('Printed Successfully', result.message || 'Receipt sent to printer.');
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

  // Toggle between 58mm and 80mm hardware
  const handleToggleProfile = (): void => {
    const nextProfile: PrinterProfileId = selectedProfile === 'SC588' ? 'EZO80' : 'SC588';
    setSelectedProfile(nextProfile);
    Alert.alert(
      'Profile Switched',
      `Active Roll: ${PRINTER_PROFILES[nextProfile].displayName}\nLine Width: ${PRINTER_PROFILES[nextProfile].lineWidth} Columns`
    );
  };

  // Share Receipt summary
  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        title: `Bill #${SAMPLE_INVOICE.invoiceNo} - ${SAMPLE_INVOICE.shopName}`,
        message: `🧾 ${SAMPLE_INVOICE.shopName}\nInvoice No: ${SAMPLE_INVOICE.invoiceNo}\nCustomer: ${SAMPLE_INVOICE.customerName}\nTotal Amount: ₹${SAMPLE_INVOICE.grandTotal}\nTotal Items: ${SAMPLE_INVOICE.items.length}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Browse Catalog Alert
  const handleBrowseCatalog = (): void => {
    Alert.alert(
      '📦 FlashBill Catalog',
      `Catalog loaded with ${groceryProducts.length} products across 23 grocery categories.\n\nReady for Module 3 dynamic autocomplete!`,
      [{ text: 'OK' }]
    );
  };

  // Welcome Screen Gate (holds until splash duration and fonts are ready)
  if (showSplash || !fontsLoaded) {
    return <WelcomeScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Distinctive FlashBill Header with Store Info & Printer Pill */}
        <FlashHeader
          storeName={SAMPLE_INVOICE.shopName}
          printerName={printerName}
          isConnected={!!targetAddress}
          onPressPrinterPill={() => {
            setShowHardwarePanel(!showHardwarePanel);
            if (!targetAddress) discoverAndBindPrinter();
          }}
        />

        {/* 2. Retail Flash Metrics Strip */}
        <FlashStats
          grandTotal={SAMPLE_INVOICE.grandTotal}
          totalQty={SAMPLE_INVOICE.totalQty}
          itemsCount={SAMPLE_INVOICE.items.length}
          activeConfig={activeConfig}
        />

        {/* 3. High-Speed POS Command Deck (4 Brand Color Action Cards) */}
        <QuickActionGrid
          isPrinting={isPrinting}
          isScanning={isScanning}
          hasPrinter={!!targetAddress}
          selectedProfile={selectedProfile}
          onPressPrint={handlePrint}
          onPressScan={() => {
            setShowHardwarePanel(true);
            discoverAndBindPrinter();
          }}
          onPressToggleProfile={handleToggleProfile}
          onPressCatalog={handleBrowseCatalog}
        />

        {/* 4. Hardware Management Deck (Toggled or via tab) */}
        {(showHardwarePanel || activeTab === 'hardware') && (
          <View style={styles.hardwareSection}>
            <DeviceStatusCard
              printerName={printerName}
              targetAddress={targetAddress}
              activeConfig={activeConfig}
              onDisconnect={disconnectPrinter}
            />

            <DevicePickerSheet
              visible={showDeviceList}
              devices={deviceList}
              onSelectDevice={connectToDevice}
            />

            <ProfileSwitcher
              selectedProfile={selectedProfile}
              onSelectProfile={setSelectedProfile}
            />
          </View>
        )}

        {/* 5. Active Transaction Hub Card with 1-Tap Print & Share */}
        <RecentBillsCard
          invoice={SAMPLE_INVOICE}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onPressPrint={handlePrint}
          onPressShare={handleShare}
        />

        {/* 6. True-to-Life Cream Monospace Receipt Preview */}
        {showPreview && (
          <ReceiptPreview
            activeConfig={activeConfig}
            invoice={SAMPLE_INVOICE}
          />
        )}
      </ScrollView>

      {/* 7. Bottom Navigation Dock with Elevated "+ New Sale" FAB */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'hardware') setShowHardwarePanel(true);
          if (tab === 'items') handleBrowseCatalog();
        }}
        onPressNewSale={() => {
          Alert.alert(
            '⚡ New Sale',
            'Interactive billing form with live 150+ product picker is coming up in Module 3!',
            [{ text: 'Got it' }]
          );
        }}
      />
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  hardwareSection: {
    marginBottom: 8,
  },
});
