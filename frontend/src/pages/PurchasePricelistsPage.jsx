import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus, Truck } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import PricelistFormModal from '../components/PricelistFormModal';
import PricelistItemFormModal from '../components/PricelistItemFormModal';

const emptyPurchasePricelist = {
  supplier_name: '',
  code: '',
  description: '',
  is_active: true,
};

const emptyPriceItem = {
  product: '',
  price: '',
  currency: 'KES',
  unit: 'EACH',
};

export default function PurchasePricelistsPage() {
  const [pricelists, setPricelists] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [form, setForm] = useState(emptyPurchasePricelist);
  const [priceForm, setPriceForm] = useState(emptyPriceItem);
  const [editingPricelist, setEditingPricelist] = useState(null);
  const [pricePricelist, setPricePricelist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchPricelists = async () => {
      try {
        const [pricelistsResponse, productsResponse] = await Promise.all([
          api.get('/api/products/purchase-pricelists/', { params: { page, page_size: pageSize } }),
          api.get('/api/products/items/', { params: { page_size: 100 } }),
        ]);
        setPricelists(Array.isArray(pricelistsResponse.data.results) ? pricelistsResponse.data.results : []);
        setPagination(paginationFromResponse(pricelistsResponse.data, page, pageSize));
        setProducts(Array.isArray(productsResponse.data.results) ? productsResponse.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load purchase pricelists');
      } finally {
        setLoading(false);
      }
    };
    fetchPricelists();
  }, [page, pageSize]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updatePriceForm = (field, value) => setPriceForm((current) => ({ ...current, [field]: value }));
  const visiblePricelists = pricelists.filter((pricelist) => [
    pricelist.supplier_name,
    pricelist.code,
    pricelist.description,
    ...(pricelist.items || []).map((item) => `${item.product_name} ${item.product_sku} ${item.price} ${item.unit}`),
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const openCreateModal = () => {
    setEditingPricelist(null);
    setForm(emptyPurchasePricelist);
    setShowAddModal(true);
  };

  const openEditModal = (pricelist) => {
    setEditingPricelist(pricelist);
    setForm({
      ...pricelist,
      description: pricelist.description || '',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPricelist(null);
    setForm(emptyPurchasePricelist);
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
      const response = editingPricelist
        ? await api.patch(`/api/products/purchase-pricelists/${editingPricelist.id}/`, form)
        : await api.post('/api/products/purchase-pricelists/', form);
      setPricelists((current) => (
        editingPricelist
          ? current.map((pricelist) => (pricelist.id === response.data.id ? response.data : pricelist))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingPricelist ? 'Purchase pricelist updated' : 'Purchase pricelist created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save purchase pricelist');
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
      const response = await api.patch(`/api/products/purchase-pricelists/${pricePricelist.id}/`, { items });
      setPricelists((current) => current.map((pricelist) => (pricelist.id === response.data.id ? response.data : pricelist)));
      closePriceModal();
      toast.success('Price added to purchase pricelist');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add price');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Purchase Pricelists</h2>
            <p className="text-sm text-app-muted">Supplier contract prices and procurement baselines.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Supplier Price
        </button>
      </div>

      <DataTable
        rows={visiblePricelists}
        columns={[
          {
            key: 'supplier',
            header: 'Supplier',
            render: (pricelist) => (
              <>
                <p className="font-black text-app-text">{pricelist.supplier_name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{pricelist.code}</p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-app-muted">{pricelist.description || 'No description.'}</p>
              </>
            ),
          },
          {
            key: 'prices',
            header: 'Prices',
            render: (pricelist) => {
              const pricePreview = (pricelist.items || []).slice(0, 3);
              const extraPriceCount = Math.max((pricelist.items || []).length - pricePreview.length, 0);
              if (!pricePreview.length) return <span className="text-xs font-bold text-app-muted">No prices yet</span>;
              return (
                <div className="space-y-1.5">
                  {pricePreview.map((item) => (
                    <div key={item.id} className="flex max-w-sm items-center justify-between gap-4 rounded-md bg-app-elevated px-3 py-2">
                      <span className="truncate font-bold text-app-text">{item.product_name}</span>
                      <span className="shrink-0 text-app-muted">{item.currency} {item.price} / {item.unit}</span>
                    </div>
                  ))}
                  {extraPriceCount > 0 ? <p className="text-xs font-bold text-app-muted">+{extraPriceCount} more prices</p> : null}
                </div>
              );
            },
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
        ]}
        getRowKey={(pricelist) => pricelist.id}
        title={`${visiblePricelists.length} purchase pricelists`}
        description="Search by supplier, product, SKU, price, or unit."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search purchase pricelists"
        emptyMessage="No purchase pricelists match your search."
        minWidth="920px"
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
        mode="purchase"
        form={form}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={createPricelist}
        isSaving={saving}
        isEditing={Boolean(editingPricelist)}
      />

      <PricelistItemFormModal
        isOpen={showPriceModal}
        mode="purchase"
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
