import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppPalette } from '../theme/palette';
import { Radius, Spacing, Typography } from '../theme/tokens';

interface PosWorkspaceSidebarProps {
  isOpen: boolean;
  palette: AppPalette;
  onClose: () => void;
}

export function PosWorkspaceSidebar({
  isOpen,
  palette,
  onClose,
}: PosWorkspaceSidebarProps) {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(palette), [palette]);

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.sidebarLayer}>
      <View style={[styles.sidebarPanel, { paddingTop: Spacing.lg + insets.top }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.sidebarTitle}>Quick Menu</Text>
          </View>
          <Pressable style={styles.closeChip} onPress={onClose}>
            <Ionicons name="close" size={16} color={palette.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.sectionRule} />

        <Pressable style={styles.sidebarItem}>
          <Ionicons name="settings-outline" size={16} color={palette.brand} />
          <Text style={styles.sidebarItemTitle}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
        </Pressable>

        <Pressable style={styles.sidebarItem}>
          <Ionicons name="person-outline" size={16} color={palette.brand} />
          <Text style={styles.sidebarItemTitle}>Profile</Text>
          <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
        </Pressable>
      </View>
      <Pressable style={styles.sidebarBackdrop} onPress={onClose} />
    </View>
  );
}

function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    sidebarLayer: {
      ...StyleSheet.absoluteFill,
      flexDirection: 'row',
      zIndex: 30,
    },
    sidebarBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(4, 10, 16, 0.45)',
    },
    sidebarPanel: {
      width: '74%',
      maxWidth: 320,
      backgroundColor: palette.surface,
      borderRightWidth: 1,
      borderRightColor: palette.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.lg,
      gap: Spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    closeChip: {
      width: 30,
      height: 30,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceMuted,
      borderWidth: 1,
      borderColor: palette.border,
    },
    sidebarTitle: {
      color: palette.textPrimary,
      fontSize: Typography.title,
      fontWeight: Typography.weightBold,
    },
    sectionRule: {
      height: 1,
      backgroundColor: palette.border,
      marginBottom: Spacing.xs,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.surfaceMuted,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
      gap: Spacing.xs,
    },
    sidebarItemTitle: {
      flex: 1,
      color: palette.textPrimary,
      fontSize: Typography.body,
      fontWeight: Typography.weightBold,
    },
  });
}
