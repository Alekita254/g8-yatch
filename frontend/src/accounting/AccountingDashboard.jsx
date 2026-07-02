import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Banknote,
  CalendarDays,
  Download,
  Landmark,
  Loader2,
  ReceiptText,
  Scale,
  WalletCards,
} from 'lucide-react';

import api from '../api';

const currency = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 2,
});

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function money(value) {
  return currency.format(Number(value || 0));
}

function StatTile({ icon: Icon, label, value, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/20',
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  };

  return (
    <article className="rounded-lg border border-app-border bg-app-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">{label}</p>
          <p className="mt-3 text-2xl font-black text-app-text">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function BreakdownTable({ title, rows, columns, emptyText }) {
  return (
    <section className="rounded-lg border border-app-border bg-app-card">
      <div className="border-b border-app-border px-5 py-4">
        <h2 className="text-base font-black text-app-text">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-app-border text-left">
          <thead className="bg-app-elevated/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-app-muted">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="hover:bg-app-elevated/45">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-app-text">
                    {column.money ? money(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-sm font-semibold text-app-muted">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AccountingDashboard() {
  const [month, setMonth] = useState(currentMonth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchReport() {
      try {
        setLoading(true);
        const response = await api.get('/api/accounting/monthly-summary/', { params: { month } });
        if (active) {
          setReport(response.data);
        }
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load accounting summary');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchReport();
    return () => {
      active = false;
    };
  }, [month]);

  const csv = useMemo(() => {
    if (!report) return '';
    const rows = [
      ['Metric', 'Amount'],
      ['Sales total', report.summary.sales_total],
      ['Subtotal', report.summary.subtotal],
      ['Tax total', report.summary.tax_total],
      ['Discounts', report.summary.discount_total],
      ['Collections', report.summary.collections_total],
      ['Balance due', report.summary.balance_due],
      ['Open receivables', report.summary.open_receivables_total],
    ];
    return rows.map((row) => row.join(',')).join('\n');
  }, [report]);

  const downloadCsv = () => {
    if (!csv || !report) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `g8-accounting-${report.period.month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-[#172326] p-6 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">Accounting</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Monthly hotel accounts</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/68">
              Sales, taxes, collections, discounts, and receivables from issued invoices and cleared payments.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-[#d7b56d]" />
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="bg-transparent text-sm font-black text-white outline-none [color-scheme:dark]"
              />
            </label>
            <button
              type="button"
              onClick={downloadCsv}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7b56d] px-4 py-2 text-sm font-black text-[#172326] transition hover:bg-[#efcf83]"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile icon={ReceiptText} label="Invoices" value={report.summary.invoice_count} tone="brand" />
            <StatTile icon={Banknote} label="Sales" value={money(report.summary.sales_total)} tone="teal" />
            <StatTile icon={Scale} label="Tax" value={money(report.summary.tax_total)} tone="amber" />
            <StatTile icon={WalletCards} label="Collections" value={money(report.summary.collections_total)} tone="blue" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile icon={Landmark} label="Subtotal" value={money(report.summary.subtotal)} tone="brand" />
            <StatTile icon={ReceiptText} label="Discounts" value={money(report.summary.discount_total)} tone="amber" />
            <StatTile icon={WalletCards} label="Month Balance" value={money(report.summary.balance_due)} tone="blue" />
            <StatTile icon={Scale} label="Open Receivables" value={money(report.summary.open_receivables_total)} tone="teal" />
          </div>

          <section className="grid gap-4 lg:grid-cols-3">
            {report.tax_lines.map((line) => (
              <article key={line.label} className="rounded-lg border border-app-border bg-app-card p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-app-muted">{line.label}</p>
                <p className="mt-3 text-2xl font-black text-app-text">{money(line.amount)}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-app-muted">{line.basis}</p>
              </article>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <BreakdownTable
              title="Payment Collections"
              rows={report.by_payment_method}
              emptyText="No cleared payments for this month."
              columns={[
                { key: 'payment_method', label: 'Method' },
                { key: 'payment_count', label: 'Payments' },
                { key: 'collections_total', label: 'Collected', money: true },
              ]}
            />
            <BreakdownTable
              title="Branch Accounts"
              rows={report.by_branch}
              emptyText="No invoices for this month."
              columns={[
                { key: 'branch', label: 'Branch' },
                { key: 'invoice_count', label: 'Invoices' },
                { key: 'sales_total', label: 'Sales', money: true },
                { key: 'tax_total', label: 'Tax', money: true },
              ]}
            />
          </div>

          <BreakdownTable
            title="Service Point Sales"
            rows={report.by_service_point}
            emptyText="No service-point sales for this month."
            columns={[
              { key: 'service_point', label: 'Service Point' },
              { key: 'invoice_count', label: 'Invoices' },
              { key: 'sales_total', label: 'Sales', money: true },
              { key: 'tax_total', label: 'Tax', money: true },
            ]}
          />
        </>
      )}
    </div>
  );
}
