import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface Props extends TextInputProps {
  label: string;
}

export function AuthInput({ label, onBlur, onFocus, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primaryLight}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    letterSpacing: 0.4,
  },
  inputWrap: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
});
