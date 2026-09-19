import { LoadingWidget } from './components/LoadingWidget';
import { useAuthSession } from './hooks/useAuthSession';
import { AuthHomeScreen } from './screens/AuthHomeScreen';
import { PosHomeScreen } from './screens/PosHomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const auth = useAuthSession();

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

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}
