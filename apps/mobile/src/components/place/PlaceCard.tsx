import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../../types';
import { timeAgo } from '../../utils/formatTime';
import { formatDistance } from '../../utils/formatDistance';

interface Props {
  place: Place;
  onPress: () => void;
  variant?: 'default' | 'detail';
}

export default function PlaceCard({ place, onPress, variant = 'default' }: Props) {
  const isOpen = place.status === 'open';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail — 70×72, borderRadius 18 */}
      <View style={styles.imageBox}>
        {place.image_urls?.[0] ? (
          <Image source={{ uri: place.image_urls[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="storefront-outline" size={24} color="rgba(44,44,44,0.3)" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Shop name: Inter SemiBold 20px, #2C2C2C */}
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>

        {/* Status + distance row */}
        <View style={styles.metaRow}>
          {/* Round solid icon + status text */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isOpen ? '#22C55E' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: isOpen ? '#22C55E' : '#EF4444' }]}>
              {isOpen ? 'Now Open' : 'Closed'}
            </Text>
            {place.distance != null && (
              <Text style={styles.distanceText}>
                {' · '}{formatDistance(place.distance)}
              </Text>
            )}
          </View>
        </View>

        {/* Verified row */}
        {place.last_verified_at && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={12} color="#2C2C2C" />
            <Text style={styles.verifiedText}>
              Verified {timeAgo(place.last_verified_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Action button — 40×40, #C6FF34, borderRadius 14 */}
      <View style={styles.actionBtn}>
        <Ionicons name="navigate" size={18} color="#2C2C2C" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // card: white bg, borderRadius 28, border 1px #2C2C2C, padding 10 22 10 10, gap 20
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    padding: 10,
    paddingRight: 22,
    gap: 20,
  },
  // imageBox: 70×72, borderRadius 18
  imageBox: {
    width: 70,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44,44,44,0.05)',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  // name: Inter SemiBold 20px, #2C2C2C
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // status text: Inter Medium 12px
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  distanceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(44,44,44,0.5)',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  verifiedText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#2C2C2C',
  },
  // action: 40×40, #C6FF34, borderRadius 14
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#C6FF34',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
