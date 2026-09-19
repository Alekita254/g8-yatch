import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../components/AppHeader';
import { FlowPill } from '../components/FlowPill';
import { InfoCard } from '../components/InfoCard';
import { usePilotStatus } from '../hooks/usePilotStatus';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';
import type { PilotFlowStep } from '../types/pilot';

const frozenFlow: PilotFlowStep[] = [
  'Login',
  'Service Point',
  'Products',
  'Cart',
  'Order',
  'Payment',
  'Receipt',
  'Print',
  'Sync',
];

export function PilotHomeScreen() {
  const status = usePilotStatus();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <AppHeader
          title="Android POS Pilot"
          subtitle="Tablet-first build focused on one reliable flow: take order, receive payment, print receipt, and recover from temporary network loss."
        />

        <InfoCard title="Pilot Status">
          <View style={styles.statusRow}>
            <Text style={styles.onlineBadge}>{status.isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
            <Text style={styles.syncBadge}>
              {status.isSyncReady ? 'SYNC READY' : 'SYNC BLOCKED'}
            </Text>
          </View>
          <Text style={styles.body}>{status.message}</Text>
        </InfoCard>

        <InfoCard title="Frozen V1 Flow">
          <View style={styles.flowWrap}>
            {frozenFlow.map((step) => (
              <FlowPill key={step} label={step} />
            ))}
          </View>
        </InfoCard>

        <InfoCard title="Next Build Target">
          <Text style={styles.body}>
            Live order to payment run on a real Android tablet and real 80mm ESC/POS printer.
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  flowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.bodyLineHeight,
  },
});
