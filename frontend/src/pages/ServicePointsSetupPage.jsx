import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, MapPin, Plus } from 'lucide-react';

import api from '../api';
import ServicePointFormModal from '../components/ServicePointFormModal';

const emptyServicePoint = {
  name: '',
  code: '',
  kind: 'POS_TERMINAL',
  mac_address: '',
  location: '',
  description: '',
  is_active: true,
};

export default function ServicePointsSetupPage() {
  const [servicePoints, setServicePoints] = useState([]);
  const [form, setForm] = useState(emptyServicePoint);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchServicePoints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/service-points/');
      setServicePoints(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load service points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicePoints();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createServicePoint = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        mac_address: form.mac_address || null,
      };
      const response = await api.post('/api/users/service-points/', payload);
      setServicePoints((current) => [response.data, ...current]);
      setForm(emptyServicePoint);
      setShowAddModal(false);
      toast.success('Service point created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create service point');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Service Points</h2>
            <p className="text-sm text-app-muted">Register physical points where staff operate the system.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Service Point
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {servicePoints.map((point) => (
          <article key={point.id} className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-app-text">{point.name}</h3>
                <p className="text-xs font-bold uppercase text-brand-500">{point.code}</p>
              </div>
              <span className="rounded-md bg-app-elevated px-2 py-1 text-xs font-bold text-app-muted">
                {point.kind_display}
              </span>
            </div>
            <p className="mt-3 text-sm text-app-muted">{point.location || 'No location set'}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-app-muted">
              <Plus className="h-3 w-3" />
              {point.mac_address || 'No terminal MAC assigned'}
            </div>
          </article>
        ))}
      </div>

      <ServicePointFormModal
        isOpen={showAddModal}
        form={form}
        onChange={updateForm}
        onClose={() => setShowAddModal(false)}
        onSubmit={createServicePoint}
        isSaving={saving}
      />
    </div>
  );
}
