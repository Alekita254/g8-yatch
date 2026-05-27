import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, MapPin, Plus, Save } from 'lucide-react';

import api from '../api';

const KIND_OPTIONS = [
  ['POS_TERMINAL', 'POS Terminal'],
  ['FRONTDESK', 'Frontdesk'],
  ['BAR', 'Bar'],
  ['RESTAURANT', 'Restaurant'],
  ['WORKSHOP', 'Workshop'],
  ['MARINA', 'Marina'],
];

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
      <div className="rounded-lg border border-app-border bg-app-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-brand-500" />
          <div>
            <h2 className="text-2xl font-black text-app-text">Service Points</h2>
            <p className="text-sm text-app-muted">Register physical points where staff operate the system.</p>
          </div>
        </div>

        <form onSubmit={createServicePoint} className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              required
              placeholder="Pool Bar POS"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Code</span>
            <input
              value={form.code}
              onChange={(event) => updateForm('code', event.target.value.toLowerCase().replace(/\s+/g, '-'))}
              required
              placeholder="pool-bar-pos"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Kind</span>
            <select
              value={form.kind}
              onChange={(event) => updateForm('kind', event.target.value)}
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            >
              {KIND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Terminal MAC</span>
            <input
              value={form.mac_address}
              onChange={(event) => updateForm('mac_address', event.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-bold uppercase text-app-muted">Location</span>
            <input
              value={form.location}
              onChange={(event) => updateForm('location', event.target.value)}
              placeholder="Pool bar"
              className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm text-app-text outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <div className="flex justify-end lg:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Service Point
            </button>
          </div>
        </form>
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
    </div>
  );
}
