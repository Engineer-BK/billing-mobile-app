/**
 * hooks/useBluetoothScanner.ts
 * 
 * Custom hook to manage Bluetooth thermal printer lifecycle:
 * - Runtime Android 12+ (API 31+) permissions (Nearby Devices / Location)
 * - Discovery & paired device scanning
 * - Auto-binding to known POS hardware (SC588, EZO 80UB)
 * - Connection and disconnection management
 */

import { useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import {
  BluetoothManager,
  BluetoothDevice,
  DeviceListResponse,
} from '../services/bluetoothPrinter';
import { PrinterProfileId } from '../types/printer';

interface UseBluetoothScannerProps {
  onProfileAutoDetected?: (profile: PrinterProfileId) => void;
}

export function useBluetoothScanner({ onProfileAutoDetected }: UseBluetoothScannerProps = {}) {
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [printerName, setPrinterName] = useState<string>('None Linked');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [deviceList, setDeviceList] = useState<BluetoothDevice[]>([]);
  const [showDeviceList, setShowDeviceList] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Request Bluetooth & Location permissions required on Android 12+ (Samsung Galaxy A34).
   * Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT.
   * Android 11 and lower requires ACCESS_FINE_LOCATION.
   */
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

  /**
   * Inspects Bluetooth broadcast name to determine if the device is 80mm or 58mm.
   */
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

  /**
   * Scans for paired and nearby devices. Automatically links if known POS hardware is matched,
   * or displays the device picker sheet if multiple devices are found.
   */
  const discoverAndBindPrinter = async (): Promise<void> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Nearby Devices (Bluetooth) permissions are required to find your thermal printer.'
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

      // Deduplicate devices by MAC address
      const uniqueDevices = Array.from(
        new Map(combinedRegistry.map((item) => [item.address, item])).values()
      );

      setDeviceList(uniqueDevices);

      // If exactly 1 device found and no previous target, connect directly
      if (uniqueDevices.length === 1) {
        await connectToDevice(uniqueDevices[0].address, uniqueDevices[0].name || 'Thermal POS Printer');
      } else if (uniqueDevices.length > 1) {
        // If there's an already saved targetAddress in the list, reconnect to it
        const savedTarget = targetAddress ? uniqueDevices.find(d => d.address === targetAddress) : null;
        if (savedTarget) {
          await connectToDevice(savedTarget.address, savedTarget.name || 'Thermal POS Printer');
        } else {
          setShowDeviceList(true);
          Alert.alert(
            'Printers Discovered',
            `Found ${uniqueDevices.length} Bluetooth devices.\n\nTap 'Connect' next to your 80mm or 58mm printer in the list below.`
          );
        }
      } else {
        Alert.alert(
          'Hardware Missing',
          'Could not locate printer via Bluetooth.\n\n1. Ensure printer power is ON (green LED).\n2. Pair device in phone Settings > Bluetooth.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      Alert.alert('Discovery Exception', msg);
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Establishes a Bluetooth RFCOMM connection to the specified printer MAC address.
   */
  const connectToDevice = async (address: string, name: string): Promise<void> => {
    try {
      setIsScanning(true);
      setLastError(null);
      await BluetoothManager.connect(address);
      setTargetAddress(address);
      setPrinterName(name || address);
      setShowDeviceList(false);

      // Auto-detect profile and notify parent
      const detected = autoDetectProfileByName(name);
      onProfileAutoDetected?.(detected);

      Alert.alert('Link Verified', `${name || 'Printer'} connected and bound successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      Alert.alert(
        'Connection Failed',
        `Device: ${name || 'Printer'} (${address})\n\nDiagnostics:\n${msg}\n\nTroubleshooting Tips:\n1. Check if printer is paired in Android Settings > Bluetooth (PIN is usually 0000 or 1234).\n2. Turn printer OFF and back ON to reset connection.\n3. Make sure no other phone or application is connected to this printer.`
      );
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Terminates active Bluetooth session.
   */
  const disconnectPrinter = async (): Promise<void> => {
    try {
      if (targetAddress) {
        await BluetoothManager.disconnect(targetAddress);
      }
      setTargetAddress(null);
      setPrinterName('None Linked');
      Alert.alert('Disconnected', 'Printer session terminated.');
    } catch (err: unknown) {
      console.warn('Disconnect error:', err);
    }
  };

  return {
    targetAddress,
    printerName,
    isScanning,
    deviceList,
    showDeviceList,
    setShowDeviceList,
    lastError,
    clearLastError: () => setLastError(null),
    discoverAndBindPrinter,
    connectToDevice,
    disconnectPrinter,
  };
}
