import { StyleSheet } from 'react-native';

import type { AppPalette } from '../theme/palette';
import { Radius, Shadows, Spacing, Typography } from '../theme/tokens';

export function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    screenShell: {
      flex: 1,
    },
    container: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: 110,
      gap: Spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
    },
    headerTextWrap: {
      flex: 1,
    },
    title: {
      color: palette.textPrimary,
      fontSize: 30,
      lineHeight: 34,
      fontWeight: Typography.weightExtraBold,
    },
    subtitle: {
      color: palette.textSecondary,
      fontSize: Typography.body,
      fontWeight: Typography.weightMedium,
    },
    sectionCard: {
      backgroundColor: palette.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      padding: Spacing.md,
      gap: Spacing.sm,
      ...Shadows.soft,
    },
    sectionHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      color: palette.textPrimary,
      fontSize: Typography.body,
      fontWeight: Typography.weightBold,
    },
    sectionDescription: {
      color: palette.textSecondary,
      fontSize: Typography.body,
      lineHeight: Typography.bodyLineHeight,
      fontWeight: Typography.weightMedium,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    metricCard: {
      width: '48%',
      borderRadius: Radius.md,
      borderWidth: 1,
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    metricHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.xs,
    },
    metricLabel: {
      flex: 1,
      color: palette.textSecondary,
      fontSize: Typography.label,
      fontWeight: Typography.weightBold,
    },
    metricIconWrap: {
      width: 24,
      height: 24,
      borderRadius: Radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: palette.background,
    },
    metricValue: {
      color: palette.textPrimary,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: Typography.weightExtraBold,
    },
    metricMeta: {
      fontSize: Typography.label,
      fontWeight: Typography.weightBold,
    },
    shortcutGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: Spacing.sm,
    },
    shortcutCard: {
      width: '31.5%',
      flexBasis: '31.5%',
      borderRadius: Radius.md,
      borderWidth: 1,
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    shortcutHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    shortcutIconWrap: {
      width: 32,
      height: 32,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
      borderWidth: 1,
    },
    shortcutTitle: {
      color: palette.textPrimary,
      fontSize: Typography.label,
      fontWeight: Typography.weightBold,
    },
    shortcutSubtitle: {
      color: palette.textSecondary,
      fontSize: Typography.caption,
      fontWeight: Typography.weightMedium,
      lineHeight: 14,
    },
  });
}
