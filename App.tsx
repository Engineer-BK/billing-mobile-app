/**
 * App.tsx - Dual-Engine Thermal POS Billing Mobile App (FlashBill)
 * 
 * Main Application Controller orchestrating:
 * - Welcome / Splash screen with FlashBill logo & hardware indicators
 * - Home Dashboard with POS Metrics, Command Deck, and Hardware Switcher
 * - Invoices Tab Screen with real-time search, invoice inspection, and 1-tap print
 * - Sale Screen with modular structure, units dropdown, live calculations, and renumbering
 * - Full Dark & Light Mode Theme Support
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Theme Context & Branding
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';

// Hardware Profiles & Defaults
import { PRINTER_PROFILES } from './constants/printers';
import { SAMPLE_INVOICE } from './constants/receipt';
import { groceryProducts } from './constants/items';
import { PrinterProfileId } from './types/printer';
import { InvoiceData } from './types/billing';

// Custom Hooks & Native Dispatchers
import { useBluetoothScanner } from './hooks/useBluetoothScanner';
import { dispatchPrintReceipt } from './services/printJobService';

// Navigation & Top-Level Screens
import { WelcomeScreen } from './components/WelcomeScreen';
import { SaleScreen } from './components/SaleScreen/SaleScreen';
import { InvoicesScreen } from './components/InvoicesScreen/InvoicesScreen';
import { InvoiceOptionsMenu } from './components/InvoicesScreen/InvoiceOptionsMenu';
import { BottomNavBar, NavTabId } from './components/HomeScreen/BottomNavBar';
import { FlashHeader } from './components/HomeScreen/FlashHeader';
import { FlashStats } from './components/HomeScreen/FlashStats';
import { QuickActionGrid } from './components/HomeScreen/QuickActionGrid';
import { RecentBillsCard } from './components/HomeScreen/RecentBillsCard';

// Hardware & Preview Components
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { DeviceStatusCard } from './components/DeviceStatusCard';
import { DevicePickerSheet } from './components/DevicePickerSheet';
import { ReceiptPreview } from './components/ReceiptPreview/ReceiptPreview';

function MainScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();

  // Welcome / Splash Screen State (shows on app launch)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // New Sale Screen State (shows when clicking "+ New Sale")
  const [showSaleScreen, setShowSaleScreen] = useState<boolean>(false);

  // Invoices Records State (persistent list of bills with search & print)
  const [invoicesList, setInvoicesList] = useState<InvoiceData[]>([
    SAMPLE_INVOICE,
    {
      shopName: 'Billing Receipt',
      date: '30/10/2026',
      time: '02:15 PM',
      invoiceNo: '2',
      customerName: 'Ayaan Malik',
      items: [
        { sNo: '1', name: 'BASMATI RICE', qty: '5', unit: 'KG', price: '120', amt: '600' },
        { sNo: '2', name: 'SUNFLOWER OIL', qty: '2', unit: 'L', price: '160', amt: '320' },
      ],
      totalQty: '7',
      subtotal: '920',
      totalDiscount: '0.00',
      finalAmount: '920',
      grandTotal: '920',
    },
    {
      shopName: 'Billing Receipt',
      date: '30/10/2026',
      time: '01:40 PM',
      invoiceNo: '3',
      customerName: 'Zubair Ahmed',
      items: [
        { sNo: '1', name: 'WHOLE WHEAT ATTA', qty: '10', unit: 'KG', price: '45', discountPercent: '5', discountAmount: '22.50', amt: '427.50' },
        { sNo: '2', name: 'SUGAR M-30', qty: '3', unit: 'KG', price: '44', amt: '132' },
      ],
      totalQty: '13',
      subtotal: '582',
      totalDiscount: '22.50',
      finalAmount: '559.50',
      grandTotal: '559.50',
    },
  ]);

  // Active Invoice State (starts from Invoice #1)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData>(invoicesList[0]);

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
  const handlePrint = async (targetInvoice: InvoiceData = currentInvoice): Promise<void> => {
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
      const result = await dispatchPrintReceipt(activeConfig, targetInvoice);
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
  const handleShare = async (targetInvoice: InvoiceData = currentInvoice): Promise<void> => {
    try {
      await Share.share({
        title: `Bill #${targetInvoice.invoiceNo}`,
        message: `🧾 Billing Receipt\nInvoice No: ${targetInvoice.invoiceNo}\nCustomer: ${targetInvoice.customerName || 'Walk-in Customer'}\nDate: ${targetInvoice.date}\nTotal Amount: ₹${targetInvoice.grandTotal}\nTotal Items: ${targetInvoice.items.length}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Browse Catalog Alert
  const handleBrowseCatalog = (): void => {
    Alert.alert(
      '📦 FlashBill Catalog',
      `Catalog loaded with ${groceryProducts.length} products across 23 grocery categories.\n\nReady to add items to your sale!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '+ Create Sale', onPress: () => setShowSaleScreen(true) },
      ]
    );
  };

  // Handle Save Invoice from SaleScreen
  const handleSaveInvoice = (savedInvoice: InvoiceData, shouldPrint?: boolean) => {
    setCurrentInvoice(savedInvoice);
    setInvoicesList((prev) => [
      savedInvoice,
      ...prev.filter((inv) => inv.invoiceNo !== savedInvoice.invoiceNo),
    ]);
    setShowSaleScreen(false);
    if (shouldPrint) {
      handlePrint(savedInvoice);
    }
  };

  // Handle Delete Invoice
  const handleDeleteInvoice = (invoiceNo: string) => {
    setInvoicesList((prev) => {
      const updated = prev.filter((inv) => inv.invoiceNo !== invoiceNo);
      if (currentInvoice.invoiceNo === invoiceNo) {
        if (updated.length > 0) {
          setCurrentInvoice(updated[0]);
        } else {
          setCurrentInvoice({
            ...SAMPLE_INVOICE,
            invoiceNo: '1',
            items: [],
            totalQty: '0',
            subtotal: '0.00',
            discountAmount: '0.00',
            grandTotal: '0.00',
            finalAmount: '0.00',
          });
        }
      }
      return updated;
    });
    Alert.alert('Invoice Deleted', `Invoice #${invoiceNo} has been deleted.`);
  };

  // State for Home Screen 3-dot popup modal
  const [homeMenuInvoice, setHomeMenuInvoice] = useState<InvoiceData | null>(null);

  // Welcome Screen Gate (holds until splash duration and fonts are ready)
  if (showSplash || !fontsLoaded) {
    return <WelcomeScreen onFinish={() => setShowSplash(false)} />;
  }

  // New Sale Screen Gate
  if (showSaleScreen) {
    return (
      <SaleScreen
        initialInvoiceNo={parseInt(currentInvoice.invoiceNo, 10) || 1}
        shopName={currentInvoice.shopName}
        onBack={() => setShowSaleScreen(false)}
        onSaveInvoice={handleSaveInvoice}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* --- Main Tab Views --- */}
      {activeTab === 'bills' ? (
        // Tab 4: Invoices & Receipts Screen with Search & 1-Tap Print
        <InvoicesScreen
          invoices={invoicesList}
          activeConfig={activeConfig}
          onPressPrint={(inv) => handlePrint(inv)}
          onPressNewSale={() => setShowSaleScreen(true)}
          onDeleteInvoice={handleDeleteInvoice}
        />
      ) : (
        // Tabs 1 & 2: Home Dashboard & Hardware Controls
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Distinctive FlashBill Header with Store Info & Printer Pill */}
          <FlashHeader
            storeName="FlashBill POS"
            printerName={printerName}
            isConnected={!!targetAddress}
            onPressPrinterPill={() => {
              setShowHardwarePanel(!showHardwarePanel);
              if (!targetAddress) discoverAndBindPrinter();
            }}
          />

          {/* 2. Retail Flash Metrics Strip */}
          <FlashStats
            grandTotal={currentInvoice.grandTotal}
            totalQty={currentInvoice.totalQty}
            itemsCount={currentInvoice.items.length}
            activeConfig={activeConfig}
          />

          {/* 3. High-Speed POS Command Deck (4 Brand Color Action Cards) */}
          <QuickActionGrid
            isPrinting={isPrinting}
            isScanning={isScanning}
            hasPrinter={!!targetAddress}
            selectedProfile={selectedProfile}
            onPressPrint={() => handlePrint(currentInvoice)}
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
            invoice={currentInvoice}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onPressPrint={() => handlePrint(currentInvoice)}
            onPressShare={() => handleShare(currentInvoice)}
            onPressMenu={() => setHomeMenuInvoice(currentInvoice)}
          />

          {/* 6. True-to-Life Cream Monospace Receipt Preview */}
          {showPreview && (
            <ReceiptPreview
              activeConfig={activeConfig}
              invoice={currentInvoice}
            />
          )}
        </ScrollView>
      )}

      {/* 3-Dot Options Popup Modal for Home Screen (Disappears on outside click) */}
      <InvoiceOptionsMenu
        visible={!!homeMenuInvoice}
        invoice={homeMenuInvoice}
        onClose={() => setHomeMenuInvoice(null)}
        onPrint={(inv) => handlePrint(inv)}
        onPreview={() => setShowPreview(true)}
        onDelete={(inv) => handleDeleteInvoice(inv.invoiceNo)}
      />

      {/* Bottom Navigation Dock with Elevated "+ New Sale" FAB */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'hardware') setShowHardwarePanel(true);
          if (tab === 'items') handleBrowseCatalog();
        }}
        onPressNewSale={() => {
          setShowSaleScreen(true);
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
