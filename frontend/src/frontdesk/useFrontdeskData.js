import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import api from '../api';

export default function useFrontdeskData() {
  const [data, setData] = useState({
    partners: [],
    rooms: [],
    reservations: [],
    folios: [],
    requests: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [partners, rooms, reservations, folios, requests] = await Promise.all([
        api.get('/api/business-partners/'),
        api.get('/api/rooms/'),
        api.get('/api/reservations/'),
        api.get('/api/folios/'),
        api.get('/api/concierge/requests/'),
      ]);
      setData({
        partners: partners.data.results || [],
        rooms: rooms.data.results || [],
        reservations: reservations.data.results || [],
        folios: folios.data.results || [],
        requests: requests.data.results || [],
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
