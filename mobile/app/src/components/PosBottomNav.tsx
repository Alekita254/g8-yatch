 import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';
import { Radius, Shadows, Spacing, Typography } from '../theme/tokens';

interface PosBottomNavProps {
  palette: AppPalette;
  workspace: 'home' | 'admin';
  onMenuPress: () => void;
  onHomePress?: () => void;
}

export function PosBottomNav({
  palette,
  workspace,
  onMenuPress,
  onHomePress,
}: PosBottomNavProps) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const homeItems = [
    { key: 'home', icon: 'home' as const, label: 'Home', onPress: onHomePress, active: true },
    { key: 'settings', icon: 'settings-outline' as const, label: 'Settings', active: false },
    {
      key: 'notifications',
      icon: 'notifications-outline' as const,
      label: 'Notifications',
      active: false,
    },
    { key: 'more', icon: 'menu' as const, label: 'More', onPress: onMenuPress, active: false },
  ];

  const adminItems = [
    { key: 'home', icon: 'home' as const, label: 'Home', onPress: onHomePress, active: false },
    { key: 'users', icon: 'people-outline' as const, label: 'Users', active: false },
    { key: 'products', icon: 'cube-outline' as const, label: 'Products', active: false },
    { key: 'rooms', icon: 'bed-outline' as const, label: 'Rooms', active: false },
    { key: 'inventory', icon: 'layers-outline' as const, label: 'Inventory', active: false },
    { key: 'more', icon: 'menu' as const, label: 'More', onPress: onMenuPress, active: false },
  ];

  const items = workspace === 'home' ? homeItems : adminItems;

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable key={item.key} style={styles.bottomNavItem} onPress={item.onPress}>
          <Ionicons
            name={item.icon}
            size={workspace === 'admin' ? 16 : 18}
            color={item.active ? palette.brand : palette.textMuted}
          />
          <Text style={item.active ? styles.bottomNavTextActive : styles.bottomNavText}>
            {item.label}
          </Text>
        </Pressable>
      ))}
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
      fontSize: 10,
      fontWeight: Typography.weightMedium,
      textAlign: 'center',
    },
    bottomNavTextActive: {
      color: palette.brand,
      fontSize: 10,
      fontWeight: Typography.weightBold,
      textAlign: 'center',
    },
  });
}
