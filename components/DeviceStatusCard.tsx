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
import { useTheme } from '../hooks/useTheme';

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
  const { colors } = useTheme();
  const isConnected = !!targetAddress;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.statusRow}>
        <View>
          <Text style={[styles.lbl, { color: colors.textSecondary }]}>
            Connected Device
          </Text>
          <Text style={[styles.val, { color: colors.textPrimary }]}>
            {printerName}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isConnected ? colors.success : colors.error,
            },
          ]}
        />
      </View>

      {targetAddress ? (
        <Text style={[styles.macAddress, { color: colors.accent }]}>
          MAC: {targetAddress}
        </Text>
      ) : null}

      <View style={styles.profileBadgeRow}>
        <View
          style={[
            styles.profileBadge,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.profileBadgeTxt, { color: colors.accent }]}>
            {activeConfig.badge}
          </Text>
        </View>

        {activeConfig.hasAutoCutter ? (
          <View
            style={[
              styles.cutterBadge,
              {
                backgroundColor: colors.surfaceLight,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.cutterBadgeTxt, { color: colors.primary }]}>
              ✂️ Auto-Cutter
            </Text>
          </View>
        ) : null}
      </View>

      {isConnected ? (
        <TouchableOpacity
          style={[
            styles.disconnectBtn,
            {
              backgroundColor: colors.surfaceLight,
              borderColor: colors.error,
            },
          ]}
          onPress={onDisconnect}
        >
          <Text style={[styles.disconnectTxt, { color: colors.error }]}>
            Disconnect
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lbl: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  val: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macAddress: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  profileBadgeTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  cutterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  cutterBadgeTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
  disconnectBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  disconnectTxt: {
    fontSize: 11,
    fontWeight: '600',
  },
});
