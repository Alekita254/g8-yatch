import { Building2 } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  legal_name: '',
  taxpayer_pin: '',
  business_email: '',
  business_phone: '',
  physical_address: '',
  is_active: true,
};

export default function OrganizationsPage() {
  return (
    <TaxSetupResourcePage
      icon={Building2}
      title="Organizations"
      description="The enterprise-level owner for consolidated reporting and global administration."
      addLabel="Add Organization"
      endpoint="/api/organisation/organizations/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'legal_name', label: 'Legal name' },
        { name: 'taxpayer_pin', label: 'Taxpayer PIN', transform: (value) => value.toUpperCase() },
        { name: 'business_email', label: 'Business email', type: 'email' },
        { name: 'business_phone', label: 'Business phone' },
        { name: 'physical_address', label: 'Physical address', type: 'textarea' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'legal_name', label: 'Legal name' },
        { key: 'taxpayer_pin', label: 'KRA PIN' },
        { key: 'business_email', label: 'Email' },
        { key: 'branch_count', label: 'Branches' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
