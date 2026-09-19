import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';
import { Radius, Spacing, Typography } from '../theme/tokens';

interface PosHomeTopSectionProps {
  palette: AppPalette;
  greetingName: string;
  onMenuPress: () => void;
}

export function PosHomeTopSection({
  palette,
  greetingName,
  onMenuPress,
}: PosHomeTopSectionProps) {
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.topSection}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <View style={styles.brandRing} />
        </View>
        <View style={styles.brandTextWrap}>
          <Text style={styles.brandName}>The Oval</Text>
          <Text style={styles.brandSubline}>Where Hospitality Begins.</Text>
        </View>
        <Pressable onPress={onMenuPress} style={styles.menuChip}>
          <Ionicons name="menu" size={18} color={palette.chipText} />
        </Pressable>
      </View>

      <Text style={styles.greetingTitle}>Welcome, {greetingName}</Text>
      <Text style={styles.greetingBody}>Choose your workspace to jump in quickly.</Text>
    </View>
  );
}

function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    topSection: {
      gap: Spacing.md,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    brandMark: {
      width: 36,
      height: 36,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.brandSoft,
    },
    brandRing: {
      width: 22,
      height: 22,
      borderRadius: Radius.pill,
      borderWidth: 3,
      borderColor: palette.brand,
    },
    brandTextWrap: {
      flex: 1,
    },
    brandName: {
      color: palette.textPrimary,
      fontSize: 34,
      lineHeight: 38,
      fontWeight: Typography.weightExtraBold,
    },
    brandSubline: {
      color: palette.textSecondary,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: Typography.weightMedium,
    },
    menuChip: {
      width: 42,
      height: 42,
      borderRadius: Radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceMuted,
      borderWidth: 1,
      borderColor: palette.border,
    },
    greetingTitle: {
      color: palette.textPrimary,
      fontSize: 27,
      lineHeight: 32,
      fontWeight: Typography.weightBold,
    },
    greetingBody: {
      color: palette.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: Typography.weightMedium,
    },
  });
}
