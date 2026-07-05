import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ClipboardCheck,
  FilePlus2,
  Loader2,
  Package,
  PackageX,
  RefreshCcw,
  Truck,
} from 'lucide-react';

import api from '../api';

function toList(data) {
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active !== false).length,
    [products],
  );

  const pendingRequests = useMemo(() => (
    documents.filter((document) => (
      document.document_type === 'PURCHASE_REQUEST' && ['DRAFT', 'SUBMITTED'].includes(document.status)
    ))
  ), [documents]);

  const fetchInventory = async () => {
    try {
      const [productsResponse, lowStockResponse, documentsResponse] = await Promise.all([
        api.get('/api/products/items/', { params: { page_size: 100 } }),
        api.get('/api/inventory/low-stock/', { params: { page_size: 3 } }),
        api.get('/api/inventory/documents/', { params: { page_size: 30 } }),
      ]);
      setProducts(toList(productsResponse.data));
      setLowStock(toList(lowStockResponse.data));
      setDocuments(toList(documentsResponse.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={fetchInventory}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-app-border px-3 text-xs font-black uppercase tracking-[0.12em] text-app-muted transition hover:bg-app-elevated hover:text-app-text"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ['Products', activeProducts, Package, '/inventory/products'],
          ['Low Stock', lowStock.length, PackageX, '/inventory/request-for-purchase'],
          ['Pending RFPs', pendingRequests.length, ClipboardCheck, '/inventory/request-for-purchase/requests'],
        ].map(([label, value, Icon, path]) => (
          <Link key={label} to={path} className="rounded-lg border border-app-border bg-app-card p-4 transition hover:border-brand-500 hover:bg-app-elevated">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">{label}</p>
                <p className="mt-2 text-3xl font-black text-app-text">{value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      {lowStock.length ? (
        <section className="rounded-lg border border-amber-500/25 bg-amber-500/8 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-app-text">{lowStock.length} item{lowStock.length === 1 ? '' : 's'} need stock attention</p>
              <p className="mt-1 text-sm text-app-muted">
                {lowStock.map((product) => product.name).join(', ')}
              </p>
            </div>
            <Link to="/inventory/request-for-purchase/new" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700">
              <FilePlus2 className="h-4 w-4" />
              New Request
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['New Request', 'Create an RFP', FilePlus2, '/inventory/request-for-purchase/new'],
          ['Requests', 'Review approvals', ClipboardCheck, '/inventory/request-for-purchase/requests'],
          ['Products', 'Items and thresholds', Package, '/inventory/products'],
          ['Purchase Prices', 'Supplier prices', Truck, '/inventory/purchase-pricelists'],
        ].map(([title, description, Icon, path]) => (
          <Link key={title} to={path} className="rounded-lg border border-app-border bg-app-card p-4 transition hover:border-brand-500 hover:bg-app-elevated">
            <Icon className="h-5 w-5 text-brand-500" />
            <h3 className="mt-4 font-black text-app-text">{title}</h3>
            <p className="mt-1 text-sm text-app-muted">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
