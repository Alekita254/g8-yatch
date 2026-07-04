import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RoomsSetupPage() {
  const location = useLocation();

  if (location.pathname === '/rooms') {
    return <Navigate to="/rooms/inventory" replace />;
  }

  return <Outlet />;
}
