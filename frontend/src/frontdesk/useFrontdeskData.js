import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import api from '../api';

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
        api.get('/api/business-partners/', { params: { page_size: 100 } }),
        api.get('/api/rooms/', { params: { page_size: 100 } }),
        api.get('/api/reservations/', { params: { page_size: 100 } }),
        api.get('/api/sales/visits/', { params: { page_size: 100 } }),
      ]);
      setData({
        partners: partners.data.results || [],
        rooms: rooms.data.results || [],
        reservations: reservations.data.results || [],
        visits: visits.data.results || [],
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
