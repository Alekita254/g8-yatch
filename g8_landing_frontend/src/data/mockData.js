export const rooms = [
  {
    id: 1,
    name: 'Lake View Suite',
    price: 18500,
    guests: 2,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
    amenities: ['King bed', 'Lake balcony', 'Breakfast'],
  },
  {
    id: 2,
    name: 'Garden Family Villa',
    price: 28000,
    guests: 6,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    amenities: ['2 bedrooms', 'Private lounge', 'Garden'],
  },
  {
    id: 3,
    name: 'Marina Penthouse',
    price: 32000,
    guests: 4,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    amenities: ['Jetty view', 'Private terrace', 'Butler service'],
  },
]

export const menuItems = [
  { id: 101, category: 'Starters', name: 'Garden Avocado Salad', description: 'Avocado, cucumber, herbs and citrus.', price: 850, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85' },
  { id: 102, category: 'Starters', name: 'Crispy Calamari', description: 'Lemon, chilli and coriander aioli.', price: 1250, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85' },
  { id: 103, category: 'Mains', name: 'Grilled Tilapia', description: 'Ugali, sukuma wiki and tomato kachumbari.', price: 1800, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85' },
  { id: 104, category: 'Mains', name: 'Charred Beef Fillet', description: 'Potato fondant and seasonal vegetables.', price: 2600, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85' },
  { id: 105, category: 'Mains', name: 'Coconut Vegetable Curry', description: 'Fragrant rice, cashew and coriander.', price: 1450, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85' },
  { id: 106, category: 'Drinks', name: 'Classic Dawa', description: 'Vodka, lime, honey and crushed ice.', price: 950, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85' },
  { id: 107, category: 'Drinks', name: 'Fresh Passion Juice', description: 'Pressed to order and served chilled.', price: 550, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85' },
]

export const corporateExperiences = [
  { title: 'Conference Hall', text: 'Flexible hall layouts for strategic sessions, workshops and annual gatherings.' },
  { title: 'Team Building', text: 'Facilitated outdoor challenges, garden activities and shared dining.' },
  { title: 'Executive Meetings', text: 'Private boardroom setups with discreet service and reliable connectivity.' },
  { title: 'Trainings', text: 'Day and residential packages with meals, equipment and accommodation.' },
]

export const activities = [
  {
    id: 'accommodation',
    title: 'Accommodation',
    eyebrow: 'Stay over',
    text: 'Comfortable rooms for couples, families, business travellers and residential groups.',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
    action: 'View rooms',
    path: '/hotel',
  },
  {
    id: 'conference-hall',
    title: 'Conference Hall',
    eyebrow: 'Meet with purpose',
    text: 'A flexible venue for conferences, meetings, trainings, presentations and workshops.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85',
    action: 'Request a proposal',
    enquiryType: 'Conference Hall',
  },
  {
    id: 'events-garden',
    title: 'Events & Garden',
    eyebrow: 'Celebrate outdoors',
    text: 'A welcoming green setting for birthdays, receptions, family days and private celebrations.',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    action: 'Plan an event',
    enquiryType: 'Garden Event',
  },
  {
    id: 'team-building',
    title: 'Team Building',
    eyebrow: 'Connect as a team',
    text: 'Outdoor challenges, facilitated activities, meals and optional accommodation for your group.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85',
    action: 'Plan team building',
    enquiryType: 'Team Building',
  },
  {
    id: 'kids-playground',
    title: 'Kids Playground',
    eyebrow: 'Made for little guests',
    text: 'A dedicated play area where children can have fun while families relax and dine nearby.',
    image: 'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?auto=format&fit=crop&w=1200&q=85',
    action: 'Ask about family visits',
    enquiryType: 'Kids Playground / Family Visit',
  },
  {
    id: 'food-dining',
    title: 'Food & Dining',
    eyebrow: 'Share a meal',
    text: 'Freshly prepared food for walk-in guests, hotel stays, events and corporate groups.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85',
    action: 'Explore the menu',
    path: '/menu',
  },
]

export const cabroProducts = [
  {
    id: 201,
    name: '60mm Standard Cabro',
    finish: 'Smooth finish',
    pricePerSqm: 1450,
    coveragePerPack: 1.2,
    colors: ['Charcoal', 'Terracotta', 'Natural'],
    image: 'https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 202,
    name: '80mm Heavy Duty Cabro',
    finish: 'Industrial strength',
    pricePerSqm: 1950,
    coveragePerPack: 1,
    colors: ['Charcoal', 'Natural'],
    image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 203,
    name: 'Cobble Stone Paver',
    finish: 'Textured heritage',
    pricePerSqm: 2200,
    coveragePerPack: 0.8,
    colors: ['Terracotta', 'Slate', 'Sand'],
    image: 'https://images.unsplash.com/photo-1596998791568-386ef5297c2e?auto=format&fit=crop&w=1000&q=85',
  },
]
