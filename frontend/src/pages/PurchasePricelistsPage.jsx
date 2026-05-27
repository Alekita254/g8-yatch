import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus, Truck } from 'lucide-react';

import api from '../api';
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

  useEffect(() => {
    const fetchPricelists = async () => {
      try {
        const [pricelistsResponse, productsResponse] = await Promise.all([
          api.get('/api/products/purchase-pricelists/'),
          api.get('/api/products/items/'),
        ]);
        setPricelists(Array.isArray(pricelistsResponse.data.results) ? pricelistsResponse.data.results : []);
        setProducts(Array.isArray(productsResponse.data.results) ? productsResponse.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load purchase pricelists');
      } finally {
        setLoading(false);
      }
    };
    fetchPricelists();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updatePriceForm = (field, value) => setPriceForm((current) => ({ ...current, [field]: value }));

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

      <div className="grid gap-4 lg:grid-cols-3">
        {pricelists.map((pricelist) => (
          <article key={pricelist.id} className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-app-text">{pricelist.supplier_name}</h3>
                <p className="text-xs font-bold uppercase text-brand-500">{pricelist.code}</p>
              </div>
              <button
                type="button"
                onClick={() => openEditModal(pricelist)}
                className="rounded-md p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500"
                title="Edit pricelist"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-app-muted">{pricelist.description || 'No description.'}</p>
            <button
              type="button"
              onClick={() => openPriceModal(pricelist)}
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase text-app-text transition hover:border-brand-500 hover:text-brand-500"
            >
              <Plus className="h-4 w-4" />
              Add Price
            </button>
            <div className="mt-4 space-y-2">
              {pricelist.items?.map((item) => (
                <div key={item.id} className="flex justify-between rounded-md bg-app-elevated px-3 py-2 text-sm">
                  <span className="font-bold text-app-text">{item.product_name}</span>
                  <span className="text-app-muted">{item.currency} {item.price} / {item.unit}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

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
