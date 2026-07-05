import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ClipboardCheck,
  FilePlus2,
  Loader2,
  PackageX,
  RefreshCcw,
} from 'lucide-react';

import api from '../api';

const statusStyles = {
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  SUBMITTED: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  RECEIVED: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

function toList(data) {
  return Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function documentTotal(document) {
  return (document.lines || []).reduce((total, line) => (
    total + (Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))
  ), 0);
}

export default function RequestForPurchasePage() {
  const [lowStock, setLowStock] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const pendingRequests = useMemo(() => (
    documents.filter((document) => document.document_type === 'PURCHASE_REQUEST' && document.status !== 'APPROVED')
  ), [documents]);

  const requisitions = useMemo(() => (
    documents.filter((document) => document.document_type === 'REQUISITION')
  ), [documents]);

  const latestDocuments = documents.slice(0, 4);

  const fetchData = async () => {
    try {
      const [lowStockResponse, documentsResponse] = await Promise.all([
        api.get('/api/inventory/low-stock/', { params: { page_size: 100 } }),
        api.get('/api/inventory/documents/', { params: { page_size: 100 } }),
      ]);
      setLowStock(toList(lowStockResponse.data));
      setDocuments(toList(documentsResponse.data).filter((document) => (
        ['PURCHASE_REQUEST', 'REQUISITION'].includes(document.document_type)
      )));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load request dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-app-text sm:text-2xl">Request for Purchase</h2>
            <p className="text-sm text-app-muted">Track low-stock items, pending RFPs, requisitions, and open each document independently.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={fetchData} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-4 text-sm font-bold text-app-text transition hover:bg-app-elevated">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <Link to="/inventory/request-for-purchase/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700">
            <FilePlus2 className="h-4 w-4" />
            New Request
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Below / At Minimum', lowStock.length, 'Products that need attention', PackageX],
          ['Pending RFPs', pendingRequests.length, 'Submitted but not approved', FilePlus2],
          ['Requisitions', requisitions.length, 'Generated after approval', ClipboardCheck],
        ].map(([label, value, description, Icon]) => (
          <div key={label} className="rounded-lg border border-app-border bg-app-card p-5">
            <Icon className="h-5 w-5 text-brand-500" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-app-muted">{label}</p>
            <p className="mt-2 text-3xl font-black text-app-text">{value}</p>
            <p className="mt-1 text-sm text-app-muted">{description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="font-black text-app-text">Latest Requests and Requisitions</h3>
          <p className="mt-1 text-sm text-app-muted">A quick sample of the newest documents. Open one to work on it independently.</p>
        </div>
        {latestDocuments.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {latestDocuments.map((document) => (
              <Link key={document.id} to={`/inventory/request-for-purchase/${document.id}`} className="rounded-lg border border-app-border bg-app-bg p-4 transition hover:border-brand-500 hover:bg-app-elevated">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-app-text">{document.document_number}</p>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${statusStyles[document.status] || statusStyles.DRAFT}`}>
                    {document.status_display || document.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-500">{document.document_type_display}</p>
                <p className="mt-3 truncate text-sm text-app-muted">{document.supplier_name || document.purchase_pricelist_supplier || 'No supplier'}</p>
                <p className="mt-3 text-sm font-black text-app-text">KES {money(documentTotal(document))}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-app-border p-8 text-center text-sm font-bold text-app-muted">
            No RFP or requisition documents yet.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/inventory/request-for-purchase/requests" className="rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500 hover:bg-app-elevated">
          <FilePlus2 className="h-5 w-5 text-brand-500" />
          <h3 className="mt-4 font-black text-app-text">View Request Table</h3>
          <p className="mt-2 text-sm text-app-muted">Open all request-for-purchase documents in one focused table.</p>
        </Link>
        <Link to="/inventory/request-for-purchase/requisitions" className="rounded-lg border border-app-border bg-app-card p-5 transition hover:border-brand-500 hover:bg-app-elevated">
          <ClipboardCheck className="h-5 w-5 text-brand-500" />
          <h3 className="mt-4 font-black text-app-text">View Requisition Table</h3>
          <p className="mt-2 text-sm text-app-muted">Open all requisitions in one focused table.</p>
        </Link>
      </section>
    </div>
  );
}
