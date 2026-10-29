/**
 * components/ReceiptPreview/DashedDivider.tsx
 * 
 * Reusable Edge-to-Edge Clipped Dashed Divider.
 * Uses `ellipsizeMode="clip"` to automatically span 100% of the paper width
 * without ever wrapping or leaving white margin on the right.
 */

import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

export function DashedDivider(): React.JSX.Element {
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

const styles = StyleSheet.create({
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
});
