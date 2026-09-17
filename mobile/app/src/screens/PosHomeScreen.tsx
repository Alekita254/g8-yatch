import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { InfoCard } from '../components/InfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { usePilotStatus } from '../hooks/usePilotStatus';
import { Colors, Radius, Spacing, Typography } from '../theme/tokens';

export function PosHomeScreen() {
  const status = usePilotStatus();
  const currentState = status.isOnline ? 'Live service session' : 'Offline recovery mode';

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <AppHeader
        brandLabel="G8 YACHT VILLA"
        rightLabel="Tablet POS"
        title="Frontline Operations"
        subtitle="Order to payment flow with reliable receipt printing"
      />
      <ScrollView contentContainerStyle={styles.container}>
        <InfoCard title="Session Status">
          <View style={styles.statusRow}>
            <Text style={styles.onlineBadge}>{status.isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
            <Text style={styles.syncBadge}>
              {status.isSyncReady ? 'SYNC READY' : 'SYNC BLOCKED'}
            </Text>
          </View>
          <Text style={styles.sectionLead}>{currentState}</Text>
          <Text style={styles.body}>{status.message}</Text>
        </InfoCard>

        <InfoCard title="Quick Actions">
          <View style={styles.actionGrid}>
            <View style={styles.actionTile}>
              <Text style={styles.actionTitle}>New Order</Text>
              <Text style={styles.actionBody}>Start a fresh customer ticket fast.</Text>
            </View>
            <View style={styles.actionTile}>
              <Text style={styles.actionTitle}>Resume Cart</Text>
              <Text style={styles.actionBody}>Continue a held cart without losing pace.</Text>
            </View>
            <View style={styles.actionTile}>
              <Text style={styles.actionTitle}>Take Payment</Text>
              <Text style={styles.actionBody}>Receive payment and close invoice safely.</Text>
            </View>
            <View style={styles.actionTile}>
              <Text style={styles.actionTitle}>Print Receipt</Text>
              <Text style={styles.actionBody}>Send 80mm receipt to LAN or Bluetooth.</Text>
            </View>
          </View>
          <PrimaryButton label="Begin Service" />
        </InfoCard>

        <InfoCard title="Service Queue Snapshot">
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>04</Text>
              <Text style={styles.metricLabel}>Open Orders</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>02</Text>
              <Text style={styles.metricLabel}>Pending Print</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{status.isSyncReady ? '00' : '03'}</Text>
              <Text style={styles.metricLabel}>Pending Sync</Text>
            </View>
          </View>
        </InfoCard>

        <InfoCard title="Today Focus">
          <Text style={styles.body}>
            Keep the queue moving from New Order to Payment to Print, then confirm sync state before
            handoff.
          </Text>
        </InfoCard>
      </ScrollView>
    </View>
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
