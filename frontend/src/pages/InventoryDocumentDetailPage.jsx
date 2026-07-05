import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, ClipboardCheck, Download, Loader2, Package, RefreshCcw, Truck } from 'lucide-react';

import api from '../api';
import DataTable from '../components/DataTable';

const statusStyles = {
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  SUBMITTED: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  RECEIVED: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function documentTotal(document) {
  return (document?.lines || []).reduce((total, line) => (
    total + (Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))
  ), 0);
}

function errorDetail(error, fallback) {
  const data = error.response?.data;
  if (data instanceof ArrayBuffer) {
    try {
      const text = new TextDecoder().decode(data);
      return JSON.parse(text).detail || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.detail || fallback;
}

export default function InventoryDocumentDetailPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');

  const fetchDocument = useCallback(async () => {
    try {
      const response = await api.get(`/api/inventory/documents/${documentId}/`);
      setDocument(response.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load inventory document');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const runAction = async (action, successMessage) => {
    try {
      setWorking(action);
      const response = await api.post(`/api/inventory/documents/${document.id}/${action}/`);
      setDocument(response.data);
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    } finally {
      setWorking('');
    }
  };

  const downloadPdf = async () => {
    try {
      setWorking('pdf');
      const response = await api.get(`/api/inventory/documents/${document.id}/pdf/`, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${document.document_number}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorDetail(err, 'Could not download PDF. Refresh and try again.'));
    } finally {
      setWorking('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  if (!document) {
    return (
      <div className="rounded-lg border border-app-border bg-app-card p-10 text-center">
        <p className="font-bold text-app-muted">Inventory document not found.</p>
        <Link to="/inventory/request-for-purchase" className="mt-4 inline-flex text-sm font-black text-brand-500">Back to RFP dashboard</Link>
      </div>
    );
  }

  const canApprove = document.document_type === 'PURCHASE_REQUEST' && document.status !== 'APPROVED';
  const canRequisition = document.document_type === 'PURCHASE_REQUEST' && document.status === 'APPROVED';

  return (
    <div className="space-y-6">
      <Link to="/inventory/request-for-purchase" className="inline-flex items-center gap-2 text-sm font-black text-brand-500 transition hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to RFP dashboard
      </Link>

      <section className="rounded-lg border border-app-border bg-app-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-app-text sm:text-2xl">{document.document_number}</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${statusStyles[document.status] || statusStyles.DRAFT}`}>
                  {document.status_display || document.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-500">{document.document_type_display}</p>
              <p className="mt-3 max-w-3xl text-sm text-app-muted">{document.notes || 'No notes have been added to this document.'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={fetchDocument} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button type="button" onClick={downloadPdf} disabled={Boolean(working)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated disabled:opacity-50">
              {working === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              PDF
            </button>
            {canApprove ? (
              <button type="button" onClick={() => runAction('approve', 'Purchase request approved')} disabled={Boolean(working)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-4 text-sm font-black text-app-text transition hover:bg-app-elevated disabled:opacity-50">
                {working === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Approve
              </button>
            ) : null}
            {canRequisition ? (
              <button type="button" onClick={() => runAction('requisition', 'Requisition generated')} disabled={Boolean(working)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50">
                {working === 'requisition' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                Generate Requisition
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <Truck className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-app-muted">Supplier</p>
          <p className="mt-2 font-black text-app-text">{document.supplier_name || document.purchase_pricelist_supplier || '-'}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <Package className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-app-muted">Purchase Pricelist</p>
          <p className="mt-2 font-black text-app-text">{document.purchase_pricelist_code || '-'}</p>
        </div>
        <div className="rounded-lg border border-app-border bg-app-card p-5">
          <ClipboardCheck className="h-5 w-5 text-brand-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-app-muted">Document Total</p>
          <p className="mt-2 text-2xl font-black text-app-text">KES {money(documentTotal(document))}</p>
        </div>
      </section>

      <DataTable
        rows={document.lines || []}
        columns={[
          {
            key: 'product',
            header: 'Product',
            render: (line) => (
              <>
                <p className="font-black text-app-text">{line.product_name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{line.product_sku}</p>
                <p className="mt-1 text-xs text-app-muted">{line.purchase_pricelist_supplier || 'No supplier'} · {line.purchase_pricelist_code || 'No pricelist'}</p>
              </>
            ),
          },
          { key: 'stock', header: 'In Store', render: (line) => `${formatQty(line.current_quantity)} ${line.product_unit}` },
          { key: 'requested', header: 'Requested', render: (line) => `${formatQty(line.requested_quantity)} ${line.product_unit}` },
          { key: 'cost', header: 'Unit Cost', render: (line) => `KES ${money(line.unit_cost)}` },
          { key: 'total', header: 'Line Total', render: (line) => <span className="font-black text-app-text">KES {money(Number(line.requested_quantity || 0) * Number(line.unit_cost || 0))}</span> },
          { key: 'notes', header: 'Notes', render: (line) => line.notes || '-' },
        ]}
        getRowKey={(line) => line.id}
        title={`${document.lines?.length || 0} exact products`}
        description="These are the products attached to this specific document."
        emptyMessage="No products were attached to this document."
        minWidth="900px"
      />
    </div>
  );
}
