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

import React, { useState, useEffect, useMemo } from 'react';
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
import { LicenseProvider, useLicense } from './context/LicenseContext';
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
import { GuestPrintModal } from './components/Auth/GuestPrintModal';
import { ActivationModal } from './components/License/ActivationModal';
import { AccountModal } from './components/Account/AccountModal';
import { AppDrawer } from './components/Drawer/AppDrawer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { SaleScreen } from './components/SaleScreen/SaleScreen';
import { InvoicesScreen } from './components/InvoicesScreen/InvoicesScreen';
import { ItemsScreen } from './components/ItemsScreen/ItemsScreen';
import { PrintersModal } from './components/PrintersScreen/PrintersModal';
import { InvoiceOptionsMenu } from './components/InvoicesScreen/InvoiceOptionsMenu';
import { BottomNavBar, NavTabId } from './components/HomeScreen/BottomNavBar';
import { FlashHeader } from './components/HomeScreen/FlashHeader';
import { FlashStats } from './components/HomeScreen/FlashStats';
import { QuickActionGrid } from './components/HomeScreen/QuickActionGrid';
import { RecentBillsCard } from './components/HomeScreen/RecentBillsCard';
import { ReceiptPreview } from './components/ReceiptPreview/ReceiptPreview';
import { PresetItem } from './types/item';

function MainScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const { user, isLoading: authLoading, signOut } = useAuth();

  // Welcome / Splash Screen State (shows on app launch)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Invoices Records State (initialized empty for real store data)
  const [invoicesList, setInvoicesList] = useState<InvoiceData[]>([]);

  // Next sequential invoice number (Single Source of Truth across Sale & Invoices tabs)
  const nextInvoiceNo = useMemo(() => {
    if (!invoicesList || invoicesList.length === 0) return 1;
    const maxNo = invoicesList.reduce((max, inv) => {
      const num = parseInt(inv.invoiceNo, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    return maxNo + 1;
  }, [invoicesList]);

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
  const [showGuestPrintModal, setShowGuestPrintModal] = useState<boolean>(false);
  const [showPrintersModal, setShowPrintersModal] = useState<boolean>(false);
  const activeConfig = PRINTER_PROFILES[selectedProfile];

  // Catalog Preset Items State
  const [presetItems, setPresetItems] = useState<PresetItem[]>([]);
  const [isRefreshingItems, setIsRefreshingItems] = useState<boolean>(false);

  // Licensing & Activation Engine (Module 2)
  const {
    isActivated,
    canPrint,
    plan,
    showActivationModal,
    openActivationModal,
    closeActivationModal,
  } = useLicense();

  // Bluetooth scanning, permission handling, and device binding
  const {
    targetAddress,
    printerName,
    isScanning,
    deviceList,
    lastError,
    isAutoDetected,
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

  // Restore persistent invoices and roll profile from AsyncStorage on app startup or user switch
  useEffect(() => {
    if (!user) {
      setInvoicesList([]);
      setCurrentInvoice(null);
      return;
    }

    if (user.isGuest) {
      // Sub-Module 1.2: Load isolated guest demo invoices with 3 preloaded bills
      storageService.loadGuestInvoices().then((guestBills) => {
        setInvoicesList(guestBills);
        setCurrentInvoice(guestBills[0] || null);
      });
      storageService.loadGuestPresetItems().then((items) => {
        setPresetItems(items);
      });
    } else {
      // Real store accounts load from clean real storage key
      storageService.loadInvoices().then((saved) => {
        if (saved && saved.length > 0) {
          setInvoicesList(saved);
          setCurrentInvoice(saved[0]);
        } else {
          setInvoicesList([]);
          setCurrentInvoice(null);
        }
      });
      storageService.loadPresetItems().then((items) => {
        setPresetItems(items);
      });
    }

    storageService.loadActiveProfile().then((savedProfile) => {
      if (savedProfile) {
        setSelectedProfile(savedProfile);
      }
    });
  }, [user?.uid, user?.isGuest]);

  // Reactive Cloud & Local Invoice Sync on User Login or Device Launch
  useEffect(() => {
    const currentUid = user?.uid;
    // Cloud sync ONLY runs for real users, NEVER for guest users!
    if (!currentUid || user?.isGuest) {
      if (!currentUid) {
        setInvoicesList([]);
        setCurrentInvoice(null);
      }
      return;
    }

    let isMounted = true;

    async function syncUserInvoices(uid: string) {
      try {
        // 1. Immediately load local storage for instant 0ms UI render
        const rawLocal = await storageService.loadInvoices();
        if (isMounted && rawLocal && rawLocal.length > 0) {
          setInvoicesList(rawLocal);
          setCurrentInvoice(rawLocal[0]);
        }

        // 2. Multi-device pull from Cloud Firestore (Cloud Source of Truth)
        const cloudInvoices = await syncService.pullAllInvoices(uid);
        if (isMounted) {
          if (cloudInvoices && cloudInvoices.length > 0) {
            setInvoicesList(cloudInvoices);
            setCurrentInvoice(cloudInvoices[0]);
            await storageService.saveInvoices(cloudInvoices);
            const maxInvoiceNo = Math.max(...cloudInvoices.map((inv) => parseInt(inv.invoiceNo, 10) || 0));
            if (maxInvoiceNo > 0) {
              await storageService.saveNextInvoiceNumber(maxInvoiceNo + 1);
            }
          } else if (rawLocal && rawLocal.length > 0) {
            // Local invoices exist but cloud returned 0 (e.g. offline or pending backup)
            // Preserve local invoices and queue background cloud sync
            syncService.syncAllLocalInvoices(uid);
          } else {
            // Truly fresh account with 0 cloud AND 0 local invoices: ensure clean state
            setInvoicesList([]);
            setCurrentInvoice(null);
            await storageService.saveInvoices([]);
            await storageService.saveNextInvoiceNumber(1);
          }
        }
      } catch (err) {
        console.warn('Sync user invoices error:', err);
      }
    }

    syncUserInvoices(currentUid);

    // Pull Catalog Preset Items from Cloud Firestore
    syncService.pullAllPresetItems(currentUid).then((cloudItems) => {
      if (isMounted && cloudItems && cloudItems.length > 0) {
        setPresetItems(cloudItems);
        storageService.savePresetItems(cloudItems);
      }
    });

    // 3. Real-time Live Firestore Stream (auto-refreshes whenever invoices change)
    const unsubscribe = syncService.subscribeToInvoices(currentUid, async (liveInvoices) => {
      if (isMounted && liveInvoices && liveInvoices.length > 0) {
        setInvoicesList(liveInvoices);
        setCurrentInvoice(liveInvoices[0]);
      }
    });

    // 4. Real-time Live Firestore Stream for Catalog Presets
    const unsubscribeItems = syncService.subscribeToPresetItems(currentUid, (liveItems) => {
      if (isMounted && liveItems && liveItems.length > 0) {
        setPresetItems(liveItems);
        storageService.savePresetItems(liveItems);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeItems();
    };
  }, [user?.uid, user?.isGuest]);

  // Pull-to-refresh handler for Invoices screen
  const handleRefreshInvoices = async () => {
    if (user?.isGuest) {
      setIsRefreshingInvoices(true);
      const guestBills = await storageService.loadGuestInvoices();
      setInvoicesList(guestBills);
      setCurrentInvoice(guestBills[0] || null);
      setIsRefreshingInvoices(false);
      return;
    }
    if (!user?.uid) return;
    setIsRefreshingInvoices(true);
    try {
      const refreshed = await syncService.pullAllInvoices(user.uid);
      if (refreshed && refreshed.length > 0) {
        setInvoicesList(refreshed);
        setCurrentInvoice(refreshed[0]);
        await storageService.saveInvoices(refreshed);
        const maxInvoiceNo = Math.max(...refreshed.map((inv) => parseInt(inv.invoiceNo, 10) || 0));
        if (maxInvoiceNo > 0) {
          await storageService.saveNextInvoiceNumber(maxInvoiceNo + 1);
        }
      } else {
        const local = await storageService.loadInvoices();
        if (local && local.length > 0) {
          setInvoicesList(local);
          setCurrentInvoice(local[0]);
        }
      }
    } catch (err) {
      console.warn('Pull-to-refresh invoices error:', err);
    } finally {
      setIsRefreshingInvoices(false);
    }
  };

  // Manual Trigger to re-sequence & maintain continuous 1, 2, 3... numbering
  const handleResequenceInvoices = async () => {
    if (user?.isGuest) {
      const sortedAsc = [...invoicesList].sort((a, b) => (parseInt(a.invoiceNo, 10) || 0) - (parseInt(b.invoiceNo, 10) || 0));
      const reseq = sortedAsc.map((inv, idx) => ({ ...inv, invoiceNo: String(idx + 1) })).sort((a, b) => (parseInt(b.invoiceNo, 10) || 0) - (parseInt(a.invoiceNo, 10) || 0));
      setInvoicesList(reseq);
      if (reseq.length > 0) setCurrentInvoice(reseq[0]);
      await storageService.saveGuestInvoices(reseq);
      await storageService.saveNextInvoiceNumber(reseq.length + 1);
      Alert.alert('Demo Bills Re-numbered', 'Demo bills re-sequenced sequentially.');
      return;
    }
    if (!user?.uid || invoicesList.length === 0) return;
    try {
      const fixed = await syncService.resequenceInvoices(user.uid, invoicesList);
      setInvoicesList(fixed);
      if (fixed.length > 0) {
        setCurrentInvoice(fixed[0]);
      }
      Alert.alert(
        'Serial Numbers Maintained',
        `All ${fixed.length} bills have been verified and re-indexed sequentially (1, 2, 3...) with zero missing numbers.`
      );
    } catch (err) {
      console.warn('Resequence error:', err);
    }
  };

  // 1-Tap Print Handler (with Sub-Module 1.4 Guest & 2.4 License Gating)
  const handlePrint = async (targetInvoice?: InvoiceData | null): Promise<void> => {
    if (user?.isGuest) {
      setShowGuestPrintModal(true);
      return;
    }

    if (!canPrint && !isActivated) {
      openActivationModal();
      return;
    }

    const inv = targetInvoice || currentInvoice;
    if (!inv) {
      Alert.alert('No Receipt', 'Please create a sale first before printing.');
      return;
    }

    if (!targetAddress) {
      Alert.alert(
        'Printer Needed',
        'Please link your thermal printer first.\n\nOpen Thermal Printers Setup to connect your 80mm or 58mm printer.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Printer', onPress: () => setShowPrintersModal(true) },
        ]
      );
      return;
    }

    try {
      setIsPrinting(true);
      const result = await dispatchPrintReceipt(activeConfig, inv);
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
    if (user?.isGuest) {
      setShowGuestPrintModal(true);
      return;
    }

    if (!canPrint && !isActivated) {
      openActivationModal();
      return;
    }

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
    if (user?.isGuest) {
      setShowGuestPrintModal(true);
      return;
    }

    if (!canPrint && !isActivated) {
      openActivationModal();
      return;
    }

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
  const handleShare = async (targetInvoice?: InvoiceData | null): Promise<void> => {
    const inv = targetInvoice || currentInvoice;
    if (!inv) {
      Alert.alert('No Receipt', 'Please create a sale first before sharing.');
      return;
    }
    try {
      await Share.share({
        title: `Slip #${inv.invoiceNo}`,
        message: `📦 Delivery Slip\nInvoice No: ${inv.invoiceNo}\nCustomer: ${inv.customerName || 'Walk-in Customer'}\nDate: ${inv.date}\nTotal Amount: ₹${inv.grandTotal}\nTotal Items: ${inv.items.length}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Browse Catalog - Direct Navigation to Items Tab
  const handleBrowseCatalog = (): void => {
    setActiveTab('items');
  };

  // Handle Save Invoice from SaleScreen
  const handleSaveInvoice = (
    savedInvoice: InvoiceData,
    shouldPrint?: boolean,
    andNew?: boolean
  ) => {
    setCurrentInvoice(savedInvoice);
    setInvoicesList((prev) => {
      const updated = [
        savedInvoice,
        ...prev.filter((inv) => inv.invoiceNo !== savedInvoice.invoiceNo),
      ];
      if (user?.isGuest) {
        storageService.saveGuestInvoices(updated);
      } else {
        storageService.saveInvoices(updated);
      }
      return updated;
    });

    // Increment and persist sequential invoice counter (Real stores only)
    const currentNum = parseInt(savedInvoice.invoiceNo, 10);
    if (!isNaN(currentNum)) {
      if (!user?.isGuest) {
        storageService.saveNextInvoiceNumber(currentNum + 1);
      }
    }

    // Background non-blocking push to Cloud Firestore (Real stores only)
    if (user?.uid && !user.isGuest) {
      syncService.pushInvoice(user.uid, savedInvoice);
    }

    if (shouldPrint) {
      handlePrint(savedInvoice);
    }

    // Automatically navigate to Invoices tab upon successful creation (unless cashier tapped Save & New)
    if (!andNew) {
      setActiveTab('bills');
    }
  };

  // Handle Delete Invoice with Auto-Renumbering to maintain continuous 1, 2, 3... sequence
  const handleDeleteInvoice = async (invoiceNo: string) => {
    if (user?.isGuest) {
      const remaining = invoicesList.filter((inv) => inv.invoiceNo !== invoiceNo);
      // Auto-renumber remaining guest demo invoices so serial sequence is never broken (1, 2, 3...)
      const sortedAsc = [...remaining].sort((a, b) => (parseInt(a.invoiceNo, 10) || 0) - (parseInt(b.invoiceNo, 10) || 0));
      const reseq = sortedAsc.map((inv, idx) => ({ ...inv, invoiceNo: String(idx + 1) })).sort((a, b) => (parseInt(b.invoiceNo, 10) || 0) - (parseInt(a.invoiceNo, 10) || 0));
      setInvoicesList(reseq);
      await storageService.saveGuestInvoices(reseq);
      await storageService.saveNextInvoiceNumber(reseq.length + 1);
      if (reseq.length > 0) {
        setCurrentInvoice(reseq[0]);
      } else {
        setCurrentInvoice(null);
      }
      return;
    }

    // 1. Immediately update UI state (0ms latency, zero popup interruption)
    const remaining = invoicesList.filter((inv) => inv.invoiceNo !== invoiceNo);
    const sortedAsc = [...remaining].sort((a, b) => (parseInt(a.invoiceNo, 10) || 0) - (parseInt(b.invoiceNo, 10) || 0));
    const reseq = sortedAsc.map((inv, idx) => ({ ...inv, invoiceNo: String(idx + 1) })).sort((a, b) => (parseInt(b.invoiceNo, 10) || 0) - (parseInt(a.invoiceNo, 10) || 0));

    setInvoicesList(reseq);
    if (reseq.length > 0) {
      setCurrentInvoice(reseq[0]);
    } else {
      setCurrentInvoice(null);
    }
    await storageService.saveInvoices(reseq);
    await storageService.saveNextInvoiceNumber(reseq.length + 1);

    // 2. Background Firestore synchronization & cloud resequence (fault-tolerant)
    if (user?.uid) {
      try {
        await syncService.deleteInvoice(user.uid, invoiceNo);
        await syncService.resequenceInvoices(user.uid, remaining);
      } catch (err) {
        console.warn('Background delete/resequence notice:', err);
      }
    }
  };

  // Handle Update Invoice Status (Paid <-> Unpaid)
  const handleUpdateInvoiceStatus = (invoiceNo: string, newStatus: 'PAID' | 'UNPAID') => {
    const updatedList = invoicesList.map((inv) =>
      inv.invoiceNo === invoiceNo ? { ...inv, status: newStatus } : inv
    );
    setInvoicesList(updatedList);
    if (currentInvoice?.invoiceNo === invoiceNo) {
      setCurrentInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    if (user?.isGuest) {
      storageService.saveGuestInvoices(updatedList);
    } else {
      storageService.saveInvoices(updatedList);
    }

    // Background status update in Cloud Firestore (Real stores only)
    if (user?.uid && !user.isGuest) {
      const target = updatedList.find((inv) => inv.invoiceNo === invoiceNo);
      if (target) {
        syncService.pushInvoice(user.uid, target);
      }
    }
  };

  // Save or Update Catalog Preset Item (with Price Trend Tracking)
  const handleSavePresetItem = async (item: PresetItem) => {
    const existingIdx = presetItems.findIndex((it) => it.id === item.id);
    let updated: PresetItem[];
    if (existingIdx >= 0) {
      updated = [...presetItems];
      updated[existingIdx] = item;
    } else {
      updated = [item, ...presetItems];
    }
    setPresetItems(updated);
    if (user?.isGuest) {
      await storageService.saveGuestPresetItems(updated);
    } else {
      await storageService.savePresetItems(updated);
      if (user?.uid) {
        syncService.pushPresetItem(user.uid, item);
      }
    }
  };

  // Delete Catalog Preset Item
  const handleDeletePresetItem = async (itemId: string) => {
    const updated = presetItems.filter((it) => it.id !== itemId);
    setPresetItems(updated);
    if (user?.isGuest) {
      await storageService.saveGuestPresetItems(updated);
    } else {
      await storageService.savePresetItems(updated);
      if (user?.uid) {
        syncService.deletePresetItem(user.uid, itemId);
      }
    }
  };

  // Pull-to-refresh Catalog Preset Items
  const handleRefreshItems = async () => {
    if (user?.isGuest) {
      setIsRefreshingItems(true);
      const guestItems = await storageService.loadGuestPresetItems();
      setPresetItems(guestItems);
      setIsRefreshingItems(false);
      return;
    }
    if (!user?.uid) return;
    setIsRefreshingItems(true);
    try {
      const cloudItems = await syncService.pullAllPresetItems(user.uid);
      if (cloudItems && cloudItems.length > 0) {
        setPresetItems(cloudItems);
        await storageService.savePresetItems(cloudItems);
      } else {
        const local = await storageService.loadPresetItems();
        if (local && local.length > 0) {
          setPresetItems(local);
        }
      }
    } catch (err) {
      console.warn('Pull-to-refresh preset items error:', err);
    } finally {
      setIsRefreshingItems(false);
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

  // Confirm Sign Out Handler (with local state and cache cleanup)
  const handleConfirmSignOut = () => {
    Alert.alert(
      'Sign Out of Store',
      `Are you sure you want to sign out of ${user?.shopName || 'your store account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setInvoicesList([]);
            setCurrentInvoice(null);
            setActiveTab('home');
            await signOut();
          },
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
            storeName={user?.isGuest ? 'Demo Supermarket' : (user?.shopName || 'FlashBill POS')}
            printerName={printerName}
            isConnected={!!targetAddress}
            onPressPrinterPill={() => setShowPrintersModal(true)}
            onPressMenu={() => setShowDrawer(true)}
            onPressSettings={() => setShowSettingsModal(true)}
            onPressAccount={() => setShowAccountModal(true)}
            onPressSignOut={handleConfirmSignOut}
            isGuest={!!user?.isGuest}
            isActivated={canPrint || isActivated}
            onPressActivate={openActivationModal}
          />

          {/* Retail Flash Metrics Strip */}
          <FlashStats
            grandTotal={currentInvoice?.grandTotal || '0.00'}
            totalQty={currentInvoice?.totalQty || '0'}
            itemsCount={currentInvoice?.items?.length || 0}
            invoicesCount={invoicesList.length}
          />

          {/* High-Speed Retail POS Command Deck */}
          <QuickActionGrid
            onPressNewSale={() => setActiveTab('sale')}
            onPressInvoices={() => setActiveTab('bills')}
            onPressCatalog={() => setActiveTab('items')}
            onPressPrinters={() => setShowPrintersModal(true)}
          />

          {/* Active Transaction Hub Card with 1-Tap Print & Share */}
          <RecentBillsCard
            invoice={currentInvoice}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onPressPrint={() => handlePrint(currentInvoice)}
            onPressShare={() => handleShare(currentInvoice)}
            onPressMenu={() => currentInvoice && setHomeMenuInvoice(currentInvoice)}
            onPressNewSale={() => setActiveTab('sale')}
          />

          {/* True-to-Life Cream Monospace Receipt Preview */}
          {showPreview && currentInvoice && (
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
          initialInvoiceNo={nextInvoiceNo}
          shopName={user?.shopName || currentInvoice?.shopName || 'Delivery Slip'}
          onBack={() => setActiveTab('home')}
          onSaveInvoice={handleSaveInvoice}
          presetItems={presetItems}
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
          onResequence={handleResequenceInvoices}
          isGuest={!!user?.isGuest}
          onRegisterStore={() => setShowGuestPrintModal(true)}
        />
      </View>

      {/* Tab 4: Items & Catalog Tab Screen */}
      <View
        style={[
          styles.tabContent,
          { display: activeTab === 'items' ? 'flex' : 'none' },
        ]}
      >
        <ItemsScreen
          items={presetItems}
          onSaveItem={handleSavePresetItem}
          onDeleteItem={handleDeletePresetItem}
          onRefresh={handleRefreshItems}
          isRefreshing={isRefreshingItems}
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
        onOpenActivationModal={openActivationModal}
      />

      {/* Side Navigation Drawer (Concept 1) */}
      <AppDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onOpenPrintersModal={() => setShowPrintersModal(true)}
        onSignOut={handleConfirmSignOut}
        onOpenActivationModal={openActivationModal}
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
        onOpenPrintersTab={() => setShowPrintersModal(true)}
      />

      {/* Bluetooth Thermal Printers Setup Modal */}
      <PrintersModal
        visible={showPrintersModal}
        onClose={() => setShowPrintersModal(false)}
        targetAddress={targetAddress}
        printerName={printerName}
        isScanning={isScanning}
        isPrinting={isPrinting}
        deviceList={deviceList}
        selectedProfile={selectedProfile}
        activeConfig={activeConfig}
        sampleInvoice={currentInvoice || SAMPLE_INVOICE}
        lastError={lastError}
        isAutoDetected={isAutoDetected}
        onClearError={clearLastError}
        onSelectProfile={handleSelectProfile}
        onScan={discoverAndBindPrinter}
        onConnect={connectToDevice}
        onDisconnect={disconnectPrinter}
        onTestPrint={handleTestPrint}
        onPaperFeed={handlePaperFeed}
      />

      {/* Guest Thermal Print Lock Conversion Modal (Sub-Module 1.4) */}
      <GuestPrintModal
        visible={showGuestPrintModal}
        onClose={() => setShowGuestPrintModal(false)}
        onRegister={async () => {
          setShowGuestPrintModal(false);
          await signOut();
        }}
      />

      {/* Store Licensing & Activation Modal (Module 2) */}
      <ActivationModal
        visible={showActivationModal}
        onClose={closeActivationModal}
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
        <LicenseProvider>
          <MainScreen />
        </LicenseProvider>
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
