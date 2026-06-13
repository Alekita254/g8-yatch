import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CalendarDays, Edit3, Loader2, MapPin, Package, Plus, Tags } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../api';
import DataTable from '../components/DataTable';
import PricelistItemFormModal from '../components/PricelistItemFormModal';

const emptyPriceItem = {
  product: '',
  price: '',
  currency: 'KES',
};

const formatDate = (value) => {
  if (!value) return 'No limit';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export default function SalesPricelistDetailPage() {
  const { pricelistId } = useParams();
  const [pricelist, setPricelist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceForm, setPriceForm] = useState(emptyPriceItem);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPricelist = async () => {
      try {
        const [pricelistResponse, productsResponse] = await Promise.all([
          api.get(`/api/products/sales-pricelists/${pricelistId}/`),
          api.get('/api/products/items/', { params: { page_size: 100 } }),
        ]);
        setPricelist(pricelistResponse.data);
        setProducts(Array.isArray(productsResponse.data.results) ? productsResponse.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load sales pricelist');
      } finally {
        setLoading(false);
      }
    };
    fetchPricelist();
  }, [pricelistId]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products],
  );

  const visibleItems = (pricelist?.items || []).filter((item) => {
    const product = productsById.get(String(item.product));
    return [
      item.product_name,
      item.product_sku,
      item.currency,
      item.price,
      product?.category_name,
      product?.product_type_display,
      product?.unit,
    ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const openPriceModal = (item = emptyPriceItem) => {
    setPriceForm({
      product: item.product || '',
      price: item.price || '',
      currency: item.currency || 'KES',
    });
    setShowPriceModal(true);
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setPriceForm(emptyPriceItem);
  };

  const updatePriceForm = (field, value) => setPriceForm((current) => ({ ...current, [field]: value }));

  const savePriceItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const items = [
        ...(pricelist.items || []).filter((item) => String(item.product) !== String(priceForm.product)),
        priceForm,
      ];
      const response = await api.patch(`/api/products/sales-pricelists/${pricelist.id}/`, { items });
      setPricelist(response.data);
      closePriceModal();
      toast.success('Sales price saved');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save sales price');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  if (!pricelist) {
    return (
      <div className="rounded-lg border border-app-border bg-app-card p-10 text-center">
        <p className="font-bold text-app-muted">Sales pricelist not found.</p>
        <Link to="/products/sales-pricelists" className="mt-4 inline-flex text-sm font-black text-brand-500">Back to sales pricelists</Link>
      </div>
    );
  }

  const servicePointLabel = pricelist.service_point_names?.length
    ? pricelist.service_point_names.join(', ')
    : pricelist.service_point_name || pricelist.service_point_kind || 'All service points';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/products/sales-pricelists" className="inline-flex items-center gap-2 text-sm font-black text-brand-500 transition hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          Back to sales pricelists
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Tags className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-app-text">{pricelist.name}</h2>
              <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${pricelist.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {pricelist.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-500">{pricelist.code}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-app-muted">{pricelist.description || 'No description has been added.'}</p>
          </div>
        </div>
        <button type="button" onClick={() => openPriceModal()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add Product Price
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <Package className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-app-muted">Priced Products</p>
          <p className="mt-1 text-2xl font-black text-app-text">{(pricelist.items || []).length}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <MapPin className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-app-muted">Service Points</p>
          <p className="mt-1 text-sm font-black leading-6 text-app-text">{servicePointLabel}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <CalendarDays className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-app-muted">Validity</p>
          <p className="mt-1 text-sm font-bold leading-6 text-app-text">{formatDate(pricelist.valid_from)} to {formatDate(pricelist.valid_to)}</p>
        </div>
      </div>

      <DataTable
        rows={visibleItems}
        columns={[
          {
            key: 'product',
            header: 'Product',
            render: (item) => (
              <>
                <p className="font-black text-app-text">{item.product_name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{item.product_sku}</p>
              </>
            ),
          },
          {
            key: 'category',
            header: 'Category',
            render: (item) => productsById.get(String(item.product))?.category_name || '-',
          },
          {
            key: 'type',
            header: 'Type',
            render: (item) => productsById.get(String(item.product))?.product_type_display || '-',
          },
          {
            key: 'price',
            header: 'Sales Price',
            render: (item) => <span className="font-black text-app-text">{item.currency} {item.price}</span>,
          },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (item) => (
              <button type="button" onClick={() => openPriceModal(item)} className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-brand-500" title="Edit sales price">
                <Edit3 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
        getRowKey={(item) => item.id}
        title={`${visibleItems.length} priced products`}
        description="Search the complete sales pricelist by product, SKU, category, type, or price."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search product prices"
        emptyMessage="No product prices match your search."
        minWidth="760px"
      />

      <PricelistItemFormModal
        isOpen={showPriceModal}
        mode="sales"
        form={priceForm}
        products={products}
        onChange={updatePriceForm}
        onClose={closePriceModal}
        onSubmit={savePriceItem}
        isSaving={saving}
      />
    </div>
  );
}
