import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

type ButtonVariant = 'accent' | 'primary' | 'outline';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
}

function containerVariantStyle(variant: ButtonVariant) {
  if (variant === 'primary') {
    return styles.buttonPrimary;
  }
  if (variant === 'outline') {
    return styles.buttonOutline;
  }
  return styles.buttonAccent;
}

function labelVariantStyle(variant: ButtonVariant) {
  if (variant === 'outline') {
    return styles.labelOutline;
  }
  if (variant === 'primary') {
    return styles.labelPrimary;
  }
  return styles.labelAccent;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'accent',
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        containerVariantStyle(variant),
        pressed ? styles.buttonPressed : undefined,
        disabled ? styles.buttonDisabled : undefined,
      ]}
    >
      <Text
        style={[
          styles.label,
          labelVariantStyle(variant),
          disabled ? styles.labelDisabled : undefined,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  buttonAccent: {
    backgroundColor: Colors.brandHighlight,
  },
  buttonPrimary: {
    backgroundColor: Colors.success,
  },
  buttonOutline: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.65,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: Typography.weightBold,
  },
  labelAccent: {
    color: Colors.brandText,
  },
  labelPrimary: {
    color: Colors.textPrimary,
  },
  labelOutline: {
    color: Colors.textPrimary,
  },
  labelDisabled: {
    color: Colors.surfaceStrong,
  },
});
