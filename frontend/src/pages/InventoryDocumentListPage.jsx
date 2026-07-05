import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle2, ClipboardCheck, Download, Eye, FilePlus2, Loader2, RefreshCcw } from 'lucide-react';

import api from '../api';
import DataTable from '../components/DataTable';

const statusStyles = {
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  SUBMITTED: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  RECEIVED: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
  CANCELLED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

const copy = {
  requests: {
    title: 'Requests for Purchase',
    description: 'All RFP documents, each kept separate with its own products and supplier details.',
    documentType: 'PURCHASE_REQUEST',
    empty: 'No requests for purchase have been generated yet.',
    icon: FilePlus2,
  },
  requisitions: {
    title: 'Requisitions',
    description: 'All requisition documents generated from approved RFPs.',
    documentType: 'REQUISITION',
    empty: 'No requisitions have been generated yet.',
    icon: ClipboardCheck,
  },
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

export default function InventoryDocumentListPage({ type = 'requests' }) {
  const config = copy[type] || copy.requests;
  const Icon = config.icon;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingDocument, setWorkingDocument] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleDocuments = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return documents;
    return documents.filter((document) => [
      document.document_number,
      document.document_type_display,
      document.status_display,
      document.supplier_name,
      document.purchase_pricelist_supplier,
      document.purchase_pricelist_code,
      ...(document.lines || []).map((line) => `${line.product_name} ${line.product_sku}`),
    ].join(' ').toLowerCase().includes(needle));
  }, [documents, searchTerm]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/api/inventory/documents/', {
        params: { page_size: 100, document_type: config.documentType },
      });
      setDocuments(toList(response.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [config.documentType]);

  useEffect(() => {
    setLoading(true);
    fetchDocuments();
  }, [fetchDocuments]);

  const runDocumentAction = async (document, action, successMessage) => {
    try {
      setWorkingDocument(`${action}-${document.id}`);
      await api.post(`/api/inventory/documents/${document.id}/${action}/`);
      await fetchDocuments();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    } finally {
      setWorkingDocument('');
    }
  };

  const downloadDocument = async (inventoryDocument) => {
    try {
      setWorkingDocument(`pdf-${inventoryDocument.id}`);
      const response = await api.get(`/api/inventory/documents/${inventoryDocument.id}/pdf/`, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inventoryDocument.document_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorDetail(err, 'Could not download PDF. Refresh the page and try again.'));
    } finally {
      setWorkingDocument('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-app-text sm:text-2xl">{config.title}</h2>
            <p className="text-sm text-app-muted">{config.description}</p>
          </div>
        </div>
        <button type="button" onClick={fetchDocuments} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-4 text-sm font-bold text-app-text transition hover:bg-app-elevated">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </section>

      <DataTable
        rows={visibleDocuments}
        columns={[
          {
            key: 'document',
            header: 'Document',
            render: (document) => (
              <>
                <p className="font-black text-app-text">{document.document_number}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{document.document_type_display}</p>
              </>
            ),
          },
          { key: 'supplier', header: 'Supplier', render: (document) => document.supplier_name || document.purchase_pricelist_supplier || '-' },
          { key: 'pricelist', header: 'Pricelist', render: (document) => document.purchase_pricelist_code || '-' },
          {
            key: 'status',
            header: 'Status',
            render: (document) => (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-widest ${statusStyles[document.status] || statusStyles.DRAFT}`}>
                {document.status_display || document.status}
              </span>
            ),
          },
          { key: 'items', header: 'Items', render: (document) => `${document.lines?.length || 0} items` },
          { key: 'total', header: 'Total', render: (document) => <span className="font-black text-app-text">KES {money(documentTotal(document))}</span> },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (document) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Link to={`/inventory/request-for-purchase/${document.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <button type="button" onClick={() => downloadDocument(document)} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50">
                  {workingDocument === `pdf-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  PDF
                </button>
                {document.document_type === 'PURCHASE_REQUEST' && document.status !== 'APPROVED' ? (
                  <button type="button" onClick={() => runDocumentAction(document, 'approve', 'Purchase request approved')} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md border border-app-border px-3 py-2 text-xs font-black uppercase tracking-widest text-app-text transition hover:bg-app-card disabled:opacity-50">
                    {workingDocument === `approve-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </button>
                ) : null}
                {document.document_type === 'PURCHASE_REQUEST' && document.status === 'APPROVED' ? (
                  <button type="button" onClick={() => runDocumentAction(document, 'requisition', 'Requisition generated')} disabled={Boolean(workingDocument)} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand-700 disabled:opacity-50">
                    {workingDocument === `requisition-${document.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                    Requisition
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        getRowKey={(document) => document.id}
        title={`${visibleDocuments.length} ${config.title.toLowerCase()}`}
        description="Open any document to see its exact products and supplier details."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search ${config.title.toLowerCase()}`}
        emptyMessage={config.empty}
        minWidth="1060px"
      />
    </div>
  );
}
