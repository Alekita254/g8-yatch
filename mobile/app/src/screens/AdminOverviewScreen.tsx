import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  Text,
  View,
} from 'react-native';

import { PosBottomNav } from '../components/PosBottomNav';
import { PosWorkspaceSidebar } from '../components/PosWorkspaceSidebar';
import { getPalette } from '../theme/palette';
import { createStyles } from './AdminOverviewScreen.styles';

interface AdminOverviewScreenProps {
  onBack: () => void;
}

const metrics = [
  {
    icon: 'cash-outline',
    label: 'Daily Revenue',
    value: 'KSh 248,550',
    meta: '+12.4% vs yesterday',
    accent: '#1E8A63',
    soft: '#EAF6F1',
  },
  {
    icon: 'receipt-outline',
    label: 'Orders',
    value: '36',
    meta: '8 pending fulfillment',
    accent: '#2C6ED5',
    soft: '#EBF2FF',
  },
  {
    icon: 'pricetag-outline',
    label: 'Low Stock Alerts',
    value: '59',
    meta: '11 critical SKUs',
    accent: '#CF8A12',
    soft: '#FFF5E6',
  },
  {
    icon: 'wallet-outline',
    label: 'Profit Today',
    value: 'KSh 168,700',
    meta: '+15% margin',
    accent: '#7B5CC9',
    soft: '#F2EDFF',
  },
  {
    icon: 'people-outline',
    label: 'Active Users',
    value: '6',
    meta: '3 online right now',
    accent: '#1F7A8C',
    soft: '#E8F5F7',
  },
  {
    icon: 'card-outline',
    label: 'Payment Routes',
    value: '4',
    meta: 'All routes healthy',
    accent: '#C35D22',
    soft: '#FFF0E8',
  },
] as const;

const shortcuts = [
  {
    icon: 'people-outline',
    title: 'User Setup',
    subtitle: 'Roles and service points',
    accent: '#1E8A63',
    soft: '#EAF6F1',
  },
  {
    icon: 'cube-outline',
    title: 'Products',
    subtitle: 'Items and categories',
    accent: '#2C6ED5',
    soft: '#EBF2FF',
  },
  {
    icon: 'bed-outline',
    title: 'Rooms',
    subtitle: 'Inventory mapping',
    accent: '#7B5CC9',
    soft: '#F2EDFF',
  },
  {
    icon: 'percent-outline',
    title: 'Taxes & Discount',
    subtitle: 'Compliance setup',
    accent: '#CF8A12',
    soft: '#FFF5E6',
  },
  {
    icon: 'calculator-outline',
    title: 'Accounting',
    subtitle: 'Ledgers and journals',
    accent: '#1F7A8C',
    soft: '#E8F5F7',
  },
  {
    icon: 'card-outline',
    title: 'Payment',
    subtitle: 'Routing and methods',
    accent: '#C35D22',
    soft: '#FFF0E8',
  },
  {
    icon: 'download-outline',
    title: 'Downloads',
    subtitle: 'Installer and data dump',
    accent: '#4D7C0F',
    soft: '#EEF8DF',
  },
  {
    icon: 'layers-outline',
    title: 'Inventory',
    subtitle: 'Stock and RFP flow',
    accent: '#A444D4',
    soft: '#F7EDFF',
  },
  {
    icon: 'business-outline',
    title: 'Organisation Setup',
    subtitle: 'Branches and structure',
    accent: '#AF3B5C',
    soft: '#FFEFF3',
  },
] as const;

const featuredShortcutKeys = new Set([
  'User Setup',
  'Products',
  'Rooms',
  'Taxes & Discount',
  'Accounting',
  'Payment',
]);

export function AdminOverviewScreen({ onBack }: AdminOverviewScreenProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const palette = useMemo(() => getPalette('light'), []);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;
  const adminMenuItems = [
    { key: 'dashboard', title: 'Dashboard', icon: 'grid-outline' as const },
    ...shortcuts.map((item) => ({
      key: item.title,
      title: item.title,
      icon: item.icon,
    })),
  ];
  const featuredShortcuts = shortcuts.filter((item) => featuredShortcutKeys.has(item.title));

  return (
    <View style={[styles.safeArea, { paddingTop: statusBarOffset }]}> 
      <NativeStatusBar
        barStyle="dark-content"
        translucent={false}
        backgroundColor={palette.background}
      />
      <View style={styles.screenShell}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={18} color={palette.textPrimary} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Admin</Text>
              <Text style={styles.subtitle}>Business overview & control</Text>
            </View>
            <View style={styles.iconButton}>
              <Pressable onPress={() => setSidebarOpen(true)}>
                <Ionicons name="menu" size={18} color={palette.brand} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Core Metrics</Text>
            <View style={styles.metricsGrid}>
              {metrics.map((item) => (
                <View
                  key={item.label}
                  style={[styles.metricCard, { backgroundColor: item.soft, borderColor: item.accent }]}
                >
                  <View style={styles.metricHead}>
                    <Text style={styles.metricLabel}>{item.label}</Text>
                    <View style={[styles.metricIconWrap, { borderColor: item.accent }]}>
                      <Ionicons name={item.icon} size={14} color={item.accent} />
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={[styles.metricMeta, { color: item.accent }]}>{item.meta}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Admin Shortcuts</Text>
            <Text style={styles.sectionDescription}>
              Jump directly into each admin module to continue setup and operations.
            </Text>
            <View style={styles.shortcutGrid}>
              {featuredShortcuts.map((item) => (
                <Pressable
                  key={item.title}
                  style={[styles.shortcutCard, { backgroundColor: item.soft, borderColor: item.accent }]}
                >
                  <View style={styles.shortcutHead}>
                    <View style={[styles.shortcutIconWrap, { borderColor: item.accent }]}>
                      <Ionicons name={item.icon} size={16} color={item.accent} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                  </View>
                  <Text style={styles.shortcutTitle}>{item.title}</Text>
                  <Text style={styles.shortcutSubtitle}>{item.subtitle}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <PosBottomNav
          palette={palette}
          workspace="admin"
          onMenuPress={() => setSidebarOpen(true)}
          onHomePress={onBack}
        />
      </View>

      <PosWorkspaceSidebar
        isOpen={isSidebarOpen}
        palette={palette}
        workspace="admin"
        items={adminMenuItems}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}
