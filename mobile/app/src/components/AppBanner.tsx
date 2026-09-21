import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BannerTone = 'info' | 'success' | 'error';

interface AppBannerProps {
  visible: boolean;
  tone: BannerTone;
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function AppBanner({
  visible,
  tone,
  message,
  onDismiss,
  durationMs = 3200,
}: AppBannerProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onDismiss, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Pressable
        onPress={onDismiss}
        style={[styles.banner, { marginTop: insets.top + 8 }, toneStyles[tone]]}
      >
        <Text style={styles.message}>{message}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 60,
    paddingHorizontal: 16,
  },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  message: {
    color: '#10212E',
    fontSize: 14,
    fontWeight: '700',
  },
});

const toneStyles = StyleSheet.create({
  info: {
    backgroundColor: '#E8F4FF',
    borderColor: '#8DB7E8',
  },
  success: {
    backgroundColor: '#E8F8EF',
    borderColor: '#7DC29A',
  },
  error: {
    backgroundColor: '#FFEDEC',
    borderColor: '#E59A95',
  },
});
