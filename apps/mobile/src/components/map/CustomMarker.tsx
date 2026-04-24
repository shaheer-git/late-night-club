import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlaceStatus } from '../../types';
import { Colors, Radius } from '../../constants/theme';

interface Props { status: PlaceStatus; label?: string; active?: boolean; }

const STATUS_COLOR: Record<PlaceStatus, string> = {
  open: Colors.statusOpen,
  closed: Colors.statusClosed,
  unknown: Colors.statusUnknown,
};

export default function CustomMarker({ status, label, active }: Props) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.wrapper, active && styles.wrapperActive]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {label && <Text style={styles.label} numberOfLines={1}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.purpleLight,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  wrapperActive: {
    backgroundColor: Colors.purple,
    paddingHorizontal: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.dark,
    maxWidth: 100,
  },
});
