import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Shadows, Spacing, Typography } from '../theme/tokens';

export interface AppHeaderProps {
  title: string;
  subtitle: string;
  brandLabel?: string;
  rightLabel?: string;
}

export function AppHeader({
  title,
  subtitle,
  brandLabel = 'G8 YACHT VILLA',
  rightLabel = 'Cashier',
}: AppHeaderProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.topRow}>
        <View style={styles.brandChip}>
          <Text style={styles.brandLabel}>{brandLabel}</Text>
        </View>
        <View style={styles.rightChip}>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: '#0B5347',
    borderBottomWidth: 1,
    borderBottomColor: '#1A7A67',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  rightChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#156A5A',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  brandLabel: {
    color: Colors.brandText,
    fontSize: Typography.caption,
    fontWeight: Typography.weightBold,
    letterSpacing: 0.8,
  },
  rightLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.caption,
    fontWeight: Typography.weightSemiBold,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: Typography.weightBold,
  },
  subtitle: {
    color: '#D6EFE6',
    fontSize: 13,
    lineHeight: 18,
  },
});
