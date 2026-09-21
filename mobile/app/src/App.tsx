import { useEffect, useRef, useState } from 'react';

import { AppBanner, type BannerTone } from './components/AppBanner';
import { LoadingWidget } from './components/LoadingWidget';
import { useAuthSession } from './hooks/useAuthSession';
import { AuthHomeScreen } from './screens/AuthHomeScreen';
import { PosHomeScreen } from './screens/PosHomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface BannerState {
  visible: boolean;
  tone: BannerTone;
  message: string;
}

export default function App() {
  const auth = useAuthSession();
  const [banner, setBanner] = useState<BannerState>({
    visible: false,
    tone: 'info',
    message: '',
  });
  const hadAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (auth.isAuthenticating) {
      setBanner({
        visible: true,
        tone: 'info',
        message: 'Opening secure sign-in...',
      });
    }
  }, [auth.isAuthenticating]);

  useEffect(() => {
    if (auth.errorMessage) {
      setBanner({
        visible: true,
        tone: 'error',
        message: auth.errorMessage,
      });
    }
  }, [auth.errorMessage]);

  useEffect(() => {
    if (auth.isAuthenticated && !hadAuthenticatedRef.current) {
      hadAuthenticatedRef.current = true;
      setBanner({
        visible: true,
        tone: 'success',
        message: 'Signed in successfully.',
      });
    }

    if (!auth.isAuthenticated) {
      hadAuthenticatedRef.current = false;
    }
  }, [auth.isAuthenticated]);

  let content;

  if (auth.isBootstrapping) {
    content = <LoadingWidget message="Checking session..." />;
  } else if (!auth.isAuthenticated) {
    content = (
      <AuthHomeScreen
        isAuthenticating={auth.isAuthenticating}
        errorMessage={auth.errorMessage}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    );
  } else {
    content = (
      <PosHomeScreen
        firstName={auth.profile?.identity.first_name}
        roles={auth.profile?.roles ?? []}
        onSignOut={auth.signOut}
      />
    );
  }

  return (
    <SafeAreaProvider>
      {content}
      <AppBanner
        visible={banner.visible}
        tone={banner.tone}
        message={banner.message}
        onDismiss={() => setBanner((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaProvider>
  );
}
