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

// Static Data matching your sample photo exactly
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

// 58mm line width limit: exactly 32 characters per line
const LINE_WIDTH = 32;
const DIVIDER_LINE = '-'.repeat(LINE_WIDTH) + '\n';

export default function App(): React.JSX.Element {
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [printerName, setPrinterName] = useState<string>('None Linked');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [deviceList, setDeviceList] = useState<BluetoothDevice[]>([]);
  const [showDeviceList, setShowDeviceList] = useState<boolean>(false);

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

  // 1. Scan for devices, auto-bind SC588 or populate device list
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

      // Match against known hardware identifier strings for SC588 / thermal POS
      const printerTarget = uniqueDevices.find((device) => {
        const devName = (device.name || '').toUpperCase();
        return (
          devName.includes('SC588') ||
          devName.includes('PRINTER') ||
          devName.includes('POS') ||
          devName.includes('MTP')
        );
      });

      if (printerTarget) {
        await connectToDevice(printerTarget.address, printerTarget.name || 'SC588 Thermal Printer');
      } else if (uniqueDevices.length > 0) {
        setShowDeviceList(true);
        Alert.alert(
          'Devices Discovered',
          `Discovered ${uniqueDevices.length} Bluetooth device(s). Tap your printer in the list below to connect.`
        );
      } else {
        Alert.alert(
          'Hardware Missing',
          'Could not locate SC588 via Bluetooth.\n\n1. Check printer green LED.\n2. Ensure device is paired in Samsung Settings > Bluetooth.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Discovery Exception', msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to target device address
  const connectToDevice = async (address: string, name: string): Promise<void> => {
    try {
      setIsScanning(true);
      await BluetoothManager.connect(address);
      setTargetAddress(address);
      setPrinterName(name || address);
      setShowDeviceList(false);
      Alert.alert('Link Verified', `${name || 'Printer'} locked and bound successfully.`);
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

  // 2. Format transmission stream according to 58mm (32 chars) constraints
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
        heigthtimes: 1, // Double height for banner visibility
        fonttype: 1,    // Double-weight BOLD
      });
      await BluetoothEscposPrinter.printText(DIVIDER_LINE, {});

      // --- Invoice Meta Block ---
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      await BluetoothEscposPrinter.printText(`Date: ${SAMPLE_INVOICE.date}\n`, {});
      await BluetoothEscposPrinter.printText(`Invoice No: ${SAMPLE_INVOICE.invoiceNo}\n`, {});
      await BluetoothEscposPrinter.printText(DIVIDER_LINE, {});

      // --- Invoicing Matrix (Columns total exactly 32) ---
      // # (3) + Item (11) + Qty (5) + Price (6) + Amount (7) = 32 Characters
      const gridMetrics: number[] = [3, 11, 5, 6, 7];
      const gridPositions: number[] = [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.RIGHT,
        BluetoothEscposPrinter.ALIGN.RIGHT,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ];

      // Table Header Row
      await BluetoothEscposPrinter.printColumn(
        gridMetrics,
        gridPositions,
        ['#', 'Name', 'Qty', 'Pri', 'Amt'],
        {}
      );
      await BluetoothEscposPrinter.printText(DIVIDER_LINE, {});

      // --- Core Items Render Loop ---
      for (const record of SAMPLE_INVOICE.items) {
        await BluetoothEscposPrinter.printColumn(
          gridMetrics,
          gridPositions,
          [
            record.sNo,
            record.name.substring(0, 11), // Strict 11-char max width
            record.qty,
            record.price,
            record.amt,
          ],
          {}
        );
      }
      await BluetoothEscposPrinter.printText(DIVIDER_LINE, {});

      // --- Cumulative Summary Region ---
      // Label (20) + Value (12) = 32 Characters
      const totalBlockMetrics: number[] = [20, 12];
      await BluetoothEscposPrinter.printColumn(
        totalBlockMetrics,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Total Items/Qty:', SAMPLE_INVOICE.totalQty],
        {}
      );

      await BluetoothEscposPrinter.printColumn(
        totalBlockMetrics,
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT],
        ['Total Amount:', SAMPLE_INVOICE.grandTotal],
        { fonttype: 1 } // BOLD font weight
      );

      // --- Paper Feed Management ---
      // Advance paper past tear bar
      await BluetoothEscposPrinter.printText('\n\n\n\n', {});

      Alert.alert('Print Finished', 'Receipt stream dispatched to SC588 successfully.');
    } catch (printError: unknown) {
      const msg = printError instanceof Error ? printError.message : String(printError);
      Alert.alert('Print Execution Aborted', msg);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A24" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.viewPort}>
          <Text style={styles.headline}>SC588 Diagnostic Control Panel</Text>
          <Text style={styles.subhead}>Samsung Galaxy A34 5G • 58mm Blueprint</Text>

          {/* Active Node Dashboard */}
          <View style={styles.dashboard}>
            <View style={styles.statusRow}>
              <Text style={styles.lbl}>Active Node ID</Text>
              <View
                style={[
                  styles.statusDot,
                  targetAddress ? styles.dotGreen : styles.dotRed,
                ]}
              />
            </View>
            <Text style={styles.val}>{printerName}</Text>
            {targetAddress ? (
              <Text style={styles.macAddress}>MAC: {targetAddress}</Text>
            ) : null}

            {targetAddress ? (
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={disconnectPrinter}
              >
                <Text style={styles.disconnectTxt}>Disconnect</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Fallback Discovered Devices Picker */}
          {showDeviceList && deviceList.length > 0 ? (
            <View style={styles.deviceListBox}>
              <Text style={styles.deviceListTitle}>Select Your Printer:</Text>
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

          {/* 1. Locate and Bind Trigger */}
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

          {/* 2. Push Receipt Trigger */}
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
              <Text style={styles.triggerTxt}>2. Push Blueprint Receipt</Text>
            )}
          </TouchableOpacity>

          {/* Live Monospace Receipt Layout Preview (32 Columns) */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Live 32-Col Layout Preview</Text>
            <View style={styles.receiptPaper}>
              <Text style={styles.paperCenterBold}>{SAMPLE_INVOICE.shopName}</Text>
              <Text style={styles.paperMono}>--------------------------------</Text>
              <Text style={styles.paperMono}>Date: {SAMPLE_INVOICE.date}</Text>
              <Text style={styles.paperMono}>Invoice No: {SAMPLE_INVOICE.invoiceNo}</Text>
              <Text style={styles.paperMono}>--------------------------------</Text>
              <Text style={styles.paperMono}>#  Name        Qty   Pri    Amt</Text>
              <Text style={styles.paperMono}>--------------------------------</Text>
              {SAMPLE_INVOICE.items.map((it) => (
                <Text key={it.sNo} style={styles.paperMono}>
                  {it.sNo.padEnd(3)}
                  {it.name.substring(0, 11).padEnd(11)}
                  {it.qty.padStart(5)}
                  {it.price.padStart(6)}
                  {it.amt.padStart(7)}
                </Text>
              ))}
              <Text style={styles.paperMono}>--------------------------------</Text>
              <Text style={styles.paperMono}>
                {'Total Items/Qty:'.padEnd(20)}
                {SAMPLE_INVOICE.totalQty.padStart(12)}
              </Text>
              <Text style={styles.paperMonoBold}>
                {'Total Amount:'.padEnd(20)}
                {SAMPLE_INVOICE.grandTotal.padStart(12)}
              </Text>
              <Text style={styles.paperMono}>--------------------------------</Text>
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
    padding: 24,
    paddingTop: 16,
  },
  headline: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subhead: {
    fontSize: 12,
    color: '#8A8A9A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  dashboard: {
    backgroundColor: '#262636',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#4CD964',
  },
  dotRed: {
    backgroundColor: '#FF3B30',
  },
  lbl: {
    color: '#8A8A9A',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    color: '#4CD964',
    fontWeight: 'bold',
    fontSize: 18,
  },
  macAddress: {
    color: '#6A6A7A',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  disconnectBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3A3A4A',
  },
  disconnectTxt: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceListBox: {
    backgroundColor: '#20202E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deviceListTitle: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  deviceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3E',
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  deviceMac: {
    color: '#8A8A9A',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  primaryTrigger: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  successTrigger: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 4,
    marginBottom: 30,
  },
  previewTitle: {
    color: '#8A8A9A',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  receiptPaper: {
    backgroundColor: '#FFFDF0',
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4CEB0',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  paperCenterBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#111',
    textAlign: 'center',
    marginBottom: 4,
  },
  paperMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#111',
    lineHeight: 16,
  },
  paperMonoBold: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#000',
    lineHeight: 16,
  },
});
