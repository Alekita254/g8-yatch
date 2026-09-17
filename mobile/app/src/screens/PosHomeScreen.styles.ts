import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  onlineBadge: {
    backgroundColor: Colors.success,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    fontSize: Typography.caption,
    fontWeight: Typography.weightBold,
  },
  syncBadge: {
    backgroundColor: Colors.warning,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    fontSize: Typography.caption,
    fontWeight: Typography.weightBold,
  },
  sectionLead: {
    color: Colors.brandSoft,
    fontSize: Typography.label,
    fontWeight: Typography.weightSemiBold,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionTile: {
    width: '48%',
    backgroundColor: Colors.surfaceStrong,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.weightBold,
  },
  actionBody: {
    color: Colors.textSecondary,
    fontSize: Typography.label,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceStrong,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  metricValue: {
    color: Colors.brandHighlight,
    fontSize: 24,
    fontWeight: Typography.weightExtraBold,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: Typography.weightMedium,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.bodyLineHeight,
  },
});
