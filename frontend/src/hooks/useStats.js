import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import api from '../api';

export default function useStats(isAuthenticated) {
  const auth = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !auth.user?.access_token) return;
    try {
      setLoading(true);
      const endpoints = {
        users: '/api/users/',
        roles: '/api/users/roles/',
        servicePoints: '/api/users/service-points/',
        products: '/api/products/items/',
        categories: '/api/products/categories/',
        salesPricelists: '/api/products/sales-pricelists/',
        purchasePricelists: '/api/products/purchase-pricelists/',
        taxConfigurations: '/api/taxes/configurations/',
        taxCategories: '/api/taxes/categories/',
        taxOffices: '/api/taxes/offices/',
        discounts: '/api/taxes/discounts/',
        organizations: '/api/organisation/organizations/',
        branches: '/api/organisation/branches/',
        paymentMethods: '/api/payments/methods/',
        bankAccounts: '/api/payments/bank-accounts/',
        paymentRoutingRules: '/api/payments/routing-rules/',
      };

      const entries = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          try {
            const response = await api.get(url);
            return [key, {
              total: response.data.total ?? response.data.results?.length ?? 0,
              results: response.data.results ?? [],
              ok: true,
            }];
          } catch (err) {
            return [key, { total: 0, results: [], ok: false, error: err }];
          }
        })
      );

      setStats(Object.fromEntries(entries));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, auth.user]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
}
