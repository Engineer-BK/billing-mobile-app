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
import { Colors } from '../constants/theme';

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
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  title: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  mac: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
});
