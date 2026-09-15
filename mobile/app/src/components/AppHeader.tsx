import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Shadows, Spacing, Typography } from '../theme/tokens';

export interface AppHeaderProps {
  title: string;
  subtitle: string;
  brandLabel?: string;
}

export function AppHeader({ title, subtitle, brandLabel = 'G8 YACHT VILLA' }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandChip}>
        <Text style={styles.brandLabel}>{brandLabel}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  brandChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brandHighlight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  brandLabel: {
    color: Colors.brandText,
    fontSize: Typography.caption,
    fontWeight: Typography.weightBold,
    letterSpacing: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.h1,
    fontWeight: Typography.weightExtraBold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.bodyLineHeight,
  },
});
