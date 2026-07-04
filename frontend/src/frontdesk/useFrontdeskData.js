import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import api from '../api';

async function fetchAllResults(endpoint, params = {}) {
  const pageSize = params.page_size || 100;
  let page = 1;
  const results = [];

  while (true) {
    const response = await api.get(endpoint, { params: { ...params, page, page_size: pageSize } });
    const data = response.data || {};
    results.push(...(Array.isArray(data.results) ? data.results : []));
    const totalPages = Number(data.total_pages || 1);
    if (page >= totalPages) break;
    page += 1;
  }

  return results;
}

export default function useFrontdeskData() {
  const [data, setData] = useState({
    partners: [],
    rooms: [],
    reservations: [],
    visits: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [partners, rooms, reservations, visits] = await Promise.all([
        fetchAllResults('/api/business-partners/'),
        fetchAllResults('/api/rooms/'),
        fetchAllResults('/api/reservations/'),
        fetchAllResults('/api/sales/visits/'),
      ]);
      setData({
        partners,
        rooms,
        reservations,
        visits,
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load frontdesk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refresh: fetchData };
}
