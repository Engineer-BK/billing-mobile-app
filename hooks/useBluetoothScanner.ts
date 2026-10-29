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

      // Search for known POS hardware identifiers
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
          'Could not locate printer via Bluetooth.\n\n1. Ensure printer power is ON (green LED).\n2. Pair device in phone Settings > Bluetooth.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
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
      Alert.alert('Connection Failed', `Could not connect to ${name}: ${msg}`);
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
    discoverAndBindPrinter,
    connectToDevice,
    disconnectPrinter,
  };
}
