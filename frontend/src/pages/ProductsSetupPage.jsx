import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProductsSetupPage() {
  const location = useLocation();

  if (location.pathname === '/products') {
    return <Navigate to="/products/categories" replace />;
  }

  return <Outlet />;
}
