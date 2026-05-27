import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PaymentSetupPage() {
  const location = useLocation();

  if (location.pathname === '/payments') {
    return <Navigate to="/payments/methods" replace />;
  }

  return <Outlet />;
}
