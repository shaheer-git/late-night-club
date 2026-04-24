import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlaceStatus } from '../../types';
import { Colors, Radius, FontSize } from '../../constants/theme';

interface Props { status: PlaceStatus; size?: 'sm' | 'md'; }

const STATUS_CONFIG: Record<PlaceStatus, { label: string; color: string; bg: string }> = {
  open:    { label: 'Open Now',  color: Colors.statusOpen,    bg: 'rgba(34,197,94,0.12)' },
  closed:  { label: 'Closed',   color: Colors.statusClosed,  bg: 'rgba(239,68,68,0.12)' },
  unknown: { label: 'Unknown',  color: Colors.statusUnknown, bg: 'rgba(245,158,11,0.12)' },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, size === 'sm' && styles.sm]}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }, size === 'sm' && styles.labelSm]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: FontSize.sm },
  labelSm: { fontSize: FontSize.xs },
});
