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

import React, { useState, useEffect } from 'react';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';

// Hardware Profiles & Defaults
import { PRINTER_PROFILES } from './constants/printers';
import { SAMPLE_INVOICE } from './constants/receipt';
import { groceryProducts } from './constants/items';
import { PrinterProfileId } from './types/printer';
import { InvoiceData } from './types/billing';

// Custom Hooks & Native Dispatchers
import { useBluetoothScanner } from './hooks/useBluetoothScanner';
import { storageService } from './services/storageService';
import { syncService } from './services/syncService';
import {
  dispatchPrintReceipt,
  dispatchTestPrint,
  dispatchPaperFeed,
} from './services/printJobService';

// Navigation & Top-Level Screens
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/Auth/AuthScreen';
import { AccountModal } from './components/Account/AccountModal';
import { AppDrawer } from './components/Drawer/AppDrawer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { SaleScreen } from './components/SaleScreen/SaleScreen';
import { InvoicesScreen } from './components/InvoicesScreen/InvoicesScreen';
import { PrintersScreen } from './components/PrintersScreen/PrintersScreen';
import { InvoiceOptionsMenu } from './components/InvoicesScreen/InvoiceOptionsMenu';
import { BottomNavBar, NavTabId } from './components/HomeScreen/BottomNavBar';
import { FlashHeader } from './components/HomeScreen/FlashHeader';
import { FlashStats } from './components/HomeScreen/FlashStats';
import { QuickActionGrid } from './components/HomeScreen/QuickActionGrid';
import { RecentBillsCard } from './components/HomeScreen/RecentBillsCard';
import { ReceiptPreview } from './components/ReceiptPreview/ReceiptPreview';

// Helper to identify and discard legacy mock/sample invoices
const isMockInvoice = (inv: InvoiceData): boolean => {
  const isMockCustomer =
    inv.customerName === 'Basir Ahmed Khan' ||
    inv.customerName === 'Ayaan Malik' ||
    inv.customerName === 'Zubair Ahmed';
  const hasMockItems =
    Array.isArray(inv.items) &&
    inv.items.some((i) => i.name === 'CHANACHUR' || i.name === 'BHUJIA-700' || i.name === 'SUN R MIRC');
  return isMockCustomer || hasMockItems;
};

function MainScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { user, isLoading: authLoading, signOut } = useAuth();

  // Welcome / Splash Screen State (shows on app launch)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Invoices Records State (initialized empty for real store data)
  const [invoicesList, setInvoicesList] = useState<InvoiceData[]>([]);

  // Active Invoice State (most recent transaction)
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);

  // Preload Retail Vector Icon Fonts
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
  });

  // Active navigation tab & UI toggles
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // Active hardware profile configuration
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfileId>('EZO80');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isRefreshingInvoices, setIsRefreshingInvoices] = useState<boolean>(false);
  const activeConfig = PRINTER_PROFILES[selectedProfile];

  // Bluetooth scanning, permission handling, and device binding
  const {
    targetAddress,
    printerName,
    isScanning,
    deviceList,
    lastError,
    clearLastError,
    discoverAndBindPrinter,
    connectToDevice,
    disconnectPrinter,
  } = useBluetoothScanner({
    onProfileAutoDetected: (detected) => {
      setSelectedProfile(detected);
      storageService.saveActiveProfile(detected);
    },
  });

  // Restore persistent invoices and roll profile from AsyncStorage on app startup
  useEffect(() => {
    storageService.loadInvoices().then((saved) => {
      if (saved && saved.length > 0) {
        const realInvoices = saved.filter((inv) => !isMockInvoice(inv));
        if (realInvoices.length > 0) {
          setInvoicesList(realInvoices);
          setCurrentInvoice(realInvoices[0]);
        } else {
          // Clean legacy mock records
          setInvoicesList([]);
          setCurrentInvoice(null);
          storageService.saveInvoices([]);
        }
      } else {
        setInvoicesList([]);
        setCurrentInvoice(null);
      }
    });

    storageService.loadActiveProfile().then((savedProfile) => {
      if (savedProfile) {
        setSelectedProfile(savedProfile);
      }
    });
  }, []);

  // Reactive Cloud & Local Invoice Sync on User Login or Device Launch
  useEffect(() => {
    const currentUid = user?.uid;
    if (!currentUid) return;

    let isMounted = true;

    async function syncUserInvoices(uid: string) {
      try {
        // 1. Immediately load local storage for instant 0ms UI render
        const rawLocal = await storageService.loadInvoices();
        const localInvoices = (rawLocal || []).filter((inv) => !isMockInvoice(inv));
        if (isMounted && localInvoices.length > 0) {
          setInvoicesList(localInvoices);
          setCurrentInvoice(localInvoices[0]);
        }

        // 2. Multi-device pull from Cloud Firestore
        const cloudInvoices = await syncService.pullAllInvoices(uid);
        if (isMounted) {
          const realCloud = (cloudInvoices || []).filter((inv) => !isMockInvoice(inv));
          if (realCloud.length > 0) {
            setInvoicesList(realCloud);
            setCurrentInvoice(realCloud[0]);
          } else if (localInvoices.length > 0) {
            // Local has real invoices but cloud is empty -> automatically backup real invoices to Firestore!
            await syncService.syncAllLocalInvoices(uid);
          }
        }
      } catch (err) {
        console.warn('Sync user invoices error:', err);
      }
    }

    syncUserInvoices(currentUid);

    // 3. Real-time Live Firestore Stream (auto-refreshes whenever invoices change)
    const unsubscribe = syncService.subscribeToInvoices(currentUid, (liveInvoices) => {
      const realLive = (liveInvoices || []).filter((inv) => !isMockInvoice(inv));
      if (isMounted && realLive.length > 0) {
        setInvoicesList(realLive);
        setCurrentInvoice(realLive[0]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid]);

  // Pull-to-refresh handler for Invoices screen
  const handleRefreshInvoices = async () => {
    if (!user?.uid) return;
    setIsRefreshingInvoices(true);
    try {
      const refreshed = await syncService.pullAllInvoices(user.uid);
      const real = (refreshed || []).filter((inv) => !isMockInvoice(inv));
      if (real.length > 0) {
        setInvoicesList(real);
        setCurrentInvoice(real[0]);
      }
    } catch (err) {
      console.warn('Pull-to-refresh invoices error:', err);
    } finally {
      setIsRefreshingInvoices(false);
    }
  };

  // Sync user shop name with sample receipt if still using placeholder
  useEffect(() => {
    if (user?.shopName) {
      setCurrentInvoice((prev) => {
        if (!prev) return null;
        if (prev.shopName === 'Billing Receipt' || !prev.shopName) {
          return { ...prev, shopName: user.shopName };
        }
        return prev;
      });
    }
  }, [user?.shopName]);

  // 1-Tap Print Handler
  const handlePrint = async (targetInvoice: InvoiceData = currentInvoice): Promise<void> => {
    if (!targetAddress) {
      Alert.alert(
        'Printer Needed',
        'Please link your thermal printer first.\n\nOpen the Printers tab to connect your 80mm or 58mm printer.'
      );
      setActiveTab('hardware');
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

  // Test Print Handler for PrintersScreen
  const handleTestPrint = async (): Promise<void> => {
    if (!targetAddress) {
      Alert.alert('No Printer Linked', 'Please connect to a Bluetooth thermal printer first.');
      return;
    }
    try {
      setIsPrinting(true);
      const result = await dispatchTestPrint(activeConfig);
      if (result.success) {
        Alert.alert('Test Print Dispatched', result.message || 'Diagnostic receipt sent to printer.');
      } else {
        Alert.alert('Print Error', result.message || 'Could not send test print.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Print Exception', msg);
    } finally {
      setIsPrinting(false);
    }
  };

  // Paper Feed Handler for PrintersScreen
  const handlePaperFeed = async (): Promise<void> => {
    if (!targetAddress) {
      Alert.alert('No Printer Linked', 'Please connect to a Bluetooth thermal printer first.');
      return;
    }
    try {
      const result = await dispatchPaperFeed(3);
      if (!result.success) {
        Alert.alert('Feed Error', result.message);
      }
    } catch (err: unknown) {
      console.warn(err);
    }
  };

  // Switch between 58mm and 80mm roll width
  const handleSelectProfile = (profileId: PrinterProfileId): void => {
    setSelectedProfile(profileId);
    storageService.saveActiveProfile(profileId);
    Alert.alert(
      'Profile Switched',
      `Active Roll: ${PRINTER_PROFILES[profileId].displayName}\nLine Width: ${PRINTER_PROFILES[profileId].lineWidth} Columns`
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
        { text: '+ Create Sale', onPress: () => setActiveTab('sale') },
      ]
    );
  };

  // Handle Save Invoice from SaleScreen
  const handleSaveInvoice = (savedInvoice: InvoiceData, shouldPrint?: boolean) => {
    setCurrentInvoice(savedInvoice);
    setInvoicesList((prev) => {
      const updated = [
        savedInvoice,
        ...prev.filter((inv) => inv.invoiceNo !== savedInvoice.invoiceNo),
      ];
      storageService.saveInvoices(updated);
      return updated;
    });

    // Increment and persist sequential invoice counter
    const currentNum = parseInt(savedInvoice.invoiceNo, 10);
    if (!isNaN(currentNum)) {
      storageService.saveNextInvoiceNumber(currentNum + 1);
    }

    // Background non-blocking push to Cloud Firestore
    if (user?.uid) {
      syncService.pushInvoice(user.uid, savedInvoice);
    }

    if (shouldPrint) {
      handlePrint(savedInvoice);
    }
  };

  // Handle Delete Invoice
  const handleDeleteInvoice = (invoiceNo: string) => {
    setInvoicesList((prev) => {
      const updated = prev.filter((inv) => inv.invoiceNo !== invoiceNo);
      storageService.saveInvoices(updated);
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
            status: 'PAID',
          });
        }
      }
      return updated;
    });

    // Background delete in Cloud Firestore
    if (user?.uid) {
      syncService.deleteInvoice(user.uid, invoiceNo);
    }

    Alert.alert('Invoice Deleted', `Invoice #${invoiceNo} has been deleted.`);
  };

  // Handle Update Invoice Status (Paid <-> Unpaid)
  const handleUpdateInvoiceStatus = (invoiceNo: string, newStatus: 'PAID' | 'UNPAID') => {
    setInvoicesList((prev) => {
      const updated = prev.map((inv) =>
        inv.invoiceNo === invoiceNo ? { ...inv, status: newStatus } : inv
      );
      storageService.saveInvoices(updated);
      return updated;
    });
    if (currentInvoice.invoiceNo === invoiceNo) {
      setCurrentInvoice((prev) => ({ ...prev, status: newStatus }));
    }

    // Background status update in Cloud Firestore
    if (user?.uid) {
      const target = invoicesList.find((inv) => inv.invoiceNo === invoiceNo);
      if (target) {
        syncService.pushInvoice(user.uid, { ...target, status: newStatus });
      }
    }
  };

  // State for Home Screen 3-dot popup modal
  const [homeMenuInvoice, setHomeMenuInvoice] = useState<InvoiceData | null>(null);

  // State for Account & Cloud Management Modal
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);

  // State for Side Navigation Drawer & Settings Modal (Concept 1)
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Welcome Screen Gate (holds until splash duration, fonts, and auth state are ready)
  if (showSplash || !fontsLoaded || authLoading) {
    return <WelcomeScreen onFinish={() => setShowSplash(false)} />;
  }

  // Auth Gate: If no store account is logged in, show Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // Confirm Sign Out Handler
  const handleConfirmSignOut = () => {
    Alert.alert(
      'Sign Out of Store',
      `Are you sure you want to sign out of ${user?.shopName || 'your store account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* --- Main Tab Views (Preserved State with display: flex/none) --- */}

      {/* Tab 1: Home Dashboard Tab */}
      <View
        style={[
          styles.tabContent,
          { display: activeTab === 'home' ? 'flex' : 'none' },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Distinctive FlashBill Header with Store Info & Drawer Action */}
          <FlashHeader
            storeName={user?.shopName || 'FlashBill POS'}
            printerName={printerName}
            isConnected={!!targetAddress}
            onPressPrinterPill={() => setActiveTab('hardware')}
            onPressMenu={() => setShowDrawer(true)}
            onPressSettings={() => setShowSettingsModal(true)}
            onPressAccount={() => setShowAccountModal(true)}
            onPressSignOut={handleConfirmSignOut}
          />

          {/* Retail Flash Metrics Strip */}
          <FlashStats
            grandTotal={currentInvoice.grandTotal}
            totalQty={currentInvoice.totalQty}
            itemsCount={currentInvoice.items.length}
            invoicesCount={invoicesList.length}
          />

          {/* High-Speed Retail POS Command Deck */}
          <QuickActionGrid
            onPressNewSale={() => setActiveTab('sale')}
            onPressInvoices={() => setActiveTab('bills')}
            onPressCatalog={handleBrowseCatalog}
            onPressPrinters={() => setActiveTab('hardware')}
          />

          {/* Active Transaction Hub Card with 1-Tap Print & Share */}
          <RecentBillsCard
            invoice={currentInvoice}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onPressPrint={() => handlePrint(currentInvoice)}
            onPressShare={() => handleShare(currentInvoice)}
            onPressMenu={() => setHomeMenuInvoice(currentInvoice)}
          />

          {/* True-to-Life Cream Monospace Receipt Preview */}
          {showPreview && (
            <ReceiptPreview
              activeConfig={activeConfig}
              invoice={currentInvoice}
            />
          )}
        </ScrollView>
      </View>

      {/* Tab 2: Sale Tab Screen (Full Draft State Preserved Across Tabs) */}
      <View
        style={[
          styles.tabContent,
          { display: activeTab === 'sale' ? 'flex' : 'none' },
        ]}
      >
        <SaleScreen
          initialInvoiceNo={parseInt(currentInvoice.invoiceNo, 10) || 1}
          shopName={user?.shopName || currentInvoice.shopName}
          onBack={() => setActiveTab('home')}
          onSaveInvoice={handleSaveInvoice}
        />
      </View>

      {/* Tab 3: Invoices Tab Screen */}
      <View
        style={[
          styles.tabContent,
          { display: activeTab === 'bills' ? 'flex' : 'none' },
        ]}
      >
        <InvoicesScreen
          invoices={invoicesList}
          activeConfig={activeConfig}
          onPressPrint={(inv) => handlePrint(inv)}
          onPressNewSale={() => setActiveTab('sale')}
          onDeleteInvoice={handleDeleteInvoice}
          onChangeStatus={handleUpdateInvoiceStatus}
          onRefresh={handleRefreshInvoices}
          isRefreshing={isRefreshingInvoices}
        />
      </View>

      {/* Tab 4: Thermal Printers Tab Screen */}
      <View
        style={[
          styles.tabContent,
          { display: activeTab === 'hardware' ? 'flex' : 'none' },
        ]}
      >
        <PrintersScreen
          targetAddress={targetAddress}
          printerName={printerName}
          isScanning={isScanning}
          isPrinting={isPrinting}
          deviceList={deviceList}
          selectedProfile={selectedProfile}
          activeConfig={activeConfig}
          sampleInvoice={currentInvoice}
          lastError={lastError}
          onClearError={clearLastError}
          onSelectProfile={handleSelectProfile}
          onScan={discoverAndBindPrinter}
          onConnect={connectToDevice}
          onDisconnect={disconnectPrinter}
          onTestPrint={handleTestPrint}
          onPaperFeed={handlePaperFeed}
        />
      </View>

      {/* 3-Dot Options Popup Modal for Home Screen (Disappears on outside click) */}
      <InvoiceOptionsMenu
        visible={!!homeMenuInvoice}
        invoice={homeMenuInvoice}
        onClose={() => setHomeMenuInvoice(null)}
        onPrint={(inv) => handlePrint(inv)}
        onPreview={() => setShowPreview(true)}
        onDelete={(inv) => handleDeleteInvoice(inv.invoiceNo)}
        onChangeStatus={(inv, newStatus) => handleUpdateInvoiceStatus(inv.invoiceNo, newStatus)}
      />

      {/* Store Account & Cloud Sync Modal */}
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        invoicesCount={invoicesList.length}
        onSyncComplete={(synced) => {
          if (synced && synced.length > 0) {
            setInvoicesList(synced);
            setCurrentInvoice(synced[0]);
          }
        }}
      />

      {/* Side Navigation Drawer (Concept 1) */}
      <AppDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onSignOut={handleConfirmSignOut}
      />

      {/* POS Preferences & Settings Modal (Concept 1) */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedProfile={selectedProfile}
        onSelectProfile={(profile) => {
          setSelectedProfile(profile);
          storageService.saveActiveProfile(profile);
        }}
        onOpenStoreProfile={() => setShowAccountModal(true)}
        onOpenPrintersTab={() => setActiveTab('hardware')}
      />

      {/* Bottom Navigation Dock: [ Home ] [ Sale ] [ Invoices ] [ Printers ] */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainScreen />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
});
