import { useEffect, useState } from 'react';
import { Banknote, ReceiptText, MapPin } from 'lucide-react';
import ModalLayer from '../components/ModalLayer';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VisitCheckoutModal({ visit, open, initialInvoiceId = null, onClose, onRequestCheckout, onCollectPayment, paymentMethods, working }) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!open || !visit) return;
    const invoices = (visit.orders || []).map((order) => order.invoice).filter(Boolean);
    const dueInvoice = invoices.find((invoice) => invoice.balance_due > 0) || invoices[0] || null;
    const initial = invoices.find((invoice) => invoice.id === initialInvoiceId) || dueInvoice || null;
    setSelectedInvoiceId(initial?.id ?? null);
    setPaymentMethod('');
    setReference('');
    setAmount(initial?.balance_due || 0);
  }, [open, visit, initialInvoiceId]);

  const invoices = (visit?.orders || []).map((order) => order.invoice).filter(Boolean);
  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_total || 0), 0);
  const totalBalance = invoices.reduce((sum, invoice) => sum + Number(invoice.balance_due || 0), 0);
  const hasCheckoutRequest = visit?.status === 'CHECKOUT_REQUESTED';
  const dueInvoices = invoices.filter((invoice) => invoice.balance_due > 0);
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) || dueInvoices[0] || invoices[0] || null;
  const selectedMethod = paymentMethods.find((method) => String(method.id) === String(paymentMethod));
  const isCollecting = selectedInvoice && Boolean(selectedMethod);
  const disabled = working === 'checkout' || visit?.status === 'CLOSED';

  useEffect(() => {
    if (selectedInvoice) {
      setAmount(selectedInvoice.balance_due || 0);
    }
  }, [selectedInvoice]);

  if (!open || !visit) return null;

  const handleCollect = async () => {
    if (!selectedInvoice) return;
    onCollectPayment(selectedInvoice, Number(amount), paymentMethod, reference);
  };

  return (
    <ModalLayer label="Checkout guest stay" onClose={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-app-border bg-app-card shadow-2xl">
        <div className="border-b border-app-border bg-app-elevated px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-500">Checkout</p>
              <h2 className="mt-2 text-2xl font-black text-app-text">Guest stay payment</h2>
              <p className="mt-1 text-sm text-app-muted">{visit.visit_number} · {visit.guest_name || 'Walk-in guest'}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-app-card px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-app-muted shadow-sm">
              <ReceiptText className="h-4 w-4 text-brand-500" /> {visit.status.replaceAll('_', ' ')}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-app-border bg-app-elevated px-4 py-4">
              <p className="text-xs font-black uppercase text-app-muted">Total billed</p>
              <p className="mt-2 text-xl font-black text-app-text">{money(totalInvoiceAmount)}</p>
            </div>
            <div className="rounded-2xl border border-app-border bg-app-elevated px-4 py-4">
              <p className="text-xs font-black uppercase text-app-muted">Collected</p>
              <p className="mt-2 text-xl font-black text-app-text">{money(totalPaid)}</p>
            </div>
            <div className="rounded-2xl border border-app-border bg-app-elevated px-4 py-4">
              <p className="text-xs font-black uppercase text-app-muted">Balance due</p>
              <p className="mt-2 text-xl font-black text-app-text">{money(totalBalance)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-card p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-brand-500" />
              <div>
                <p className="font-black text-app-text">Collect payment directly from this modal.</p>
                <p className="mt-2 text-sm text-app-muted">Request checkout if needed, then use the payment section to settle any invoice balance.</p>
              </div>
            </div>
          </div>

          {!hasCheckoutRequest && invoices.length === 0 ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
              This stay has no checkout invoice yet. Request checkout to generate the bill before collecting payment.
            </div>
          ) : null}

          {(hasCheckoutRequest || invoices.length > 0) && (
            <div className="space-y-4 rounded-2xl border border-app-border bg-app-elevated p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-black uppercase text-app-muted">Invoice</label>
                  <select value={selectedInvoice?.id || ''} onChange={(event) => setSelectedInvoiceId(Number(event.target.value))} className="mt-2 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                    {invoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · Due {money(invoice.balance_due)}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-xs font-black uppercase text-app-muted">Amount</label>
                  <input type="number" value={amount} min="0" step="0.01" onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase text-app-muted">Payment method</span>
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-2 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>{method.name}</option>
                    ))}
                  </select>
                </label>
                {selectedMethod?.requires_reference ? (
                  <label className="block">
                    <span className="text-xs font-black uppercase text-app-muted">Reference</span>
                    <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="M-Pesa code, approval text..." className="mt-2 w-full rounded-md border border-app-border bg-app-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                  </label>
                ) : null}
              </div>

              {dueInvoices.length === 0 ? (
                <div className="rounded-2xl border border-app-border bg-app-card p-4 text-sm text-app-muted">There is no outstanding amount to collect on this stay.</div>
              ) : (
                <div className="rounded-2xl border border-app-border bg-app-card p-4 text-sm text-app-muted">
                  The selected invoice has {money(selectedInvoice?.balance_due)} due. Submit payment to close the balance.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-app-border px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={disabled} className="rounded-2xl border border-app-border px-4 py-3 text-sm font-bold text-app-text hover:bg-app-elevated disabled:opacity-50">
            Cancel
          </button>
          {!hasCheckoutRequest && invoices.length === 0 ? (
            <button type="button" onClick={() => onRequestCheckout(visit)} disabled={disabled} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50">
              {working === 'checkout' ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Banknote className="h-4 w-4" />}
              Request checkout
            </button>
          ) : (
            <button type="button" onClick={handleCollect} disabled={!isCollecting || working.startsWith('invoice-')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50">
              {working.startsWith('invoice-') ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Banknote className="h-4 w-4" />}
              Collect payment
            </button>
          )}
        </div>
      </div>
    </ModalLayer>
  );
}
