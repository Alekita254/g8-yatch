export const siteImages = {
  homeHero: {
    src: '/images/g8-luxury-terrace-hero.png',
    replaceWith: '/images/g8/home-hero.jpg',
    usedOn: 'Homepage hero',
    why: 'This is the first emotional signal. Use the best wide or portrait photo of the actual G8 hotel, restaurant terrace, garden or lit exterior.',
  },
  restaurantHero: {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=90',
    replaceWith: '/images/g8/restaurant-hero.jpg',
    usedOn: 'Food menu page hero',
    why: 'Use a real table spread, plated signature dish, drinks setup or guests dining at G8. This should make people hungry.',
  },
  hotelHero: {
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90',
    replaceWith: '/images/g8/hotel-hero.jpg',
    usedOn: 'Hotel rooms page hero',
    why: 'Use the cleanest actual room, exterior, bed setup, balcony, corridor or reception image. This answers whether guests can trust the stay.',
  },
  experiencesHero: {
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1800&q=90',
    replaceWith: '/images/g8/experiences-hero.jpg',
    usedOn: 'Experiences page hero',
    why: 'Use the garden, playground, family event, birthday setup or outdoor activity photo. This sells the day-out feeling.',
  },
  corporateHero: {
    src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=90',
    replaceWith: '/images/g8/corporate-hero.jpg',
    usedOn: 'Corporate page hero',
    why: 'Use a real conference setup, meeting room, training layout or team-building group photo. This proves G8 can host organized groups.',
  },
  cabroHero: {
    src: '/images/cabro-standard-60mm.png',
    replaceWith: '/images/g8/cabro-hero.jpg',
    usedOn: 'Cabro page hero and homepage cabro tile',
    why: 'Use the cabro yard, stacked blocks, finished paving, delivery truck or installation photo. This should show product strength and scale.',
  },
  roomGarden: {
    src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/room-garden.jpg',
    usedOn: 'Garden View Room card',
    why: 'Use an actual bright room photo with the bed made, clean floor, window light and enough room context.',
  },
  roomFamily: {
    src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/room-family.jpg',
    usedOn: 'Garden Family Villa card',
    why: 'Use a real larger room, family room, lounge, extra beds or room detail that shows capacity and comfort.',
  },
  roomExecutive: {
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/room-executive.jpg',
    usedOn: 'Executive Family Room card',
    why: 'Use the most premium room or suite photo. This should justify the higher rate visually.',
  },
  accommodationActivity: {
    src: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-accommodation.jpg',
    usedOn: 'Experiences accommodation card',
    why: 'Use a room or reception photo that quickly reminds visitors they can stay over.',
  },
  conferenceActivity: {
    src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-conference.jpg',
    usedOn: 'Experiences conference card',
    why: 'Use a real hall, chairs, projector, meeting table or training setup from G8.',
  },
  gardenActivity: {
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-garden.jpg',
    usedOn: 'Experiences garden event card',
    why: 'Use the garden, decor setup, tent, birthday area or outdoor dining area.',
  },
  teamBuildingActivity: {
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-team-building.jpg',
    usedOn: 'Experiences team building card',
    why: 'Use a real group activity photo or open space photo that can support team-building enquiries.',
  },
  playgroundActivity: {
    src: 'https://images.unsplash.com/photo-1596997000103-e597b3ca50df?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-playground.jpg',
    usedOn: 'Experiences kids playground card',
    why: 'Use a real playground or family-friendly area. This helps parents immediately understand the children-friendly offer.',
  },
  foodActivity: {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85',
    replaceWith: '/images/g8/activity-food.jpg',
    usedOn: 'Experiences food and dining card',
    why: 'Use a real plate, table setting, buffet, drinks or restaurant scene from G8.',
  },
}

export const imageSlots = Object.entries(siteImages).map(([key, value]) => ({
  key,
  ...value,
}))
