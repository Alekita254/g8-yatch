import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, MapPin, Plus } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  const fetchServicePoints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/service-points/', { params: { page, page_size: pageSize } });
      setServicePoints(Array.isArray(response.data.results) ? response.data.results : []);
      setPagination(paginationFromResponse(response.data, page, pageSize));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load service points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicePoints();
  }, [page, pageSize]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const visibleServicePoints = servicePoints.filter((point) => [
    point.name,
    point.code,
    point.kind_display,
    point.kind,
    point.location,
    point.mac_address,
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

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

      <DataTable
        rows={visibleServicePoints}
        columns={[
          {
            key: 'name',
            header: 'Service Point',
            render: (point) => (
              <>
                <p className="font-black text-app-text">{point.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{point.code}</p>
              </>
            ),
          },
          { key: 'kind', header: 'Kind', render: (point) => point.kind_display || point.kind },
          { key: 'location', header: 'Location', render: (point) => point.location || '-' },
          { key: 'mac_address', header: 'Terminal MAC', render: (point) => point.mac_address || '-' },
          {
            key: 'status',
            header: 'Status',
            render: (point) => (
              <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${point.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {point.is_active ? 'Active' : 'Inactive'}
              </span>
            ),
          },
        ]}
        getRowKey={(point) => point.id}
        title={`${visibleServicePoints.length} service points`}
        description="Search by name, kind, location, or terminal MAC."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search service points"
        emptyMessage="No service points match your search."
        minWidth="820px"
        pagination={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          },
        }}
      />

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
