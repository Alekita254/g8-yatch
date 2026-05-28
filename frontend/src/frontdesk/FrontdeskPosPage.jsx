import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, ReceiptText } from 'lucide-react';

import api from '../api';
import useFrontdeskData from './useFrontdeskData';

const lineTypes = [
  { value: 'ROOM_CHARGE', label: 'Room Charge' },
  { value: 'POS_CHARGE', label: 'POS Charge' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
];

export default function FrontdeskPosPage() {
  const { data, loading, refresh } = useFrontdeskData();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    folio: '',
    line_type: 'POS_CHARGE',
    description: '',
    amount: '',
    reference: '',
  });

  const openFolios = data.folios.filter((folio) => folio.status === 'OPEN');
  const selectedFolio = openFolios.find((folio) => String(folio.id) === String(form.folio));

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const postLine = async (event) => {
    event.preventDefault();
    if (!form.folio) return;
    try {
      setSaving(true);
      await api.post(`/api/folios/${form.folio}/lines/`, {
        line_type: form.line_type,
        description: form.description,
        amount: form.amount,
        reference: form.reference,
      });
      toast.success('Folio line posted');
      setForm((current) => ({ ...current, description: '', amount: '', reference: '' }));
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post folio line');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={postLine} className="rounded-lg border border-app-border bg-app-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Frontdesk POS</h2>
            <p className="text-sm text-app-muted">Post charges, adjustments, and payments directly to guest folios.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Open folio</span>
            <select required value={form.folio} onChange={(e) => updateForm('folio', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select folio</option>
              {openFolios.map((folio) => <option key={folio.id} value={folio.id}>{folio.folio_number} - {folio.guest_name} - Room {folio.room_number || '-'}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Line type</span>
            <select value={form.line_type} onChange={(e) => updateForm('line_type', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500">
              {lineTypes.map((line) => <option key={line.value} value={line.value}>{line.label}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Description</span>
            <input required value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Minibar charge, deposit payment..." className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Amount</span>
            <input required type="number" step="0.01" min="0" value={form.amount} onChange={(e) => updateForm('amount', e.target.value)} className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase text-app-muted">Reference</span>
            <input value={form.reference} onChange={(e) => updateForm('reference', e.target.value)} placeholder="Receipt, M-Pesa, approval ref..." className="w-full rounded-md border border-app-border bg-app-elevated px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Post to Folio
        </button>
      </form>

      <section className="rounded-lg border border-app-border bg-app-card p-6">
        <h3 className="text-xl font-black text-app-text">Selected Folio</h3>
        {!selectedFolio ? (
          <p className="mt-4 text-sm font-bold text-app-muted">Select an open folio to see its balance and recent lines.</p>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-app-elevated p-3">
                <p className="text-xs font-black uppercase text-app-muted">Charges</p>
                <p className="mt-1 text-xl font-black text-app-text">KES {selectedFolio.charge_total}</p>
              </div>
              <div className="rounded-md bg-app-elevated p-3">
                <p className="text-xs font-black uppercase text-app-muted">Payments</p>
                <p className="mt-1 text-xl font-black text-app-text">KES {selectedFolio.payment_total}</p>
              </div>
              <div className="rounded-md bg-app-elevated p-3">
                <p className="text-xs font-black uppercase text-app-muted">Balance</p>
                <p className="mt-1 text-xl font-black text-app-text">KES {selectedFolio.balance_due}</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedFolio.lines?.length ? selectedFolio.lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between rounded-md bg-app-elevated px-3 py-2 text-sm">
                  <span className="font-bold text-app-text">{line.description}</span>
                  <span className="text-app-muted">{line.line_type} / KES {line.amount}</span>
                </div>
              )) : <p className="text-sm font-bold text-app-muted">No folio lines yet.</p>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
