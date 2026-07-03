import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { PlaceStatus } from '../../types';

interface Props {
  status: PlaceStatus;
  label?: string;
  active?: boolean;
}

export default function CustomMarker({ label, active }: Props) {
  // Hack for Android react-native-maps: append spaces so the native bounds calculation 
  // includes extra width to prevent the custom font from being cut off.
  const displayLabel = Platform.OS === 'android' && label ? `${label}   ` : label;

  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <View style={[styles.dot, active && styles.dotActive]} />
      {displayLabel && (
        <Text style={[styles.label, active && styles.labelActive]}>
          {displayLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2EBFD',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  pillActive: {
    backgroundColor: '#7E3BED',
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7E3BED',
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#2C2C2C',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
