import { CreditCard } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  method_type: 'CASH',
  opens_cash_drawer: false,
  requires_reference: false,
  requires_customer: false,
  requires_room_verification: false,
  posts_to_accounts_receivable: false,
  is_active: true,
};

export default function PaymentMethodsPage() {
  return (
    <TaxSetupResourcePage
      icon={CreditCard}
      title="Payment Methods"
      description="Workflow rules for cash, M-Pesa, card, room charge, and city ledger payments."
      addLabel="Add Method"
      endpoint="/api/payments/methods/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'method_type', label: 'Method type', type: 'select', options: [
          { value: 'CASH', label: 'Cash' },
          { value: 'MPESA', label: 'M-Pesa' },
          { value: 'CARD', label: 'Card' },
          { value: 'CITY_LEDGER', label: 'City Ledger' },
          { value: 'ROOM_CHARGE', label: 'Room Charge' },
          { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
        ] },
        { name: 'opens_cash_drawer', label: 'Opens cash drawer', type: 'checkbox' },
        { name: 'requires_reference', label: 'Requires reference', type: 'checkbox' },
        { name: 'requires_customer', label: 'Requires customer', type: 'checkbox' },
        { name: 'requires_room_verification', label: 'Requires room verification', type: 'checkbox' },
        { name: 'posts_to_accounts_receivable', label: 'Posts to A/R', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'method_type_display', label: 'Type' },
        { key: 'opens_cash_drawer', label: 'Drawer' },
        { key: 'requires_customer', label: 'Customer' },
        { key: 'posts_to_accounts_receivable', label: 'A/R' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
