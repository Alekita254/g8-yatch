import { Landmark } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  branch_code: '',
  kra_pin: '',
  integration_mode: 'CLOUD_ETIMS',
  endpoint_url: '',
  routing_key: '',
  certificate_alias: '',
  is_active: true,
};

export default function TaxOfficesPage() {
  return (
    <TaxSetupResourcePage
      icon={Landmark}
      title="Tax Offices"
      description="Secure branch-level routing profiles for cloud eTIMS, OSCU devices, and manual filing."
      addLabel="Add Tax Office"
      endpoint="/api/taxes/offices/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'branch_code', label: 'Branch code', required: true, transform: (value) => value.toUpperCase().replace(/\s+/g, '_') },
        { name: 'kra_pin', label: 'KRA PIN', required: true, transform: (value) => value.toUpperCase() },
        { name: 'integration_mode', label: 'Integration mode', type: 'select', options: [
          { value: 'CLOUD_ETIMS', label: 'Cloud eTIMS' },
          { value: 'OSCU_DEVICE', label: 'OSCU device' },
          { value: 'MANUAL', label: 'Manual filing' },
        ] },
        { name: 'endpoint_url', label: 'Endpoint URL', type: 'url', wide: true },
        { name: 'routing_key', label: 'Routing key' },
        { name: 'certificate_alias', label: 'Certificate alias' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'branch_code', label: 'Branch' },
        { key: 'kra_pin', label: 'KRA PIN' },
        { key: 'integration_mode_display', label: 'Mode' },
        { key: 'certificate_alias', label: 'Certificate' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.branch_code,
      }}
    />
  );
}
