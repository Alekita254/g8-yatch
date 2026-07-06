import { BedDouble } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  number: '',
  capacity: 1,
  status: 'AVAILABLE',
  is_active: true,
};

export default function RoomsPage() {
  return (
    <TaxSetupResourcePage
      icon={BedDouble}
      title="Rooms"
      description="Create each room with a simple title and the number of people it can host."
      addLabel="Add Room"
      endpoint="/api/rooms/"
      emptyForm={emptyForm}
      fields={[
        { name: 'number', label: 'Room title', required: true, placeholder: 'Executive Room' },
        { name: 'capacity', label: 'People', type: 'number', min: '1', required: true },
      ]}
      columns={[
        { key: 'capacity', label: 'People' },
      ]}
      summary={{
        title: (item) => item.number,
        subtitle: (item) => `${item.capacity || 1} ${Number(item.capacity || 1) === 1 ? 'person' : 'people'}`,
      }}
      normalize={(form) => ({
        number: form.number,
        capacity: Number(form.capacity || 1),
        status: 'AVAILABLE',
        is_active: true,
      })}
    />
  );
}
