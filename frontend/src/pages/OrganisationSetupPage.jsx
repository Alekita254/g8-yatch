import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function OrganisationSetupPage() {
  const location = useLocation();

  if (location.pathname === '/organisation') {
    return <Navigate to="/organisation/organizations" replace />;
  }

  return <Outlet />;
}
