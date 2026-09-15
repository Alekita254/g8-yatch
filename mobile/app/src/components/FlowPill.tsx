import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '../theme/tokens';
import type { PilotFlowStep } from '../types/pilot';

interface FlowPillProps {
  label: PilotFlowStep;
}

export function FlowPill({ label }: FlowPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.label,
    fontWeight: Typography.weightBold,
  },
});
