import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlaceStatus } from '../../types';

interface Props {
  status: PlaceStatus;
  label?: string;
  active?: boolean;
}

export default function CustomMarker({ label, active }: Props) {
  // Figma: default = #F2EBFD bg, active = #7E3BED bg
  // pill: row, alignItems center, gap 2, padding 6, borderRadius full
  // shadow: 0px 4px 12px rgba(0,0,0,0.4)
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      {/* Location pin dot */}
      <View style={[styles.dot, active && styles.dotActive]} />
      {label && (
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {label}
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
    gap: 2,
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
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#2C2C2C',
    maxWidth: 120,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
