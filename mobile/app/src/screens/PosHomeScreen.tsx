import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StatusBar as NativeStatusBar, Text, View } from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { InfoCard } from '../components/InfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { usePilotStatus } from '../hooks/usePilotStatus';
import { styles } from './PosHomeScreen.styles';

interface PosHomeScreenProps {
  onSignOut?: () => Promise<void>;
}

export function PosHomeScreen({ onSignOut }: PosHomeScreenProps) {
  const status = usePilotStatus();
  const currentState = status.isOnline ? 'Live service session' : 'Offline recovery mode';
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;

  return (
    <View style={[styles.safeArea, { paddingTop: statusBarOffset }]}>
      <StatusBar style="light" translucent={false} backgroundColor="#0B5347" />
      <AppHeader
        brandLabel="OVAL"
        rightLabel="Tablet POS"
        title="Oval POS"
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
          <PrimaryButton label="Sign Out" onPress={onSignOut} />
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
