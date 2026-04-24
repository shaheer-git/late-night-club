import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Radius, FontSize } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label, onPress, variant = 'primary',
  loading, disabled, style, textStyle,
}: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? Colors.dark : Colors.lime} size="small" />
        : <Text style={[
            styles.label,
            isPrimary && styles.labelPrimary,
            isOutline && styles.labelOutline,
            textStyle,
          ]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 68,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: Colors.lime },
  outline: { borderWidth: 1, borderColor: Colors.white },
  disabled: { opacity: 0.5 },
  label: { fontSize: FontSize.lg, fontFamily: 'Inter_600SemiBold' },
  labelPrimary: { color: Colors.dark },
  labelOutline: { color: Colors.white },
});
