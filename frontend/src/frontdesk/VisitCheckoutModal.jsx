import { useEffect, useState } from 'react';
import { Banknote, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import ModalLayer from '../components/ModalLayer';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const emptySplit = (amount = 0) => ({ payment_method: '', amount, reference: '' });
const ALL_INVOICES = 'ALL';

function allocateSplitsToInvoices(invoices, splits) {
  const allocations = invoices.map((invoice) => ({
    invoice,
    remaining: Number(invoice.balance_due || 0),
    payments: [],
  }));

  splits.forEach((split) => {
    let available = Number(split.amount || 0);
    allocations.forEach((allocation) => {
      if (available <= 0 || allocation.remaining <= 0) return;
      const amount = Math.min(available, allocation.remaining);
      allocation.payments.push({
        payment_method: split.payment_method,
        amount,
        reference: split.reference.trim(),
      });
      allocation.remaining -= amount;
      available -= amount;
    });
  });

  return allocations
    .map(({ invoice, payments }) => ({ invoice, payments }))
    .filter((allocation) => allocation.payments.length > 0);
}

export default function VisitCheckoutModal({ visit, open, initialInvoiceId = null, onClose, onRequestCheckout, onCollectPayment, paymentMethods, working }) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [paymentSplits, setPaymentSplits] = useState([emptySplit()]);

  useEffect(() => {
    if (!open || !visit) return;
    const invoices = (visit.orders || []).map((order) => order.invoice).filter(Boolean);
    const dueInvoices = invoices.filter((invoice) => invoice.balance_due > 0);
    const dueInvoice = dueInvoices[0] || invoices[0] || null;
    const initial = invoices.find((invoice) => invoice.id === initialInvoiceId) || dueInvoice || null;
    const shouldPayAll = !initialInvoiceId && dueInvoices.length > 1;
    setSelectedInvoiceId(shouldPayAll ? ALL_INVOICES : initial?.id ?? null);
    setPaymentSplits([emptySplit(shouldPayAll ? dueInvoices.reduce((sum, invoice) => sum + Number(invoice.balance_due || 0), 0) : initial?.balance_due || 0)]);
  }, [open, visit, initialInvoiceId]);

  const invoices = (visit?.orders || []).map((order) => order.invoice).filter(Boolean);
  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.grand_total || 0), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_total || 0), 0);
  const totalBalance = invoices.reduce((sum, invoice) => sum + Number(invoice.balance_due || 0), 0);
  const hasCheckoutRequest = visit?.status === 'CHECKOUT_REQUESTED';
  const dueInvoices = invoices.filter((invoice) => invoice.balance_due > 0);
  const payAllInvoices = selectedInvoiceId === ALL_INVOICES && dueInvoices.length > 1;
  const selectedInvoice = payAllInvoices ? null : invoices.find((invoice) => invoice.id === selectedInvoiceId) || dueInvoices[0] || invoices[0] || null;
  const payableInvoices = payAllInvoices ? dueInvoices : selectedInvoice ? [selectedInvoice] : [];
  const splitTotal = paymentSplits.reduce((sum, split) => sum + Number(split.amount || 0), 0);
  const payableBalance = payAllInvoices ? totalBalance : Number(selectedInvoice?.balance_due || 0);
  const splitRemaining = Math.max(payableBalance - splitTotal, 0);
  const splitOverpay = Math.max(splitTotal - payableBalance, 0);
  const isCollecting = payableInvoices.length > 0
    && paymentSplits.length > 0
    && splitTotal > 0
    && Math.abs(splitTotal - payableBalance) < 0.01
    && paymentSplits.every((split) => {
      const method = paymentMethods.find((item) => String(item.id) === String(split.payment_method));
      return method && Number(split.amount || 0) > 0 && (!method.requires_reference || split.reference.trim());
    });
  const disabled = working === 'checkout' || visit?.status === 'CLOSED';

  useEffect(() => {
    if (payableBalance > 0) {
      setPaymentSplits([emptySplit(payableBalance)]);
    }
  }, [payableBalance]);

  if (!open || !visit) return null;

  const handleCollect = async () => {
    if (!payableInvoices.length) return;
    const payments = paymentSplits.map((split) => ({
      payment_method: split.payment_method,
      amount: Number(split.amount || 0),
      reference: split.reference.trim(),
    }));
    const collected = payAllInvoices
      ? await onCollectPayment(allocateSplitsToInvoices(dueInvoices, paymentSplits))
      : await onCollectPayment(payableInvoices[0], payments);
    if (collected) onClose();
  };

  const updateSplit = (index, field, value) => {
    setPaymentSplits((current) => current.map((split, splitIndex) => (
      splitIndex === index ? { ...split, [field]: value } : split
    )));
  };

  const addSplit = () => {
    setPaymentSplits((current) => [...current, emptySplit(splitRemaining || 0)]);
  };

  const removeSplit = (index) => {
    setPaymentSplits((current) => current.filter((_, splitIndex) => splitIndex !== index));
  };

  return (
    <ModalLayer label="Checkout guest visit" onClose={onClose} className="items-end px-0 sm:items-center sm:px-4">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-app-border bg-app-card shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
        <div className="relative shrink-0 border-b border-app-border bg-app-elevated px-4 py-4 pr-16 sm:px-5 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-app-card text-app-muted transition hover:bg-app-bg hover:text-app-text"
            aria-label="Close checkout"
            title="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-500">Checkout</p>
              <h2 className="mt-2 text-xl font-black text-app-text sm:text-2xl">Guest visit payment</h2>
              <p className="mt-1 text-sm text-app-muted">{visit.visit_number} · {visit.guest_name || 'Walk-in guest'}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-app-card px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-app-muted shadow-sm sm:inline-flex">
              <ReceiptText className="h-4 w-4 text-brand-500" /> {visit.status.replaceAll('_', ' ')}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <section className="rounded-lg border border-app-border bg-app-elevated p-4 sm:rounded-2xl">
            <p className="text-xs font-black uppercase text-app-muted">Balance due</p>
            <p className="mt-2 text-3xl font-black text-app-text">{money(totalBalance)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-app-card px-3 py-2">
                <p className="text-xs font-bold uppercase text-app-muted">Billed</p>
                <p className="mt-1 font-black text-app-text">{money(totalInvoiceAmount)}</p>
              </div>
              <div className="rounded-md bg-app-card px-3 py-2">
                <p className="text-xs font-bold uppercase text-app-muted">Collected</p>
                <p className="mt-1 font-black text-app-text">{money(totalPaid)}</p>
              </div>
            </div>
          </section>

          {!hasCheckoutRequest && invoices.length === 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 sm:rounded-2xl">
              This visit has no checkout invoice yet. Request checkout to generate the bill before collecting payment.
            </div>
          ) : null}

          {(hasCheckoutRequest || invoices.length > 0) && (
            <div className="space-y-4">
              {invoices.length > 1 ? (
                <label className="block">
                  <span className="text-xs font-black uppercase text-app-muted">Invoice</span>
                  <select
                    value={payAllInvoices ? ALL_INVOICES : selectedInvoice?.id || ''}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSelectedInvoiceId(nextValue === ALL_INVOICES ? ALL_INVOICES : Number(nextValue));
                    }}
                    className="mt-2 min-h-12 w-full rounded-md border border-app-border bg-app-elevated px-3 text-base font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {dueInvoices.length > 1 ? <option value={ALL_INVOICES}>All outstanding invoices · Due {money(totalBalance)}</option> : null}
                    {invoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · Due {money(invoice.balance_due)}</option>
                    ))}
                  </select>
                </label>
              ) : selectedInvoice ? (
                <div className="rounded-md border border-app-border bg-app-elevated px-4 py-3">
                  <p className="text-xs font-black uppercase text-app-muted">Invoice</p>
                  <p className="mt-1 font-bold text-app-text">{selectedInvoice.invoice_number} · Due {money(selectedInvoice.balance_due)}</p>
                </div>
              ) : null}

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-black uppercase text-app-muted">Split payment</p>
                  <button type="button" onClick={addSplit} disabled={splitRemaining <= 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-app-border px-3 text-sm font-black text-app-text disabled:opacity-50">
                    <Plus className="h-4 w-4" /> Add method
                  </button>
                </div>

                {paymentSplits.map((split, index) => {
                  const method = paymentMethods.find((item) => String(item.id) === String(split.payment_method));
                  return (
                    <div key={index} className="rounded-lg border border-app-border bg-app-elevated p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-app-text">Payment {index + 1}</p>
                        <button type="button" onClick={() => removeSplit(index)} disabled={paymentSplits.length === 1} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-app-border text-app-muted hover:text-red-600 disabled:opacity-40" aria-label="Remove split payment">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-black uppercase text-app-muted">Method</span>
                          <select value={split.payment_method} onChange={(event) => updateSplit(index, 'payment_method', event.target.value)} className="mt-2 min-h-12 w-full rounded-md border border-app-border bg-app-card px-3 text-base font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500">
                            <option value="">Select method</option>
                            {paymentMethods.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-xs font-black uppercase text-app-muted">Amount</span>
                          <input type="number" inputMode="decimal" value={split.amount} min="0" step="0.01" onChange={(event) => updateSplit(index, 'amount', event.target.value)} className="mt-2 min-h-12 w-full rounded-md border border-app-border bg-app-card px-3 text-base font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500" />
                        </label>
                      </div>
                      {method?.requires_reference ? (
                        <label className="mt-3 block">
                          <span className="text-xs font-black uppercase text-app-muted">Reference</span>
                          <input value={split.reference} onChange={(event) => updateSplit(index, 'reference', event.target.value)} placeholder="M-Pesa code, approval text..." className="mt-2 min-h-12 w-full rounded-md border border-app-border bg-app-card px-3 text-base font-bold text-app-text outline-none focus:ring-2 focus:ring-brand-500" />
                        </label>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {dueInvoices.length === 0 ? (
                <div className="rounded-lg border border-app-border bg-app-elevated p-4 text-sm text-app-muted sm:rounded-2xl">There is no outstanding amount to collect on this visit.</div>
              ) : (
                <div className={`rounded-lg border p-4 text-sm sm:rounded-2xl ${splitOverpay > 0 ? 'border-red-500/25 bg-red-500/10 text-red-700' : splitRemaining > 0 ? 'border-amber-500/25 bg-amber-500/10 text-amber-700' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700'}`}>
                  Paid now: <strong>{money(splitTotal)}</strong>. {splitRemaining > 0 ? <>Remaining: <strong>{money(splitRemaining)}</strong>.</> : splitOverpay > 0 ? <>Over by: <strong>{money(splitOverpay)}</strong>.</> : 'Ready to collect.'}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid shrink-0 gap-3 border-t border-app-border bg-app-card px-4 py-4 sm:flex sm:justify-end sm:px-5">
          {!hasCheckoutRequest && invoices.length === 0 ? (
            <button type="button" onClick={() => onRequestCheckout(visit)} disabled={disabled} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-bold text-white transition disabled:opacity-50">
              {working === 'checkout' ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Banknote className="h-4 w-4" />}
              Request checkout
            </button>
          ) : (
            <button type="button" onClick={handleCollect} disabled={!isCollecting || working.startsWith('invoice-')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition disabled:opacity-50">
              {working.startsWith('invoice-') ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Banknote className="h-4 w-4" />}
              {payAllInvoices ? 'Collect all invoices' : 'Collect split payment'}
            </button>
          )}
          <button type="button" onClick={onClose} disabled={disabled} className="min-h-11 rounded-md border border-app-border px-4 text-sm font-bold text-app-text hover:bg-app-elevated disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </ModalLayer>
  );
}
