import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus } from 'lucide-react';

import api from '../api';
import TaxSetupFormModal from '../components/TaxSetupFormModal';

function displayValue(item, key) {
  const value = item[key];
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

export default function TaxSetupResourcePage({
  icon: Icon,
  title,
  description,
  addLabel,
  endpoint,
  emptyForm,
  fields,
  columns,
  summary,
  normalize = (value) => value,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(endpoint);
        setItems(Array.isArray(response.data.results) ? response.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed to load ${title.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [endpoint, title]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({ ...emptyForm, ...item });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = normalize(form);
      const response = editingItem
        ? await api.patch(`${endpoint}${editingItem.id}/`, payload)
        : await api.post(endpoint, payload);

      setItems((current) => (
        editingItem
          ? current.map((item) => (item.id === response.data.id ? response.data : item))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingItem ? `${title} updated` : `${title} created`);
    } catch (err) {
      const detail = err.response?.data?.detail || Object.values(err.response?.data || {})?.[0]?.[0];
      toast.error(detail || `Failed to save ${title.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">{title}</h2>
            <p className="text-sm text-app-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-app-text">{summary.title(item)}</h3>
                <p className="text-xs font-bold uppercase text-brand-500">{summary.subtitle(item)}</p>
              </div>
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="rounded-md p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500"
                title={`Edit ${title}`}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-app-muted md:grid-cols-2">
              {columns.map((column) => (
                <p key={column.key}>
                  <span className="font-bold text-app-text">{column.label}:</span> {column.render ? column.render(item) : displayValue(item, column.key)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <TaxSetupFormModal
        isOpen={isOpen}
        title={title.toLowerCase()}
        eyebrow={title}
        icon={Icon}
        form={form}
        fields={fields}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={saveItem}
        isSaving={saving}
        isEditing={Boolean(editingItem)}
      />
    </div>
  );
}
