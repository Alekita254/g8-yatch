import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton';
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
  const styles = useMemo(() => createStyles(palette), [palette]);

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.sidebarLayer}>
      <View style={styles.sidebarPanel}>
        <Text style={styles.sidebarTitle}>Quick Menu</Text>
        <Text style={styles.sidebarSubtitle}>The Oval</Text>

        <Pressable style={styles.sidebarItem}>
          <Ionicons name="settings-outline" size={16} color={palette.brand} />
          <Text style={styles.sidebarItemTitle}>Settings</Text>
        </Pressable>

        <Pressable style={styles.sidebarItem}>
          <Ionicons name="person-outline" size={16} color={palette.brand} />
          <Text style={styles.sidebarItemTitle}>Profile</Text>
        </Pressable>

        <PrimaryButton label="Close Menu" onPress={onClose} variant="outline" />
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
    sidebarTitle: {
      color: palette.textPrimary,
      fontSize: Typography.title,
      fontWeight: Typography.weightBold,
    },
    sidebarSubtitle: {
      color: palette.textSecondary,
      fontSize: Typography.label,
      fontWeight: Typography.weightSemiBold,
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
      color: palette.textPrimary,
      fontSize: Typography.body,
      fontWeight: Typography.weightBold,
    },
  });
}
