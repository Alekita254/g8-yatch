import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const flow = [
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>G8 YACHT VILLA</Text>
        <Text style={styles.title}>Android POS Pilot</Text>
        <Text style={styles.subtitle}>
          Tablet-first build focused on one reliable flow: take order, receive payment, print receipt, recover from network drop.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pilot Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.badgeOnline}>ONLINE</Text>
            <Text style={styles.badgeSync}>SYNC READY</Text>
          </View>
          <Text style={styles.cardBody}>Backend safety work is in progress: idempotent order/payment writes are now implemented.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frozen V1 Flow</Text>
          <View style={styles.flowWrap}>
            {flow.map((step) => (
              <View key={step} style={styles.flowPill}>
                <Text style={styles.flowText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Build Target</Text>
          <Text style={styles.cardBody}>Live order to payment run on a real Android tablet and real 80mm ESC/POS printer.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1a1f',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  kicker: {
    color: '#f0c676',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d5e2e8',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#132a31',
    borderWidth: 1,
    borderColor: '#1f444f',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    color: '#f6f8fa',
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    color: '#d3e0e6',
    fontSize: 14,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeOnline: {
    backgroundColor: '#0d6b67',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeSync: {
    backgroundColor: '#7a5a22',
    color: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  flowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flowPill: {
    backgroundColor: '#0d6b67',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flowText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
