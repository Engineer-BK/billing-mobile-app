/**
 * components/DevicePickerSheet.tsx
 * 
 * Bluetooth Device Selection List.
 * Displayed when multiple Bluetooth devices are detected in the vicinity,
 * allowing the user to pick their specific POS printer.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { BluetoothDevice } from '../services/bluetoothPrinter';

interface DevicePickerSheetProps {
  visible: boolean;
  devices: BluetoothDevice[];
  onSelectDevice: (address: string, name: string) => void;
}

export function DevicePickerSheet({
  visible,
  devices,
  onSelectDevice,
}: DevicePickerSheetProps): React.JSX.Element | null {
  if (!visible || devices.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Select Your Bluetooth Printer:</Text>
      {devices.map((dev: BluetoothDevice) => (
        <TouchableOpacity
          key={dev.address}
          style={styles.item}
          onPress={() => onSelectDevice(dev.address, dev.name || dev.address)}
        >
          <Text style={styles.name}>
            {dev.name || 'Unnamed Bluetooth Device'}
          </Text>
          <Text style={styles.mac}>{dev.address}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#20202E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  title: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C3E',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mac: {
    color: '#8A8A9A',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
