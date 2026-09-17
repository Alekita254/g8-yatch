import { LoadingWidget } from './components/LoadingWidget';
import { useAuthSession } from './hooks/useAuthSession';
import { AuthHomeScreen } from './screens/AuthHomeScreen';
import { PosHomeScreen } from './screens/PosHomeScreen';

export default function App() {
  const auth = useAuthSession();

  if (auth.isBootstrapping) {
    return <LoadingWidget message="Checking session..." />;
  }

  if (!auth.isAuthenticated) {
    return (
      <AuthHomeScreen
        isAuthenticating={auth.isAuthenticating}
        errorMessage={auth.errorMessage}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    );
  }

  return (
    <PosHomeScreen
      firstName={auth.profile?.identity.first_name}
      roles={auth.profile?.roles ?? []}
      onSignOut={auth.signOut}
    />
  );
}
