import React from 'react';
import {
  View, TextInput, Text, StyleSheet, TextInputProps,
} from 'react-native';
import { Colors, Radius, FontSize } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  prefix?: React.ReactNode;
  error?: string;
}

export default function Input({ label, prefix, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, error && styles.rowError]}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textWhite,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  rowError: { borderColor: Colors.statusClosed },
  prefix: { justifyContent: 'center', alignItems: 'center' },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.base,
    color: Colors.dark,
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.statusClosed,
  },
});
