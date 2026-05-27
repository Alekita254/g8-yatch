import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function TaxesDiscountsSetupPage() {
  const location = useLocation();

  if (location.pathname === '/taxes-discounts') {
    return <Navigate to="/taxes-discounts/configurations" replace />;
  }

  return <Outlet />;
}
