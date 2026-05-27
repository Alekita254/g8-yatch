import { Landmark } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  account_type: 'BANK',
  bank_name: '',
  account_number: '',
  till_number: '',
  ledger_account: '',
  currency: 'KES',
  is_active: true,
};

export default function BankAccountsPage() {
  return (
    <TaxSetupResourcePage
      icon={Landmark}
      title="Bank Details"
      description="Real-world cash tills, bank accounts, M-Pesa tills, and clearing ledgers."
      addLabel="Add Bank Detail"
      endpoint="/api/payments/bank-accounts/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'account_type', label: 'Account type', type: 'select', options: [
          { value: 'BANK', label: 'Bank Account' },
          { value: 'MPESA_TILL', label: 'M-Pesa Till' },
          { value: 'CASH_TILL', label: 'Cash Till' },
          { value: 'CARD_CLEARING', label: 'Card Clearing' },
          { value: 'AR_LEDGER', label: 'Accounts Receivable' },
        ] },
        { name: 'currency', label: 'Currency', required: true, transform: (value) => value.toUpperCase() },
        { name: 'bank_name', label: 'Bank name' },
        { name: 'account_number', label: 'Account number' },
        { name: 'till_number', label: 'Till number' },
        { name: 'ledger_account', label: 'Ledger account', required: true },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'account_type_display', label: 'Type' },
        { key: 'ledger_account', label: 'Ledger' },
        { key: 'till_number', label: 'Till' },
        { key: 'currency', label: 'Currency' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
