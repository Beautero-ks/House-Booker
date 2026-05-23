export const MOCK_HOUSES = [
  {
    id: 'h1',
    title: 'Studio moderne à Dschang',
    location: 'Dschang, Quartier Nkouo',
    type: 'studio',
    price: 15000,
    rating: 4.5,
    reviewsCount: 23,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
    ],
    amenities: ['wifi', 'kitchen'],
    rooms: 1,
    bathrooms: 1,
    description: 'Studio moderne et élégant situé dans un environnement calme et sécurisé. Idéal pour étudiants ou professionnels en déplacement.',
    ownerId: 'o1'
  },
  {
    id: 'h2',
    title: 'Appartement 2 chambres',
    location: 'Dschang, Quartier Fongo',
    type: 'apartment',
    price: 25000,
    rating: 4.7,
    reviewsCount: 18,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
    ],
    amenities: ['wifi', 'parking', 'kitchen', 'tv'],
    rooms: 2,
    bathrooms: 2,
    description: 'Bel appartement spacieux de 2 chambres avec salon, cuisine équipée et parking sécurisé.',
    ownerId: 'o1'
  },
  {
    id: 'h3',
    title: 'Chambre confortable',
    location: 'Dschang, Quartier Foto',
    type: 'room',
    price: 8000,
    rating: 4.2,
    reviewsCount: 12,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
    ],
    amenities: ['wifi'],
    rooms: 1,
    bathrooms: 1,
    description: 'Chambre simple mais très confortable dans une résidence étudiante.',
    ownerId: 'o2'
  },
  {
    id: 'h4',
    title: 'Villa de luxe avec piscine',
    location: 'Yaoundé, Bastos',
    type: 'villa',
    price: 150000,
    rating: 4.9,
    reviewsCount: 45,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
    ],
    amenities: ['wifi', 'parking', 'kitchen', 'ac', 'pool', 'tv'],
    rooms: 5,
    bathrooms: 4,
    description: 'Magnifique villa haut de standing avec piscine privée, jardin et service de sécurité 24/7.',
    ownerId: 'o3'
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'r1',
    houseId: 'h1',
    userName: 'Jean Dupont',
    userImage: 'https://i.pravatar.cc/150?u=jean',
    rating: 5,
    comment: 'Excellent séjour ! Logement propre, bien situé et hôte très réactif.',
    date: '2024-05-15'
  },
  {
    id: 'r2',
    houseId: 'h1',
    userName: 'Marie Claire',
    userImage: 'https://i.pravatar.cc/150?u=marie',
    rating: 4,
    comment: 'Très bien, je recommande. Le logement correspondait parfaitement à la description.',
    date: '2024-04-10'
  },
  {
    id: 'r3',
    houseId: 'h1',
    userName: 'Luc Martin',
    userImage: 'https://i.pravatar.cc/150?u=luc',
    rating: 4,
    comment: 'Bon rapport qualité/prix. Je reviendrai sans hésiter.',
    date: '2024-03-22'
  }
];

export const MOCK_BOOKINGS = [
  {
    id: 'b1',
    houseId: 'h1',
    houseTitle: 'Studio moderne à Dschang',
    guestName: 'Jean Dupont',
    startDate: '2024-06-12',
    endDate: '2024-06-14',
    status: 'CONFIRMED',
    totalPrice: 31000
  },
  {
    id: 'b2',
    houseId: 'h2',
    houseTitle: 'Appartement 2 chambres',
    guestName: 'Marie Claire',
    startDate: '2024-06-15',
    endDate: '2024-06-18',
    status: 'PENDING',
    totalPrice: 75000
  }
];

export const MOCK_STATS_OWNER = {
  totalListings: 12,
  monthlyBookings: 28,
  occupancyRate: 85,
  monthlyRevenue: 450000,
  chartData: [
    { name: '12 Mai', bookings: 2 },
    { name: '19 Mai', bookings: 5 },
    { name: '26 Mai', bookings: 8 },
    { name: '02 Juin', bookings: 4 },
    { name: '09 Juin', bookings: 9 }
  ]
};

export const MOCK_STATS_ADMIN = {
  totalUsers: 1254,
  totalListings: 320,
  totalBookings: 842,
  totalRevenue: 12450000,
  chartData: [
    { name: '12 Mai', bookings: 20 },
    { name: '19 Mai', bookings: 35 },
    { name: '26 Mai', bookings: 48 },
    { name: '02 Juin', bookings: 40 },
    { name: '09 Juin', bookings: 59 }
  ]
};

export const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    userName: 'Jean Dupont',
    userImage: 'https://i.pravatar.cc/150?u=jean',
    lastMessage: 'Parfait, je vais procéder à la réservation.',
    time: '14:30',
    unread: 2,
    houseTitle: 'Studio moderne à Dschang'
  },
  {
    id: 'c2',
    userName: 'Marie Claire',
    userImage: 'https://i.pravatar.cc/150?u=marie',
    lastMessage: 'Est-ce que le wifi est haut débit ?',
    time: 'Hier',
    unread: 0,
    houseTitle: 'Appartement 2 chambres'
  }
];

export const MOCK_MESSAGES = [
  {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'guest',
    text: 'Bonjour, est-ce que le logement est toujours disponible pour ces dates ?',
    time: '14:20'
  },
  {
    id: 'm2',
    conversationId: 'c1',
    senderId: 'me',
    text: "Oui, il est toujours disponible ! N'hésitez pas si vous avez d'autres questions.",
    time: '14:25'
  },
  {
    id: 'm3',
    conversationId: 'c1',
    senderId: 'guest',
    text: 'Parfait, je vais procéder à la réservation.',
    time: '14:30'
  }
];
