import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';
import { Radius, Shadows, Spacing, Typography } from '../theme/tokens';

interface PosBottomNavProps {
  palette: AppPalette;
  onSettingsPress: () => void;
  onProfilePress: () => void;
}

export function PosBottomNav({ palette, onSettingsPress, onProfilePress }: PosBottomNavProps) {
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.bottomNav}>
      <Pressable style={styles.bottomNavItem} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={18} color={palette.brand} />
        <Text style={styles.bottomNavTextActive}>Settings</Text>
      </Pressable>
      <Pressable style={styles.bottomNavItem} onPress={onProfilePress}>
        <Ionicons name="person-outline" size={18} color={palette.textMuted} />
        <Text style={styles.bottomNavText}>Profile</Text>
      </Pressable>
    </View>
  );
}

function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      left: Spacing.lg,
      right: Spacing.lg,
      bottom: Spacing.md,
      backgroundColor: palette.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...Shadows.soft,
    },
    bottomNavItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    bottomNavText: {
      color: palette.textMuted,
      fontSize: Typography.caption,
      fontWeight: Typography.weightMedium,
    },
    bottomNavTextActive: {
      color: palette.brand,
      fontSize: Typography.caption,
      fontWeight: Typography.weightBold,
    },
  });
}
