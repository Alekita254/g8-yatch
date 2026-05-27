import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import api from '../api';

export default function useSalesData() {
  const [data, setData] = useState({
    orders: [],
    invoices: [],
    payments: [],
    paymentRuns: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orders, invoices, payments, paymentRuns] = await Promise.all([
        api.get('/api/sales/orders/'),
        api.get('/api/sales/invoices/'),
        api.get('/api/sales/payments/'),
        api.get('/api/sales/payment-runs/'),
      ]);
      setData({
        orders: orders.data.results || [],
        invoices: invoices.data.results || [],
        payments: payments.data.results || [],
        paymentRuns: paymentRuns.data.results || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refresh: fetchData };
}
