import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, MapPin, ReceiptText, UserRound, Utensils } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../api';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

function statusClass(status) {
  if (['SERVED', 'INVOICED'].includes(status)) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (status === 'CANCELLED') return 'bg-red-500/10 text-red-700 dark:text-red-300';
  return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/sales/orders/${id}/`);
        setOrder(response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Could not load order');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  if (!order) return <EmptyState />;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-app-border bg-app-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/sales/orders" className="inline-flex items-center gap-2 text-sm font-bold text-app-muted hover:text-app-text">
              <ArrowLeft className="h-4 w-4" /> All orders
            </Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-brand-600">Sales order</p>
            <h2 className="mt-2 text-2xl font-black text-app-text sm:text-3xl">{order.order_number}</h2>
            <p className="mt-2 text-sm text-app-muted">Created {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className={`self-start rounded-full px-3 py-2 text-xs font-black uppercase ${statusClass(order.status)}`}>
            {order.status.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Summary label="Order total" value={money(order.grand_total)} />
          <Summary label="Items" value={order.items.length} />
          <Summary label="Last updated" value={new Date(order.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-lg border border-app-border bg-app-card p-5">
          <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><UserRound className="h-5 w-5 text-brand-500" /> Service details</h3>
          <dl className="mt-5 space-y-4">
            <Detail label="Guest" value={order.customer_name || 'Walk-in guest'} />
            <Detail label="Service point" value={order.service_point_name || 'Not assigned'} />
            <Detail label="Table / area" value={order.table_name || 'Not recorded'} />
            <Detail label="Served by" value={order.waiter_name || 'Staff member'} />
            <Detail label="Branch" value={order.branch_name || 'Not assigned'} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {order.visit ? (
              <Link to={`/frontdesk/visits/${order.visit}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-app-border px-3 text-sm font-black text-app-text hover:bg-app-elevated">
                <MapPin className="h-4 w-4" /> Guest visit
              </Link>
            ) : null}
            {order.invoice ? (
              <Link to={`/sales/invoices/${order.invoice.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-black text-white">
                <ReceiptText className="h-4 w-4" /> Invoice {order.invoice.invoice_number}
              </Link>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-app-border bg-app-card">
          <div className="border-b border-app-border bg-app-elevated px-5 py-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-app-text"><Utensils className="h-5 w-5 text-brand-500" /> Ordered items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-app-border text-xs font-black uppercase text-app-muted">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Station</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-bold text-app-text">{item.product_name}</td>
                    <td className="px-5 py-4 text-app-muted">{Number(item.quantity)}</td>
                    <td className="px-5 py-4 text-app-muted">{item.routed_station || item.service_point_name || '-'}</td>
                    <td className="px-5 py-4 text-app-muted">{item.status.replaceAll('_', ' ')}</td>
                    <td className="px-5 py-4 text-right font-black text-app-text">{money(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto max-w-sm space-y-2 border-t border-app-border p-5 text-sm">
            <Amount label="Subtotal" value={money(order.subtotal)} />
            <Amount label="Tax" value={money(order.tax_total)} />
            <Amount label="Discount" value={`- ${money(order.discount_total)}`} />
            <Amount label="Total" value={money(order.grand_total)} strong />
          </div>
        </section>
      </div>

      {order.notes ? (
        <section className="rounded-lg border border-app-border bg-app-elevated p-4">
          <p className="flex items-center gap-2 font-black text-app-text"><FileText className="h-4 w-4 text-brand-500" /> Order notes</p>
          <p className="mt-2 text-sm text-app-muted">{order.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return <div className="rounded-lg border border-app-border bg-app-card p-8 text-center font-black text-app-text">Order not found</div>;
}

function Summary({ label, value }) {
  return <div className="rounded-lg border border-app-border bg-app-elevated p-4"><p className="text-xs font-black uppercase text-app-muted">{label}</p><p className="mt-2 text-xl font-black text-app-text">{value}</p></div>;
}

function Detail({ label, value }) {
  return <div><dt className="text-xs font-black uppercase text-app-muted">{label}</dt><dd className="mt-1 text-sm font-bold text-app-text">{value}</dd></div>;
}

function Amount({ label, value, strong = false }) {
  return <div className={`flex justify-between gap-4 ${strong ? 'border-t border-app-border pt-3 text-base font-black text-app-text' : 'text-app-muted'}`}><span>{label}</span><span className="font-bold text-app-text">{value}</span></div>;
}
