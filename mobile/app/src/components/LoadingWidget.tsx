import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '../theme/tokens';

export interface LoadingWidgetProps {
  message: string;
}

export function LoadingWidget({ message }: LoadingWidgetProps) {
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator size="large" color={Colors.brandHighlight} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontWeight: Typography.weightSemiBold,
  },
});
