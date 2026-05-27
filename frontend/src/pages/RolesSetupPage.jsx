import { ShieldCheck } from 'lucide-react';

import PlaceholderPage from './PlaceholderPage';

export default function RolesSetupPage() {
  return (
    <PlaceholderPage
      icon={ShieldCheck}
      title="Roles"
      description="Create operational roles, attach permissions, and map them to Keycloak realm roles."
    />
  );
}
