import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from './AuthHomeScreen.styles';

interface AuthHomeScreenProps {
  isAuthenticating: boolean;
  errorMessage: string | null;
  onSignIn: () => Promise<void>;
  onSignUp: () => Promise<void>;
}

export function AuthHomeScreen({
  isAuthenticating,
  errorMessage,
  onSignIn,
  onSignUp,
}: AuthHomeScreenProps) {
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: statusBarOffset }]}>
      <NativeStatusBar barStyle="dark-content" translucent={false} backgroundColor="#EEF4F0" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <View style={styles.brandRing} />
            </View>
            <View>
              <Text style={styles.brandName}>Oval</Text>
              <Text style={styles.brandSubline}>Where Hospitality Begins.</Text>
            </View>
          </View>

          <Text style={styles.headline}>Run your business from one calm workspace.</Text>
          <Text style={styles.body}>Track sales, stock, and grow from one place.</Text>
        </View>

        <View style={styles.imageShowcase}>
          <View style={styles.showcaseGlowLarge} />
          <View style={styles.showcaseGlowSmall} />
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderTitle}>Welcome visuals</Text>
            <Text style={styles.imagePlaceholderBody}>
              This space is ready for the image stack you want to add below.
            </Text>
          </View>
        </View>

        <View style={styles.ctaGroup}>
          <PrimaryButton
            label={isAuthenticating ? 'Opening Oval...' : 'Get Started'}
            onPress={onSignUp}
            disabled={isAuthenticating}
            variant="primary"
          />
          <PrimaryButton
            label={isAuthenticating ? 'Please wait...' : 'I already have an account'}
            onPress={onSignIn}
            disabled={isAuthenticating}
            variant="outline"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
