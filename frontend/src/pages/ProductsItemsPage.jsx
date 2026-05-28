import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Package, Plus } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import ProductFormModal from '../components/ProductFormModal';

const packageLabels = {
  INDIVIDUAL: 'individual item',
  DOZEN: 'dozen',
  CARTON: 'carton',
  BALE: 'bale',
  BAG: 'bag',
  SACK: 'sack',
  BOX: 'box',
  CRATE: 'crate',
  BOTTLE: 'bottle',
  CAN: 'can',
  JAR: 'jar',
  PACK: 'pack',
};

const emptyProduct = {
  name: '',
  sku: '',
  product_type: 'BILLABLE',
  category: '',
  unit: 'EACH',
  package_type: 'INDIVIDUAL',
  pack_size: '1.000',
  quantity: '0.000',
  description: '',
  is_sellable: true,
  is_inventory_tracked: false,
  purchase_pricelist: '',
  purchase_price: '',
  purchase_currency: 'KES',
  sales_pricelist: '',
  sales_price: '',
  sales_currency: 'KES',
};

export default function ProductsItemsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchasePricelists, setPurchasePricelists] = useState([]);
  const [salesPricelists, setSalesPricelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, categoriesResponse, purchaseResponse, salesResponse] = await Promise.all([
          api.get('/api/products/items/', { params: { page, page_size: pageSize } }),
          api.get('/api/products/categories/', { params: { page_size: 100 } }),
          api.get('/api/products/purchase-pricelists/', { params: { page_size: 100 } }),
          api.get('/api/products/sales-pricelists/', { params: { page_size: 100 } }),
        ]);
        setProducts(Array.isArray(productsResponse.data.results) ? productsResponse.data.results : []);
        setPagination(paginationFromResponse(productsResponse.data, page, pageSize));
        setCategories(Array.isArray(categoriesResponse.data.results) ? categoriesResponse.data.results : []);
        setPurchasePricelists(Array.isArray(purchaseResponse.data.results) ? purchaseResponse.data.results : []);
        setSalesPricelists(Array.isArray(salesResponse.data.results) ? salesResponse.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, pageSize]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const visibleProducts = products.filter((product) => [
    product.name,
    product.sku,
    product.product_type_display,
    product.product_type,
    product.category_name,
    product.unit,
    product.package_type,
    product.description,
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      ...product,
      category: product.category || '',
      package_type: product.package_type || 'INDIVIDUAL',
      pack_size: product.pack_size || '1.000',
      quantity: product.quantity || '0.000',
      description: product.description || '',
      purchase_pricelist: '',
      purchase_price: '',
      purchase_currency: 'KES',
      sales_pricelist: '',
      sales_price: '',
      sales_currency: 'KES',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setForm(emptyProduct);
  };

  const createProduct = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const {
        purchase_pricelist,
        purchase_price,
        purchase_currency,
        sales_pricelist,
        sales_price,
        sales_currency,
        ...productPayload
      } = form;
      const response = editingProduct
        ? await api.patch(`/api/products/items/${editingProduct.id}/`, productPayload)
        : await api.post('/api/products/items/', productPayload);

      if (purchase_pricelist && purchase_price) {
        const pricelist = purchasePricelists.find((item) => String(item.id) === String(purchase_pricelist));
        const items = [
          ...(pricelist?.items || []).filter((item) => String(item.product) !== String(response.data.id)),
          {
            product: response.data.id,
            price: purchase_price,
            currency: purchase_currency || 'KES',
            unit: response.data.unit,
          },
        ];
        const purchaseUpdate = await api.patch(`/api/products/purchase-pricelists/${purchase_pricelist}/`, { items });
        setPurchasePricelists((current) => current.map((item) => (item.id === purchaseUpdate.data.id ? purchaseUpdate.data : item)));
      }

      if (sales_pricelist && sales_price) {
        const pricelist = salesPricelists.find((item) => String(item.id) === String(sales_pricelist));
        const items = [
          ...(pricelist?.items || []).filter((item) => String(item.product) !== String(response.data.id)),
          {
            product: response.data.id,
            price: sales_price,
            currency: sales_currency || 'KES',
          },
        ];
        const salesUpdate = await api.patch(`/api/products/sales-pricelists/${sales_pricelist}/`, { items });
        setSalesPricelists((current) => current.map((item) => (item.id === salesUpdate.data.id ? salesUpdate.data : item)));
      }

      setProducts((current) => (
        editingProduct
          ? current.map((product) => (product.id === response.data.id ? response.data : product))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingProduct ? 'Product updated' : 'Product created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
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
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Products & Items</h2>
            <p className="text-sm text-app-muted">Billable units, services, raw inventory, and bill of materials.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <DataTable
        rows={visibleProducts}
        columns={[
          {
            key: 'product',
            header: 'Product',
            render: (product) => (
              <>
                <p className="font-black text-app-text">{product.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{product.sku}</p>
              </>
            ),
          },
          { key: 'type', header: 'Type', render: (product) => product.product_type_display || product.product_type },
          { key: 'category', header: 'Category', render: (product) => product.category_name || '-' },
          { key: 'stock', header: 'Quantity', render: (product) => `${product.quantity || '0.000'} ${packageLabels[product.package_type] || 'package'} x ${product.pack_size || '1.000'} ${product.unit}` },
          {
            key: 'flags',
            header: 'Flags',
            render: (product) => (
              <div className="flex flex-wrap gap-2">
                {product.is_sellable ? <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-black uppercase text-emerald-600">Sellable</span> : null}
                {product.is_inventory_tracked ? <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-black uppercase text-blue-600">Tracked</span> : null}
              </div>
            ),
          },
          {
            key: 'bom',
            header: 'BOM',
            render: (product) => product.bom_items?.length ? `${product.bom_items.length} components` : '-',
          },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (product) => (
              <button
                type="button"
                onClick={() => openEditModal(product)}
                className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-brand-500"
                title="Edit product"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
        getRowKey={(product) => product.id}
        title={`${visibleProducts.length} products`}
        description="Search by product, SKU, category, type, package, or unit."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products"
        emptyMessage="No products match your search."
        minWidth="1040px"
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

      <ProductFormModal
        isOpen={showAddModal}
        form={form}
        categories={categories}
        purchasePricelists={purchasePricelists}
        salesPricelists={salesPricelists}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={createProduct}
        isSaving={saving}
        isEditing={Boolean(editingProduct)}
      />
    </div>
  );
}
