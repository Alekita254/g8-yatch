import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';

const endpoints = {
  orders: '/api/sales/orders/',
  invoices: '/api/sales/invoices/',
  payments: '/api/sales/payments/',
  paymentRuns: '/api/sales/payment-runs/',
};

const configs = {
  orders: {
    title: 'Sales Orders',
    description: 'Editable draft orders, table movement, kitchen send state, and void-controlled items.',
    empty: 'No sales orders yet.',
    columns: [
      ['Order', 'order_number'],
      ['Customer', 'customer_name'],
      ['Service point', 'service_point_name'],
      ['Table', 'table_name'],
      ['Status', 'status'],
      ['Total', 'grand_total'],
    ],
  },
  invoices: {
    title: 'Sales Invoices',
    description: 'Immutable fiscal records created from orders. Mistakes should become credit notes later, not edits.',
    empty: 'No invoices yet.',
    columns: [
      ['Invoice', 'invoice_number'],
      ['Order', 'order_number'],
      ['Customer', 'customer_name'],
      ['Status', 'status'],
      ['eTIMS', 'etims_status'],
      ['Balance', 'balance_due'],
    ],
  },
  payments: {
    title: 'Payments',
    description: 'Split settlement records that move invoices from unpaid to partially paid to closed.',
    empty: 'No payments yet.',
    columns: [
      ['Method', 'payment_method_name'],
      ['Amount', 'amount'],
      ['Currency', 'currency'],
      ['Reference', 'reference'],
      ['Status', 'status'],
      ['Created', 'created_at'],
    ],
  },
  paymentRuns: {
    title: 'Customer Payment Runs',
    description: 'Corporate FIFO payment batches that apply one deposit across many invoices.',
    empty: 'No payment runs yet.',
    columns: [
      ['Run', 'run_number'],
      ['Customer', 'customer_name'],
      ['Amount', 'amount'],
      ['Unapplied', 'unapplied_amount'],
      ['Status', 'status'],
      ['Allocations', 'allocation_count'],
    ],
  },
};

function valueFor(item, key) {
  const value = item[key];
  if (!value) return '-';
  if (key.endsWith('_at')) return new Date(value).toLocaleString();
  return value;
}

function detailPath(type, row) {
  if (type === 'orders') return `/sales/orders/${row.id}`;
  if (type === 'invoices') return `/sales/invoices/${row.id}`;
  if (type === 'payments') return `/sales/payments/${row.id}`;
  return null;
}

export default function SalesListPage({ type }) {
  const config = configs[type];
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints[type], { params: { page, page_size: pageSize } });
        setRows(response.data.results || []);
        setPagination(paginationFromResponse(response.data, page, pageSize));
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load sales records');
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, [type, page, pageSize]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-app-border bg-app-card p-6">
        <h2 className="text-2xl font-black text-app-text">{config.title}</h2>
        <p className="mt-1 text-sm text-app-muted">{config.description}</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          ...config.columns.map(([label, key]) => ({
            key,
            header: label,
            cellClassName: 'font-medium text-app-text',
            render: (row) => {
              const linkedKey = (type === 'orders' && key === 'order_number')
                || (type === 'invoices' && key === 'invoice_number')
                || (type === 'payments' && key === 'reference');
              const path = detailPath(type, row);
              return linkedKey && path ? (
                <Link to={path} className="font-black text-brand-600 hover:underline">
                  {valueFor(row, key)}
                </Link>
              ) : valueFor(row, key);
            },
          })),
          ...(detailPath(type, { id: 'detail' }) ? [{
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <Link
                to={detailPath(type, row)}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-xs font-black text-app-text transition hover:border-brand-500 hover:bg-app-elevated"
              >
                <Eye className="h-4 w-4" />
                View
              </Link>
            ),
          }] : []),
        ]}
        getRowKey={(row) => row.id}
        emptyMessage={config.empty}
        minWidth="860px"
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
    </div>
  );
}
