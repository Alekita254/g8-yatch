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
      gap: Spacing.lg,
    },
    rolesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    roleChip: {
      backgroundColor: palette.surfaceMuted,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    roleChipText: {
      color: palette.chipText,
      fontSize: Typography.caption,
      fontWeight: Typography.weightBold,
    },
    workspaceGridWrap: {
      gap: Spacing.sm,
    },
    workspaceRowTwo: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    workspaceRowThree: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    workspaceCardTwo: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      minHeight: 150,
      gap: Spacing.sm,
      ...Shadows.soft,
    },
    workspaceCardThree: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
      minHeight: 128,
      gap: Spacing.sm,
      ...Shadows.soft,
    },
    workspaceIconWrap: {
      width: 38,
      height: 38,
      borderRadius: Radius.md,
      backgroundColor: palette.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    workspaceIconWrapCompact: {
      width: 32,
      height: 32,
      borderRadius: Radius.md,
      backgroundColor: palette.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    workspaceTitle: {
      color: palette.textPrimary,
      fontSize: 17,
      fontWeight: Typography.weightBold,
    },
    stateBanner: {
      backgroundColor: palette.surface,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      gap: Spacing.xs,
      ...Shadows.soft,
    },
    stateBadgeWrap: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    stateBadge: {
      backgroundColor: palette.brandSoft,
      color: palette.success,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.pill,
      fontSize: Typography.caption,
      fontWeight: Typography.weightBold,
    },
    stateBadgeAlt: {
      backgroundColor: palette.surfaceMuted,
      color: palette.chipText,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.pill,
      fontSize: Typography.caption,
      fontWeight: Typography.weightBold,
    },
    stateBody: {
      color: palette.textMuted,
      fontSize: Typography.label,
      lineHeight: 18,
    },
    footerActions: {
      gap: Spacing.sm,
      paddingBottom: Spacing.sm,
    },
  });
}
