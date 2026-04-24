import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { Place } from '../../types';
import { Colors, Radius, FontSize, Spacing } from '../../constants/theme';
import StatusBadge from './StatusBadge';
import { formatDistance } from '../../utils/formatDistance';
import { timeAgo } from '../../utils/formatTime';

interface Props {
  place: Place;
  onPress: () => void;
  variant?: 'default' | 'detail';
}

export default function PlaceCard({ place, onPress, variant = 'default' }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.imageBox}>
        {place.image_urls?.[0]
          ? <Image source={{ uri: place.image_urls[0] }} style={styles.image} resizeMode="cover" />
          : <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🏪</Text>
            </View>
        }
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>

        <View style={styles.metaRow}>
          <StatusBadge status={place.status} size="sm" />
          {place.distance != null && (
            <Text style={styles.distance}>{formatDistance(place.distance)}</Text>
          )}
        </View>

        {place.last_verified_at && (
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={styles.verifiedText}>
              Verified {timeAgo(place.last_verified_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Action */}
      <View style={styles.actionBtn}>
        <Text style={styles.actionIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark,
    padding: Spacing.sm,
    paddingRight: 22,
    gap: Spacing.md,
  },
  imageBox: {
    width: 70,
    height: 72,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
  },
  imagePlaceholderText: { fontSize: 24 },
  info: { flex: 1, gap: 4 },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xxl,
    color: Colors.dark,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distance: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedIcon: { fontSize: FontSize.sm, color: Colors.purple },
  verifiedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.dark,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: { fontSize: 20, color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
});
