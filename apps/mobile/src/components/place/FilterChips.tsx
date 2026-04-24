import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '../../constants/theme';

interface Chip { label: string; value: string; }

interface Props {
  chips: Chip[];
  active: string | null;
  onSelect: (value: string | null) => void;
}

export default function FilterChips({ chips, active, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map(chip => {
        const isActive = active === chip.value;
        return (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(isActive ? null : chip.value)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, paddingHorizontal: 4 },
  chip: {
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  chipActive: { backgroundColor: Colors.lime },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.dark,
  },
  labelActive: { color: Colors.dark },
});
