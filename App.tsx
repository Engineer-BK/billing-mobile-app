import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
  BluetoothDevice,
  DeviceListResponse,
} from './services/bluetoothPrinter';

// Strong typing for invoice line item
export interface InvoiceItem {
  sNo: string;
  name: string;
  qty: string;
  price: string;
  amt: string;
}

// Strong typing for receipt payload
export interface InvoiceData {
  shopName: string;
  date: string;
  invoiceNo: string;
  items: InvoiceItem[];
  totalQty: string;
  grandTotal: string;
}

// Static Data matching your sample receipt photo
const SAMPLE_INVOICE: InvoiceData = {
  shopName: 'Aftab Rental',
  date: '26/10/2026',
  invoiceNo: '38',
  items: [
    { sNo: '1', name: 'CHANACHUR', qty: '2', price: '90', amt: '180' },
    { sNo: '2', name: 'S N T RICE', qty: '2', price: '40', amt: '80' },
    { sNo: '3', name: 'SUN R MIRC', qty: '0.4', price: '490', amt: '196' },
    { sNo: '4', name: 'POTATO F', qty: '50', price: '17', amt: '850' },
    { sNo: '5', name: 'BHUJIA-700', qty: '4', price: '65', amt: '260' },
    { sNo: '6', name: 'SUJI', qty: '1', price: '45', amt: '45' },
    { sNo: '7', name: 'LONG-', qty: '0.05', price: '1500', amt: '75' },
    { sNo: '8', name: 'MAIDA', qty: '1', price: '1880', amt: '1880' },
    { sNo: '9', name: 'PLAM OIL 1', qty: '1', price: '2190', amt: '2190' },
    { sNo: '10', name: 'ONION', qty: '1', price: '55', amt: '55' },
    { sNo: '11', name: 'L C', qty: '1', price: '15', amt: '15' },
  ],
  totalQty: '63.45',
  grandTotal: '5826',
};

export type PrinterProfileId = 'SC588' | 'EZO80';

export interface PrinterProfile {
  id: PrinterProfileId;
  displayName: string;
  badge: string;
  paperWidth: string;
  lineWidth: number;
  nameCharLimit: number;
  hasAutoCutter: boolean;
  gridMetrics: number[];
  gridPositions: number[];
  headerColumns: string[];
  totalMetrics: number[];
  totalPositions: number[];
  feedLines: string;
}

export const PRINTER_PROFILES: Record<PrinterProfileId, PrinterProfile> = {
  SC588: {
    id: 'SC588',
    displayName: 'SC588 (58mm)',
    badge: '2-Inch • 32 Col',
    paperWidth: '58mm Roll',
    lineWidth: 32,
    nameCharLimit: 11,
    hasAutoCutter: false,
    // Columns: # (3) + Name (11) + Qty (5) + Price (6) + Amount (7) = 32
    gridMetrics: [3, 11, 5, 6, 7],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Name', 'Qty', 'Pri', 'Amt'],
    // Summary: Label (20) + Value (12) = 32
    totalMetrics: [20, 12],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    feedLines: '\n\n\n', // Optimal feed past physical serrated tear teeth
  },
  EZO80: {
    id: 'EZO80',
    displayName: 'EZO 80UB (80mm)',
    badge: '3-Inch • 48 Col • Auto-Cut',
    paperWidth: '80mm Roll',
    lineWidth: 48,
    nameCharLimit: 20,
    hasAutoCutter: true,
    // Columns: # (4) + Item Description (20) + Qty (6) + Price (8) + Amount (10) = 48
    gridMetrics: [4, 20, 6, 8, 10],
    gridPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    headerColumns: ['#', 'Item Description', 'Qty', 'Price', 'Amount'],
    // Summary: Label (30) + Value (18) = 48
    totalMetrics: [30, 18],
    totalPositions: [
      BluetoothEscposPrinter.ALIGN.LEFT,
      BluetoothEscposPrinter.ALIGN.RIGHT,
    ],
    feedLines: '\n\n\n', // Optimal feed past motorized guillotine blade
  },
};

// Edge-to-edge clipped dashed receipt separator
function DashedDivider(): React.JSX.Element {
  return (
    <View style={styles.dividerBox}>
      <Text
        allowFontScaling={false}
        style={styles.dividerTxt}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {'-'.repeat(80)}
      </Text>
    </View>
  );
}

export default function App(): React.JSX.Element {
  const [selectedProfile, setSelectedProfile] = useState<PrinterProfileId>('SC588');
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [printerName, setPrinterName] = useState<string>('None Linked');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [deviceList, setDeviceList] = useState<BluetoothDevice[]>([]);
  const [showDeviceList, setShowDeviceList] = useState<boolean>(false);

  const activeConfig = PRINTER_PROFILES[selectedProfile];
  const dividerLine = '-'.repeat(activeConfig.lineWidth) + '\n';

  // Request Bluetooth & Location permissions required for Samsung Galaxy A34 (Android 14 / API 34)
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Bluetooth Location Permission',
            message: 'Bluetooth scanning requires location permission on Android.',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err: unknown) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Helper to auto-detect model profile based on Bluetooth broadcast name
  const autoDetectProfileByName = (name: string): PrinterProfileId => {
    const devUpper = (name || '').toUpperCase();
    if (
      devUpper.includes('80UB') ||
      devUpper.includes('EZO') ||
      devUpper.includes('POS-80') ||
      devUpper.includes('POS80') ||
      devUpper.includes('80MM')
    ) {
      return 'EZO80';
    }
    return 'SC588';
  };

  // 1. Scan for devices, auto-bind matching printer or show device picker
  const discoverAndBindPrinter = async (): Promise<void> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Samsung Galaxy A34 requires Nearby Devices (Bluetooth) permissions to find your thermal printer.'
      );
      return;
    }

    try {
      setIsScanning(true);
      setShowDeviceList(false);

      const deviceListRaw = await BluetoothManager.scanDevices();
      let parsedDevices: DeviceListResponse = {};

      if (typeof deviceListRaw === 'string') {
        try {
          parsedDevices = JSON.parse(deviceListRaw) as DeviceListResponse;
        } catch {
          parsedDevices = {};
        }
      } else if (deviceListRaw && typeof deviceListRaw === 'object') {
        parsedDevices = deviceListRaw as DeviceListResponse;
      }

      const paired: BluetoothDevice[] = parsedDevices.paired || [];
      const found: BluetoothDevice[] = parsedDevices.found || [];
      const combinedRegistry: BluetoothDevice[] = [...paired, ...found];

      // Remove duplicate MAC addresses
      const uniqueDevices = Array.from(
        new Map(combinedRegistry.map((item) => [item.address, item])).values()
      );

      setDeviceList(uniqueDevices);

      // Match against known hardware identifier strings for EZO 80UB, SC588, or general POS
      const printerTarget = uniqueDevices.find((device) => {
        const devName = (device.name || '').toUpperCase();
        return (
          devName.includes('80UB') ||
          devName.includes('EZO') ||
          devName.includes('SC588') ||
          devName.includes('PRINTER') ||
          devName.includes('POS') ||
          devName.includes('MTP')
        );
      });

      if (printerTarget) {
        await connectToDevice(printerTarget.address, printerTarget.name || 'Thermal POS Printer');
      } else if (uniqueDevices.length > 0) {
        setShowDeviceList(true);
        Alert.alert(
          'Devices Discovered',
          `Discovered ${uniqueDevices.length} Bluetooth device(s). Tap your printer in the list below to connect.`
        );
      } else {
        Alert.alert(
          'Hardware Missing',
          'Could not locate printer via Bluetooth.\n\n1. Ensure printer power is ON (green LED).\n2. Pair device once in Samsung Settings > Bluetooth.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Discovery Exception', msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to target device address & automatically set appropriate printer profile
  const connectToDevice = async (address: string, name: string): Promise<void> => {
    try {
      setIsScanning(true);
      await BluetoothManager.connect(address);
      setTargetAddress(address);
      setPrinterName(name || address);
      setShowDeviceList(false);

      // Auto-detect profile from name
      const detectedProfile = autoDetectProfileByName(name);
      setSelectedProfile(detectedProfile);

      Alert.alert(
        'Link Verified',
        `${name || 'Printer'} locked and bound successfully.\nActive Profile: ${PRINTER_PROFILES[detectedProfile].displayName}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Connection Failed', `Could not connect to ${name}: ${msg}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Disconnect active printer
  const disconnectPrinter = async (): Promise<void> => {
    try {
      if (targetAddress) {
        await BluetoothManager.disconnect(targetAddress);
      }
      setTargetAddress(null);
      setPrinterName('None Linked');
      Alert.alert('Disconnected', 'Printer session terminated.');
    } catch (err: unknown) {
      console.warn(err);
    }
  };

  // 2. Format transmission stream dynamically for SC588 (32 cols) or EZO 80UB (48 cols + Auto-Cut)
  const pushPrintJob = async (): Promise<void> => {
    if (!targetAddress) {
      Alert.alert('Action Blocked', 'Please link your hardware first using the discovery module.');
      return;
    }

    try {
      setIsPrinting(true);

      // Hardware initialization & reset left margin
      await BluetoothEscposPrinter.printerInit();
      await BluetoothEscposPrinter.printerLeftSpace(0);

      // --- Header Region ---
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
      await BluetoothEscposPrinter.printText(`${SAMPLE_INVOICE.shopName}\n`, {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 1,
        heigthtimes: 1, // Double height banner
        fonttype: 1,    // Double-weight BOLD
      });
      await BluetoothEscposPrinter.printText(dividerLine, {});

      // --- Invoice Meta Block ---
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText(`Date: ${SAMPLE_INVOICE.date}\n`, {});
      await BluetoothEscposPrinter.printText(`Invoice No: ${SAMPLE_INVOICE.invoiceNo}\n`, {});
      await BluetoothEscposPrinter.printText(dividerLine, {});

      // --- Table Header Row ---
      await BluetoothEscposPrinter.printColumn(
        activeConfig.gridMetrics,
        activeConfig.gridPositions,
        activeConfig.headerColumns,
        {}
      );
      await BluetoothEscposPrinter.printText(dividerLine, {});

      // --- Core Items Render Loop ---
      for (const record of SAMPLE_INVOICE.items) {
        await BluetoothEscposPrinter.printColumn(
          activeConfig.gridMetrics,
          activeConfig.gridPositions,
          [
            record.sNo,
            record.name.substring(0, activeConfig.nameCharLimit),
            record.qty,
            record.price,
            record.amt,
          ],
          {}
        );
      }
      await BluetoothEscposPrinter.printText(dividerLine, {});

      // --- Cumulative Summary Region ---
      await BluetoothEscposPrinter.printColumn(
        activeConfig.totalMetrics,
        activeConfig.totalPositions,
        ['Total Items/Qty:', SAMPLE_INVOICE.totalQty],
        {}
      );

      await BluetoothEscposPrinter.printColumn(
        activeConfig.totalMetrics,
        activeConfig.totalPositions,
        ['Total Amount:', SAMPLE_INVOICE.grandTotal],
        { fonttype: 1 } // BOLD font weight
      );

      // --- Paper Feed & Auto-Cutter Management ---
      await BluetoothEscposPrinter.printText(activeConfig.feedLines, {});

      if (activeConfig.hasAutoCutter) {
        // ESC/POS Auto-Cutter command: GS V 0 (0x1D 0x56 0x00) Full Cut
        await BluetoothEscposPrinter.printText('\x1D\x56\x00', {});
      }

      Alert.alert(
        'Print Finished',
        `Receipt stream dispatched to ${activeConfig.displayName} successfully.${
          activeConfig.hasAutoCutter ? '\n✂️ Auto-cutter blade triggered.' : ''
        }`
      );
    } catch (printError: unknown) {
      const msg = printError instanceof Error ? printError.message : String(printError);
      Alert.alert('Print Execution Aborted', msg);
    } finally {
      setIsPrinting(false);
    }
  };

  const isEzo = selectedProfile === 'EZO80';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A24" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.viewPort}>
          <Text style={styles.headline}>Thermal POS Control Panel</Text>
          <Text style={styles.subhead}>Dual-Engine • SC588 (58mm) & EZO 80UB (80mm)</Text>

          {/* Interactive Hardware Profile Switcher */}
          <View style={styles.profileSwitcherCard}>
            <Text style={styles.switcherLabel}>SELECT PRINTER PROFILE</Text>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedProfile === 'SC588' && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedProfile('SC588')}
              >
                <Text
                  style={[
                    styles.tabButtonTitle,
                    selectedProfile === 'SC588' && styles.tabButtonTitleActive,
                  ]}
                >
                  SC588 (58mm)
                </Text>
                <Text
                  style={[
                    styles.tabButtonSub,
                    selectedProfile === 'SC588' && styles.tabButtonSubActive,
                  ]}
                >
                  32 Col • 2-Inch
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedProfile === 'EZO80' && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedProfile('EZO80')}
              >
                <Text
                  style={[
                    styles.tabButtonTitle,
                    selectedProfile === 'EZO80' && styles.tabButtonTitleActive,
                  ]}
                >
                  EZO 80UB (80mm)
                </Text>
                <Text
                  style={[
                    styles.tabButtonSub,
                    selectedProfile === 'EZO80' && styles.tabButtonSubActive,
                  ]}
                >
                  48 Col • Auto-Cut
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Node Dashboard */}
          <View style={styles.dashboard}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.lbl}>Connected Device</Text>
                <Text style={styles.val}>{printerName}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  targetAddress ? styles.dotGreen : styles.dotRed,
                ]}
              />
            </View>

            {targetAddress ? (
              <Text style={styles.macAddress}>MAC: {targetAddress}</Text>
            ) : null}

            <View style={styles.profileBadgeRow}>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeTxt}>{activeConfig.badge}</Text>
              </View>
              {activeConfig.hasAutoCutter ? (
                <View style={styles.cutterBadge}>
                  <Text style={styles.cutterBadgeTxt}>✂️ Auto-Cutter</Text>
                </View>
              ) : null}
            </View>

            {targetAddress ? (
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={disconnectPrinter}
              >
                <Text style={styles.disconnectTxt}>Disconnect</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Discovered Devices Picker Sheet */}
          {showDeviceList && deviceList.length > 0 ? (
            <View style={styles.deviceListBox}>
              <Text style={styles.deviceListTitle}>Select Your Bluetooth Printer:</Text>
              {deviceList.map((dev: BluetoothDevice) => (
                <TouchableOpacity
                  key={dev.address}
                  style={styles.deviceItem}
                  onPress={() =>
                    connectToDevice(dev.address, dev.name || dev.address)
                  }
                >
                  <Text style={styles.deviceName}>
                    {dev.name || 'Unnamed Bluetooth Device'}
                  </Text>
                  <Text style={styles.deviceMac}>{dev.address}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Action 1: Locate & Bind */}
          <TouchableOpacity
            style={[styles.primaryTrigger, isScanning && styles.disabledBtn]}
            onPress={discoverAndBindPrinter}
            disabled={isScanning || isPrinting}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.triggerTxt}>1. Locate & Bind Printer</Text>
            )}
          </TouchableOpacity>

          {/* Action 2: Push Receipt */}
          <TouchableOpacity
            style={[
              styles.successTrigger,
              (!targetAddress || isPrinting) && styles.locked,
            ]}
            onPress={pushPrintJob}
            disabled={!targetAddress || isPrinting || isScanning}
          >
            {isPrinting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.triggerTxt}>
                {`2. Push ${activeConfig.displayName} Receipt`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Live Monospace Layout Preview (Dynamic 32 or 48 Columns) */}
          <View style={styles.previewContainer}>
            <View style={styles.previewHeaderRow}>
              <Text style={styles.previewTitle}>
                {`Live Layout Preview (${activeConfig.lineWidth} Columns)`}
              </Text>
              <Text style={styles.paperWidthTag}>{activeConfig.paperWidth}</Text>
            </View>

            <View
              style={[
                styles.receiptPaper,
                selectedProfile === 'SC588'
                  ? styles.receiptPaper58
                  : styles.receiptPaper80,
              ]}
            >
              {/* Header: Shop Name */}
              <Text allowFontScaling={false} style={styles.paperCenterBold}>
                {SAMPLE_INVOICE.shopName}
              </Text>

              <DashedDivider />

              {/* Metadata Row */}
              <View style={styles.metaRow}>
                <Text allowFontScaling={false} style={styles.metaTxt}>
                  Date: {SAMPLE_INVOICE.date}
                </Text>
                <Text allowFontScaling={false} style={styles.metaTxt}>
                  Inv No: {SAMPLE_INVOICE.invoiceNo}
                </Text>
              </View>

              <DashedDivider />

              {/* Dynamic Table Header */}
              <View style={styles.tableRow}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colHeader,
                    { flex: activeConfig.gridMetrics[0] },
                  ]}
                >
                  #
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colHeader,
                    { flex: activeConfig.gridMetrics[1] },
                  ]}
                >
                  {selectedProfile === 'SC588' ? 'Name' : 'Item Description'}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colHeader,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[2] },
                  ]}
                >
                  Qty
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colHeader,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[3] },
                  ]}
                >
                  {selectedProfile === 'SC588' ? 'Pri' : 'Price'}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.colHeader,
                    styles.txtRight,
                    { flex: activeConfig.gridMetrics[4] },
                  ]}
                >
                  {selectedProfile === 'SC588' ? 'Amt' : 'Amount'}
                </Text>
              </View>

              <DashedDivider />

              {/* Dynamic Items Rows */}
              {SAMPLE_INVOICE.items.map((it) => (
                <View key={it.sNo} style={styles.tableRow}>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      { flex: activeConfig.gridMetrics[0] },
                    ]}
                  >
                    {it.sNo}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={[
                      styles.colCell,
                      { flex: activeConfig.gridMetrics[1] },
                    ]}
                  >
                    {it.name.substring(0, activeConfig.nameCharLimit)}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      styles.txtRight,
                      { flex: activeConfig.gridMetrics[2] },
                    ]}
                  >
                    {it.qty}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      styles.txtRight,
                      { flex: activeConfig.gridMetrics[3] },
                    ]}
                  >
                    {it.price}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.colCell,
                      styles.txtRight,
                      { flex: activeConfig.gridMetrics[4] },
                    ]}
                  >
                    {it.amt}
                  </Text>
                </View>
              ))}

              <DashedDivider />

              {/* Dynamic Summary Block */}
              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.summaryLabel}>
                  Total Items/Qty:
                </Text>
                <Text allowFontScaling={false} style={styles.summaryValue}>
                  {SAMPLE_INVOICE.totalQty}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text allowFontScaling={false} style={styles.grandTotalLabel}>
                  Grand Total Amount:
                </Text>
                <Text allowFontScaling={false} style={styles.grandTotalValue}>
                  {SAMPLE_INVOICE.grandTotal}
                </Text>
              </View>

              <DashedDivider />

              {/* Cutter Indicator on Paper */}
              {activeConfig.hasAutoCutter ? (
                <View style={styles.cutLineBox}>
                  <Text allowFontScaling={false} style={styles.cutLineTxt}>
                    - - - - - - - - ✂️ AUTO-CUT - - - - - - - -
                  </Text>
                </View>
              ) : (
                <View style={styles.tearLineBox}>
                  <Text allowFontScaling={false} style={styles.tearLineTxt}>
                    ▲ ▲ ▲ TEAR AGAINST SERRATED EDGE ▲ ▲ ▲
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A24',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#1A1A24',
  },
  viewPort: {
    flex: 1,
    backgroundColor: '#1A1A24',
    padding: 20,
    paddingTop: 14,
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subhead: {
    fontSize: 12,
    color: '#8A8A9A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  profileSwitcherCard: {
    backgroundColor: '#20202E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#323244',
  },
  switcherLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8A8A9A',
    marginBottom: 8,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#2A2A3C',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  tabButtonTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A0A0B2',
  },
  tabButtonTitleActive: {
    color: '#FFFFFF',
  },
  tabButtonSub: {
    fontSize: 10,
    color: '#707084',
    marginTop: 2,
  },
  tabButtonSubActive: {
    color: '#93C5FD',
  },
  dashboard: {
    backgroundColor: '#262636',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotGreen: {
    backgroundColor: '#4CD964',
  },
  dotRed: {
    backgroundColor: '#FF3B30',
  },
  lbl: {
    color: '#8A8A9A',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  macAddress: {
    color: '#7A7A8A',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  profileBadge: {
    backgroundColor: '#323246',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  profileBadgeTxt: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: '600',
  },
  cutterBadge: {
    backgroundColor: '#2D3748',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cutterBadgeTxt: {
    color: '#F6E05E',
    fontSize: 11,
    fontWeight: '600',
  },
  disconnectBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#3A3A4A',
  },
  disconnectTxt: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '600',
  },
  deviceListBox: {
    backgroundColor: '#20202E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deviceListTitle: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  deviceItem: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3E',
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceMac: {
    color: '#8A8A9A',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  primaryTrigger: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  successTrigger: {
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  locked: {
    backgroundColor: '#3A3A4A',
    opacity: 0.45,
  },
  triggerTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 4,
    marginBottom: 30,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  previewTitle: {
    color: '#8A8A9A',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  paperWidthTag: {
    color: '#00D2FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  receiptPaper: {
    backgroundColor: '#FFFDF0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4CEB0',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    paddingVertical: 12,
  },
  receiptPaper58: {
    width: '76%',
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  receiptPaper80: {
    width: '100%',
    paddingHorizontal: 12,
  },
  paperCenterBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 13.5,
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  metaTxt: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#333',
  },
  dividerBox: {
    height: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    marginVertical: 2,
  },
  dividerTxt: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#444',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  colHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: '#000',
  },
  colCell: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#111',
  },
  txtRight: {
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  summaryLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#222',
  },
  summaryValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10.5,
    color: '#111',
    textAlign: 'right',
  },
  grandTotalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000',
  },
  grandTotalValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000',
    textAlign: 'right',
  },
  cutLineBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    alignItems: 'center',
  },
  cutLineTxt: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#777',
    fontWeight: '600',
  },
  tearLineBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    alignItems: 'center',
  },
  tearLineTxt: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#888',
  },
});
