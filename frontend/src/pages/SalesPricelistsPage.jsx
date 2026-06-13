import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Eye, Loader2, Plus, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import PricelistFormModal from '../components/PricelistFormModal';
import PricelistItemFormModal from '../components/PricelistItemFormModal';

const emptySalesPricelist = {
  name: '',
  code: '',
  description: '',
  service_point: '',
  service_points: [],
  service_point_kind: '',
  is_active: true,
};

const emptyPriceItem = {
  product: '',
  price: '',
  currency: 'KES',
};

export default function SalesPricelistsPage() {
  const [pricelists, setPricelists] = useState([]);
  const [products, setProducts] = useState([]);
  const [servicePoints, setServicePoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [form, setForm] = useState(emptySalesPricelist);
  const [priceForm, setPriceForm] = useState(emptyPriceItem);
  const [editingPricelist, setEditingPricelist] = useState(null);
  const [pricePricelist, setPricePricelist] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchPricelists = async () => {
      try {
        const [pricelistsResponse, productsResponse, servicePointsResponse] = await Promise.all([
          api.get('/api/products/sales-pricelists/', { params: { page, page_size: pageSize } }),
          api.get('/api/products/items/', { params: { page_size: 100 } }),
          api.get('/api/users/service-points/', { params: { page_size: 100 } }),
        ]);
        setPricelists(Array.isArray(pricelistsResponse.data.results) ? pricelistsResponse.data.results : []);
        setPagination(paginationFromResponse(pricelistsResponse.data, page, pageSize));
        setProducts(Array.isArray(productsResponse.data.results) ? productsResponse.data.results : []);
        setServicePoints(Array.isArray(servicePointsResponse.data.results) ? servicePointsResponse.data.results.filter((point) => point.is_active) : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load sales pricelists');
      } finally {
        setLoading(false);
      }
    };
    fetchPricelists();
  }, [page, pageSize]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updatePriceForm = (field, value) => setPriceForm((current) => ({ ...current, [field]: value }));
  const visiblePricelists = pricelists.filter((pricelist) => {
    const servicePointText = pricelist.service_point_names?.length
      ? pricelist.service_point_names.join(' ')
      : pricelist.service_point_name || pricelist.service_point_kind || 'All service points';
    const haystack = [
      pricelist.name,
      pricelist.code,
      pricelist.description,
      servicePointText,
      ...(pricelist.items || []).map((item) => `${item.product_name} ${item.product_sku} ${item.price}`),
    ].join(' ').toLowerCase();

    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const openCreateModal = () => {
    setEditingPricelist(null);
    setForm(emptySalesPricelist);
    setShowAddModal(true);
  };

  const openEditModal = (pricelist) => {
    setEditingPricelist(pricelist);
    setForm({
      ...pricelist,
      description: pricelist.description || '',
      service_point: pricelist.service_point || '',
      service_points: pricelist.service_points || (pricelist.service_point ? [pricelist.service_point] : []),
      service_point_kind: pricelist.service_point_kind || '',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPricelist(null);
    setForm(emptySalesPricelist);
  };

  const openPriceModal = (pricelist) => {
    setPricePricelist(pricelist);
    setPriceForm(emptyPriceItem);
    setShowPriceModal(true);
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setPricePricelist(null);
    setPriceForm(emptyPriceItem);
  };

  const createPricelist = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        service_point: form.service_points[0] || null,
        service_point_kind: '',
      };
      const response = editingPricelist
        ? await api.patch(`/api/products/sales-pricelists/${editingPricelist.id}/`, payload)
        : await api.post('/api/products/sales-pricelists/', payload);
      setPricelists((current) => (
        editingPricelist
          ? current.map((pricelist) => (pricelist.id === response.data.id ? response.data : pricelist))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingPricelist ? 'Sales pricelist updated' : 'Sales pricelist created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save sales pricelist');
    } finally {
      setSaving(false);
    }
  };

  const addPriceItem = async (event) => {
    event.preventDefault();
    if (!pricePricelist) return;

    try {
      setSaving(true);
      const items = [
        ...(pricePricelist.items || []).filter((item) => String(item.product) !== String(priceForm.product)),
        priceForm,
      ];
      const response = await api.patch(`/api/products/sales-pricelists/${pricePricelist.id}/`, { items });
      setPricelists((current) => current.map((pricelist) => (pricelist.id === response.data.id ? response.data : pricelist)));
      closePriceModal();
      toast.success('Price added to sales pricelist');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add price');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  const columns = [
    {
      key: 'pricelist',
      header: 'Pricelist',
      render: (pricelist) => (
        <>
          <p className="font-black text-app-text">{pricelist.name}</p>
          <p className="mt-1 text-xs font-bold uppercase text-brand-500">{pricelist.code}</p>
          <p className="mt-2 max-w-sm text-xs leading-5 text-app-muted">{pricelist.description || 'No description.'}</p>
        </>
      ),
    },
    {
      key: 'service_points',
      header: 'Service Points',
      render: (pricelist) => {
        const servicePointLabel = pricelist.service_point_names?.length
          ? pricelist.service_point_names.join(', ')
          : pricelist.service_point_name || pricelist.service_point_kind || 'All service points';

        return (
          <span className="inline-flex max-w-xs rounded-md bg-app-elevated px-2 py-1 text-xs font-black uppercase text-app-muted">
            {servicePointLabel}
          </span>
        );
      },
    },
    {
      key: 'prices',
      header: 'Products',
      render: (pricelist) => (
        <span className="font-bold text-app-text">
          {(pricelist.items || []).length} {(pricelist.items || []).length === 1 ? 'product' : 'products'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pricelist) => (
        <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${pricelist.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
          {pricelist.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (pricelist) => (
        <div className="flex justify-end gap-2">
          <Link
            to={`/products/sales-pricelists/${pricelist.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase text-app-text transition hover:border-brand-500 hover:text-brand-500"
          >
            <Eye className="h-4 w-4" />
            Details
          </Link>
          <button
            type="button"
            onClick={() => openPriceModal(pricelist)}
            className="inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase text-app-text transition hover:border-brand-500 hover:text-brand-500"
          >
            <Plus className="h-4 w-4" />
            Price
          </button>
          <button
            type="button"
            onClick={() => openEditModal(pricelist)}
            className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-brand-500"
            title="Edit pricelist"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Tags className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Sales Pricelists</h2>
            <p className="text-sm text-app-muted">Contextual selling prices by service point, time, and promotion.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Pricelist
        </button>
      </div>

      <DataTable
        rows={visiblePricelists}
        columns={columns}
        getRowKey={(pricelist) => pricelist.id}
        title={`${visiblePricelists.length} pricelists`}
        description="Search by pricelist, service point, product, or price."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search pricelists"
        emptyMessage="No sales pricelists match your search."
        minWidth="960px"
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

      <PricelistFormModal
        isOpen={showAddModal}
        mode="sales"
        form={form}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={createPricelist}
        isSaving={saving}
        isEditing={Boolean(editingPricelist)}
        servicePoints={servicePoints}
      />

      <PricelistItemFormModal
        isOpen={showPriceModal}
        mode="sales"
        form={priceForm}
        products={products}
        onChange={updatePriceForm}
        onClose={closePriceModal}
        onSubmit={addPriceItem}
        isSaving={saving}
      />
    </div>
  );
}
