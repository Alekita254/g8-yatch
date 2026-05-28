import TaxSetupResourcePage from '../pages/TaxSetupResourcePage';
import { Layers } from 'lucide-react';

const emptyForm = {
  name: '',
  code: '',
  base_occupancy: 1,
  max_occupancy: 2,
  description: '',
  is_active: true,
};

export default function RoomTypesPage() {
  return (
    <TaxSetupResourcePage
      icon={Layers}
      title="Room Types"
      description="Define room classes before creating rooms: standard, deluxe, suite, villa, and family room."
      addLabel="Add Room Type"
      endpoint="/api/rooms/types/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'base_occupancy', label: 'Base occupancy', type: 'number', min: '1', required: true },
        { name: 'max_occupancy', label: 'Max occupancy', type: 'number', min: '1', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'base_occupancy', label: 'Base' },
        { key: 'max_occupancy', label: 'Max' },
        { key: 'is_active', label: 'Active' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
