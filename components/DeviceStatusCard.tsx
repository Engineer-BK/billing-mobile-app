/**
 * components/DeviceStatusCard.tsx
 * 
 * Active Bluetooth Connection Dashboard.
 * Displays connection state, printer name, MAC address, profile capabilities,
 * and disconnect trigger.
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PrinterProfile } from '../types/printer';

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
  lbl: {
    color: '#8A8A9A',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    color: '#FFFFFF',
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
    backgroundColor: '#34C759',
  },
  dotRed: {
    backgroundColor: '#FF3B30',
  },
  macAddress: {
    color: '#00D2FF',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
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
});
