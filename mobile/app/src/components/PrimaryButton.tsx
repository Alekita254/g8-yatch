import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
    >
      <Text style={[styles.label, disabled ? styles.labelDisabled : undefined]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.brandHighlight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.65,
  },
  label: {
    color: Colors.brandText,
    fontSize: Typography.body,
    fontWeight: Typography.weightBold,
  },
  labelDisabled: {
    color: Colors.surfaceStrong,
  },
});
