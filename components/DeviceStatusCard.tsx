/**
 * components/DeviceStatusCard.tsx
 * 
 * Active Bluetooth Connection Dashboard.
 * Displays connection state, printer name, MAC address, profile capabilities,
 * and disconnect trigger.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { PrinterProfile } from '../types/printer';
import { Colors } from '../constants/theme';

interface DeviceStatusCardProps {
  printerName: string;
  targetAddress: string | null;
  activeConfig: PrinterProfile;
  onDisconnect: () => void;
}

export function DeviceStatusCard({
  printerName,
  targetAddress,
  activeConfig,
  onDisconnect,
}: DeviceStatusCardProps): React.JSX.Element {
  const isConnected = !!targetAddress;

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View>
          <Text style={styles.lbl}>Connected Device</Text>
          <Text style={styles.val}>{printerName}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.dotGreen : styles.dotRed,
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

      {isConnected ? (
        <TouchableOpacity
          style={styles.disconnectBtn}
          onPress={onDisconnect}
        >
          <Text style={styles.disconnectTxt}>Disconnect</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lbl: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotGreen: {
    backgroundColor: Colors.success,
  },
  dotRed: {
    backgroundColor: Colors.error,
  },
  macAddress: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  profileBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  profileBadgeTxt: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  cutterBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cutterBadgeTxt: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  disconnectBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  disconnectTxt: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '600',
  },
});
