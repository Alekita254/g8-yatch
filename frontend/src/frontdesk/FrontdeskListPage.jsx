import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus } from 'lucide-react';

import api from '../api';
import TaxSetupFormModal from '../components/TaxSetupFormModal';
import useFrontdeskData from './useFrontdeskData';

const baseConfigs = {
  partners: {
    title: 'Guests & Customers',
    description: 'Guests, corporate clients, agents, and other people or companies the hotel serves.',
    empty: 'No guests or customers yet.',
    endpoint: '/api/business-partners/',
    addLabel: 'Add Guest / Customer',
    emptyForm: {
      code: '',
      partner_type: 'GUEST',
      display_name: '',
      email: '',
      phone: '',
      nationality: '',
      id_document_type: '',
      id_document_number: '',
      visa_expiry_date: '',
      can_charge_to_room: false,
      credit_limit: '0.00',
      is_active: true,
    },
    fields: [
      { name: 'display_name', label: 'Display name', required: true },
      { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
      { name: 'partner_type', label: 'Type', type: 'select', options: [
        { value: 'GUEST', label: 'Guest' },
        { value: 'CORPORATE', label: 'Corporate Client' },
        { value: 'TRAVEL_AGENT', label: 'Travel Agent' },
        { value: 'SUPPLIER', label: 'Supplier' },
        { value: 'STAFF', label: 'Staff' },
      ] },
      { name: 'nationality', label: 'Nationality' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      { name: 'id_document_type', label: 'ID document type' },
      { name: 'id_document_number', label: 'ID / passport number' },
      { name: 'visa_expiry_date', label: 'Visa expiry date', type: 'date' },
      { name: 'credit_limit', label: 'Credit limit', type: 'number', step: '0.01', min: '0' },
      { name: 'can_charge_to_room', label: 'Can charge to room', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [['Name', 'display_name'], ['Type', 'partner_type_display'], ['Email', 'email'], ['Phone', 'phone'], ['Room Charge', 'can_charge_to_room']],
  },
  rooms: {
    title: 'Rooms',
    description: 'Physical room inventory and live operational status.',
    empty: 'No rooms yet.',
    endpoint: '/api/rooms/',
    addLabel: 'Add Room',
    emptyForm: { branch: '', room_type: '', number: '', floor: '', status: 'AVAILABLE', is_active: true },
    columns: [['Room', 'number'], ['Type', 'room_type_name'], ['Branch', 'branch_name'], ['Floor', 'floor'], ['Status', 'status_display']],
  },
  reservations: {
    title: 'Reservations',
    description: 'Booking lifecycle from enquiry to checked-out.',
    empty: 'No reservations yet.',
    endpoint: '/api/reservations/',
    addLabel: 'Add Reservation',
    emptyForm: {
      business_partner: '',
      room: '',
      check_in_date: '',
      check_out_date: '',
      adults: 1,
      children: 0,
      status: 'ENQUIRY',
      source: '',
      channel_reference: '',
      deposit_due_at: '',
      notes: '',
    },
    columns: [['Reservation', 'reservation_number'], ['Guest', 'guest_name'], ['Room', 'room_number'], ['Check-in', 'check_in_date'], ['Check-out', 'check_out_date'], ['Status', 'status']],
  },
  folios: {
    title: 'Folios',
    description: 'Open guest balances and checkout lock control.',
    empty: 'No folios yet.',
    endpoint: '/api/folios/',
    addLabel: 'Open Folio',
    emptyForm: { reservation: '', business_partner: '', room: '', status: 'OPEN' },
    columns: [['Folio', 'folio_number'], ['Guest', 'guest_name'], ['Room', 'room_number'], ['Status', 'status'], ['Balance', 'balance_due']],
  },
  requests: {
    title: 'Service Requests',
    description: 'Housekeeping, maintenance, concierge, and SLA-driven internal requests.',
    empty: 'No service requests yet.',
    endpoint: '/api/concierge/requests/',
    addLabel: 'Add Request',
    emptyForm: {
      room: '',
      business_partner: '',
      department: 'HOUSEKEEPING',
      priority: 'NORMAL',
      status: 'OPEN',
      title: '',
      description: '',
      sla_minutes: 15,
    },
    columns: [['Ticket', 'ticket_number'], ['Title', 'title'], ['Room', 'room_number'], ['Department', 'department'], ['Priority', 'priority'], ['Status', 'status']],
  },
};

function valueFor(item, key) {
  const value = item[key];
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value || '-';
}

function optionList(items, labelKey, valueKey = 'id') {
  return items.map((item) => ({ value: item[valueKey], label: item[labelKey] }));
}

export default function FrontdeskListPage({ type }) {
  const { data, loading, refresh } = useFrontdeskData();
  const [roomTypes, setRoomTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const config = baseConfigs[type];
  const [form, setForm] = useState(config.emptyForm);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [roomTypeResponse, branchResponse] = await Promise.all([
          api.get('/api/rooms/types/'),
          api.get('/api/organisation/branches/'),
        ]);
        setRoomTypes(roomTypeResponse.data.results || []);
        setBranches(branchResponse.data.results || []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load frontdesk options');
      }
    };
    fetchOptions();
  }, []);

  const dynamicFields = useMemo(() => {
    if (type === 'rooms') {
      return [
        { name: 'number', label: 'Room number', required: true },
        { name: 'room_type', label: 'Room type', type: 'select', required: true, placeholder: 'Select room type', options: optionList(roomTypes, 'name') },
        { name: 'branch', label: 'Branch', type: 'select', placeholder: 'Select branch', options: optionList(branches, 'name') },
        { name: 'floor', label: 'Floor' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'AVAILABLE', label: 'Available' },
          { value: 'OCCUPIED', label: 'Occupied' },
          { value: 'DIRTY', label: 'Dirty' },
          { value: 'MAINTENANCE_BLOCK', label: 'Maintenance Block' },
          { value: 'OUT_OF_ORDER', label: 'Out of Order' },
        ] },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ];
    }

    if (type === 'reservations') {
      return [
        { name: 'business_partner', label: 'Guest / customer', type: 'select', required: true, placeholder: 'Select guest', options: optionList(data.partners, 'display_name') },
        { name: 'room', label: 'Room', type: 'select', placeholder: 'Assign later', options: optionList(data.rooms, 'number') },
        { name: 'check_in_date', label: 'Check-in date', type: 'date', required: true },
        { name: 'check_out_date', label: 'Check-out date', type: 'date', required: true },
        { name: 'adults', label: 'Adults', type: 'number', min: '1' },
        { name: 'children', label: 'Children', type: 'number', min: '0' },
        { name: 'status', label: 'Status', type: 'select', options: ['ENQUIRY', 'TENTATIVE', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((value) => ({ value, label: value.replace(/_/g, ' ') })) },
        { name: 'source', label: 'Source' },
        { name: 'channel_reference', label: 'Channel reference' },
        { name: 'deposit_due_at', label: 'Deposit due at', type: 'datetime-local' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ];
    }

    if (type === 'folios') {
      return [
        { name: 'reservation', label: 'Reservation', type: 'select', required: true, placeholder: 'Select reservation', options: data.reservations.map((item) => ({ value: item.id, label: `${item.reservation_number} - ${item.guest_name}` })) },
        { name: 'business_partner', label: 'Guest / customer', type: 'select', required: true, placeholder: 'Select guest', options: optionList(data.partners, 'display_name') },
        { name: 'room', label: 'Room', type: 'select', placeholder: 'Select room', options: optionList(data.rooms, 'number') },
        { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'LOCKED', 'CLOSED'].map((value) => ({ value, label: value })) },
      ];
    }

    if (type === 'requests') {
      return [
        { name: 'title', label: 'Title', required: true },
        { name: 'room', label: 'Room', type: 'select', placeholder: 'Select room', options: optionList(data.rooms, 'number') },
        { name: 'business_partner', label: 'Guest / customer', type: 'select', placeholder: 'Select guest', options: optionList(data.partners, 'display_name') },
        { name: 'department', label: 'Department', type: 'select', options: ['HOUSEKEEPING', 'MAINTENANCE', 'CONCIERGE', 'SECURITY'].map((value) => ({ value, label: value })) },
        { name: 'priority', label: 'Priority', type: 'select', options: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map((value) => ({ value, label: value })) },
        { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'DISPATCHED', 'RESOLVED', 'ESCALATED'].map((value) => ({ value, label: value })) },
        { name: 'sla_minutes', label: 'SLA minutes', type: 'number', min: '1' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ];
    }

    return config.fields;
  }, [branches, config.fields, data.partners, data.reservations, data.rooms, roomTypes, type]);

  const rows = data[type] || [];
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditingItem(null);
    setForm(config.emptyForm);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const editable = Object.keys(config.emptyForm).reduce((acc, key) => {
      acc[key] = item[key] ?? config.emptyForm[key];
      return acc;
    }, {});
    setForm({ ...config.emptyForm, ...editable });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingItem(null);
    setForm(config.emptyForm);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = Object.keys(config.emptyForm).reduce((acc, key) => {
        acc[key] = form[key];
        return acc;
      }, {});
      ['branch', 'room', 'business_partner', 'reservation', 'deposit_due_at', 'visa_expiry_date'].forEach((key) => {
        if (key in payload) payload[key] = payload[key] || null;
      });
      if (editingItem) {
        await api.patch(`${config.endpoint}${editingItem.id}/`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }
      toast.success(editingItem ? `${config.title} updated` : `${config.title} created`);
      closeModal();
      refresh();
    } catch (err) {
      const detail = err.response?.data?.detail || Object.values(err.response?.data || {})?.[0]?.[0];
      toast.error(detail || `Failed to save ${config.title.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-app-text">{config.title}</h2>
          <p className="mt-1 text-sm text-app-muted">{config.description}</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          {config.addLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-app-border bg-app-card">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-app-muted">{config.empty}</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-app-border bg-app-elevated text-xs font-black uppercase tracking-[0.12em] text-app-muted">
              <tr>
                {config.columns.map(([label]) => <th key={label} className="px-4 py-3">{label}</th>)}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-app-elevated/60">
                  {config.columns.map(([label, key]) => <td key={`${row.id}-${label}`} className="px-4 py-3 font-medium text-app-text">{valueFor(row, key)}</td>)}
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => openEdit(row)} className="rounded-md p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TaxSetupFormModal
        isOpen={isOpen}
        title={config.title.toLowerCase()}
        eyebrow={config.title}
        icon={Plus}
        form={form}
        fields={dynamicFields}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={saveItem}
        isSaving={saving}
        isEditing={Boolean(editingItem)}
      />
    </div>
  );
}
