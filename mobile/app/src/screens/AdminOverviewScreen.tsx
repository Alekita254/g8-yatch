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
import { useAdminSummary } from '../hooks/useAdminSummary';
import { getPalette } from '../theme/palette';
import { createStyles } from './AdminOverviewScreen.styles';
import {
  buildAdminMetrics,
  getAdminMenuItems,
  getFeaturedShortcuts,
  metricColors,
} from './adminOverviewLogic';

interface AdminOverviewScreenProps {
  onBack: () => void;
}

export function AdminOverviewScreen({ onBack }: AdminOverviewScreenProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { summary, isLoading, loadError } = useAdminSummary();
  const palette = useMemo(() => getPalette('light'), []);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;
  const adminMenuItems = useMemo(() => getAdminMenuItems(), []);
  const featuredShortcuts = useMemo(() => getFeaturedShortcuts(), []);
  const metrics = useMemo(() => buildAdminMetrics(summary), [summary]);

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
            {isLoading ? <Text style={styles.sectionDescription}>Refreshing admin summary...</Text> : null}
            {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
            <View style={styles.metricsGrid}>
              {metrics.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: metricColors[index].soft,
                      borderColor: metricColors[index].accent,
                    },
                  ]}
                >
                  <View style={styles.metricHead}>
                    <Text style={styles.metricLabel}>{item.label}</Text>
                    <View style={[styles.metricIconWrap, { borderColor: metricColors[index].accent }]}>
                      <Ionicons name={item.icon} size={14} color={metricColors[index].accent} />
                    </View>
                  </View>
                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={[styles.metricMeta, { color: metricColors[index].accent }]}>{item.meta}</Text>
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
