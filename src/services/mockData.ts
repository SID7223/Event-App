import { Event, User, Ticket, Booking, Notification, VibeCategory, Movie, Cinema, MovieShowtime, MovieWithShowtimes, Restaurant, Venue, Organizer, Friend, PakistanCity } from '../types';

// Unified vibe categories (Event/Social Vibes)
export const allVibes: VibeCategory[] = [
  { id: 'live_music', label: 'Live Music', icon: 'musical-notes', categories: ['Music', 'Concerts', 'Qawwali'] },
  { id: 'nightlife', label: 'Nightlife & DJs', icon: 'headphones', categories: ['Nightlife', 'DJ', 'Parties', 'Electronic'] },
  { id: 'comedy', label: 'Comedy & Mic', icon: 'happy', categories: ['Comedy', 'Standup', 'Open Mic'] },
  { id: 'tech', label: 'Tech & Startups', icon: 'briefcase', categories: ['Tech', 'Startups', 'Networking', 'Pitch Nights'] },
  { id: 'wellness', label: 'Wellness', icon: 'leaf', categories: ['Wellness', 'Yoga', 'Marathons', 'Retreats'] },
  { id: 'arts_culture', label: 'Arts & Culture', icon: 'color-palette', categories: ['Art', 'Theater', 'Heritage', 'Exhibitions'] },
  { id: 'popups_festivals', label: 'Pop-ups & Fest', icon: 'sparkles', categories: ['Festivals', 'Food Festivals', 'Flea Markets', 'Pop-ups'] },
  { id: 'workshops', label: 'Workshops', icon: 'book', categories: ['Workshops', 'Masterclasses', 'Skill Learning'] },
  { id: 'poetry', label: 'Poetry & Literary', icon: 'pen', categories: ['Poetry', 'Mushaira', 'Baithak', 'Storytelling'] },
  { id: 'fashion', label: 'Fashion & Lifestyle', icon: 'shirt', categories: ['Fashion', 'Thrift', 'Brand Exhibits', 'Lifestyle'] },
  { id: 'screenings', label: 'Match Screenings', icon: 'football', categories: ['Screenings', 'PSL', 'World Cup', 'Watch Parties'] },
  { id: 'gaming', label: 'Gaming & E-Sports', icon: 'game-controller', categories: ['Gaming', 'E-Sports', 'Tournaments', 'Board Games'] },
];

// Helper to sort vibes based on user preferences
export const sortVibesByPreferences = (userPreferences: string[]): VibeCategory[] => {
  const preferred = allVibes.filter(v => 
    userPreferences.some(p => 
      p.toLowerCase().includes(v.id.toLowerCase()) || 
      v.id.toLowerCase().includes(p.toLowerCase()) ||
      p.toLowerCase().includes(v.label.toLowerCase()) ||
      v.label.toLowerCase().includes(p.toLowerCase())
    )
  );
  const others = allVibes.filter(v => 
    !userPreferences.some(p => 
      p.toLowerCase().includes(v.id.toLowerCase()) || 
      v.id.toLowerCase().includes(p.toLowerCase()) ||
      p.toLowerCase().includes(v.label.toLowerCase()) ||
      v.label.toLowerCase().includes(p.toLowerCase())
    )
  );
  return [...preferred, ...others];
};

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Jakarta Music Festival 2026',
    description: 'Indonesia\'s biggest music festival featuring international and local artists across 3 stages. Experience 24 hours of non-stop music with over 50 performances.',
    category: 'Music',
    image: 'https://picsum.photos/seed/concert1/400/600',
    price: 250,
    location: 'Gelora Bung Karno, Jakarta',
    date: '2026-07-15',
    time: '14:00',
    organizer: 'Live Nation Indonesia',
    organizerId: 'org-001',
    venue: 'GBK Main Stadium',
    venueId: 'ven-001',
    attendees: 45000,
    rating: 4.8,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Senayan',
  },
  {
    id: '2',
    title: 'Bali Art Biennale',
    description: 'A curated exhibition showcasing contemporary Indonesian art alongside international installations. Featuring 120 artists from 25 countries.',
    category: 'Art',
    image: 'https://picsum.photos/seed/artexhibit3/400/600',
    price: 45,
    location: 'Museum MACAN, Bali',
    date: '2026-07-20',
    time: '10:00',
    organizer: 'Indonesia Art Foundation',
    venue: 'Museum MACAN Bali',
    attendees: 2500,
    rating: 4.7,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Kuta',
  },
  {
    id: '3',
    title: 'Comedy Night Live Jakarta',
    description: 'An evening of laughter with top Indonesian comedians and special international guest performers. Doors open at 6 PM.',
    category: 'Comedy',
    image: 'https://picsum.photos/seed/comedyshow4/400/600',
    price: 75,
    location: 'Balai Kartini, Jakarta',
    date: '2026-07-14',
    time: '19:00',
    organizer: 'Laugh Factory Asia',
    organizerId: 'org-002',
    venue: 'Balai Kartini Grand Ballroom',
    venueId: 'ven-002',
    attendees: 1200,
    rating: 4.5,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Rasuna Said',
  },
  {
    id: '4',
    title: 'Jakarta Food Festival',
    description: 'Indonesia\'s largest culinary celebration with 200+ food stalls, celebrity chef demonstrations, and exclusive tasting sessions.',
    category: 'Food',
    image: 'https://picsum.photos/seed/foodfest5/400/600',
    price: 35,
    location: 'Ancol, Jakarta',
    date: '2026-07-18',
    time: '11:00',
    organizer: 'Indonesian Chef Association',
    organizerId: 'org-003',
    venue: 'Ancol Beach City',
    venueId: 'ven-003',
    attendees: 15000,
    rating: 4.4,
    isFavorite: true,
    isFeatured: true,
    neighborhood: 'Ancol',
  },
  {
    id: '5',
    title: 'Bandung Electronic Music Festival',
    description: 'Three days of electronic music in the cool highlands of Bandung. International DJs and local talent on 2 stages.',
    category: 'Music',
    image: 'https://picsum.photos/seed/festival7/400/600',
    price: 180,
    location: 'Dago Pakar, Bandung',
    date: '2026-08-12',
    time: '16:00',
    organizer: 'EDM Indonesia',
    organizerId: 'org-001',
    venue: 'Dago Dream Park',
    attendees: 6000,
    rating: 4.6,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Dago',
  },
  {
    id: '6',
    title: 'Nusa Penida Beach Party',
    description: 'Beach party paradise with live DJs, fire dancers, and stunning sunset views. Limited to 2000 attendees for exclusive experience.',
    category: 'Festivals',
    image: 'https://picsum.photos/seed/beachparty9/400/600',
    price: 120,
    location: 'Nusa Penida, Bali',
    date: '2026-07-25',
    time: '15:00',
    organizer: 'Bali Events Co',
    venue: 'Crystal Bay Beach',
    attendees: 2000,
    rating: 4.9,
    isFavorite: true,
    isFeatured: true,
    neighborhood: 'Nusa Penida',
  },
  {
    id: '7',
    title: 'Indonesian Indie Film Festival',
    description: 'Showcasing the best independent films from across the archipelago. 40 films, Q&A sessions, and industry panels.',
    category: 'Cinema',
    image: 'https://picsum.photos/seed/filmfest10/400/600',
    price: 55,
    location: 'CGV Grand Indonesia, Jakarta',
    date: '2026-07-16',
    time: '13:00',
    organizer: 'Indonesian Film Board',
    venue: 'CGV Grand Indonesia',
    attendees: 3000,
    rating: 4.7,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Thamrin',
  },
  {
    id: '8',
    title: 'Bandung Jazz Festival',
    description: 'Celebrating Indonesian jazz heritage with performances from legendary and emerging jazz musicians.',
    category: 'Music',
    image: 'https://picsum.photos/seed/jazzfes11/400/600',
    price: 95,
    location: 'Gedung Sate, Bandung',
    date: '2026-07-19',
    time: '17:00',
    organizer: 'Jazz Indonesia',
    venue: 'Gedung Sate Grounds',
    attendees: 4000,
    rating: 4.8,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Gedung Sate',
  },
  {
    id: '9',
    title: 'TechSummit Asia 2026',
    description: 'The premier technology conference in Southeast Asia. Join 300+ speakers covering AI, blockchain, cloud computing, and the future of work.',
    category: 'Tech',
    image: 'https://picsum.photos/seed/techconf2/400/600',
    price: 350,
    location: 'Jakarta Convention Center',
    date: '2026-07-22',
    time: '09:00',
    organizer: 'TechSummit Global',
    organizerId: 'org-004',
    venue: 'JCC Senayan',
    venueId: 'ven-004',
    attendees: 8000,
    rating: 4.6,
    isFavorite: true,
    isFeatured: true,
    neighborhood: 'Senayan',
  },
  {
    id: '10',
    title: 'Digital Marketing Summit',
    description: 'Learn the latest digital marketing strategies from industry leaders. Workshops, panels, and networking opportunities.',
    category: 'Business',
    image: 'https://picsum.photos/seed/bizconf6/400/600',
    price: 150,
    location: 'The Ritz-Carlton, Jakarta',
    date: '2026-07-17',
    time: '08:30',
    organizer: 'Digital Indonesia',
    venue: 'Ritz-Carlton Pacific Place',
    attendees: 600,
    rating: 4.3,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'SCBD',
  },
  {
    id: '11',
    title: 'Startup Weekend Jakarta',
    description: '54-hour event where developers, designers, and entrepreneurs come together to build innovative solutions.',
    category: 'Tech',
    image: 'https://picsum.photos/seed/startup8/400/600',
    price: 25,
    location: 'GoWork, Jakarta',
    date: '2026-07-21',
    time: '09:00',
    organizer: 'Techstars Community',
    venue: 'GoWork Pacific Place',
    attendees: 150,
    rating: 4.5,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'SCBD',
  },
  {
    id: '12',
    title: 'CEO Summit Bali 2026',
    description: 'Exclusive leadership summit for C-suite executives. Keynotes from global business leaders and strategic roundtables.',
    category: 'Business',
    image: 'https://picsum.photos/seed/ceosummit12/400/600',
    price: 299,
    location: 'The Mulia, Bali',
    date: '2026-08-14',
    time: '08:00',
    organizer: 'Business Leadership Forum',
    venue: 'The Mulia Resort',
    attendees: 400,
    rating: 4.9,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Nusa Dua',
  },
  {
    id: '13',
    title: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop covering practical AI applications. Build real-world models with expert guidance.',
    category: 'Tech',
    image: 'https://picsum.photos/seed/aiworkshop/400/600',
    price: 200,
    location: 'Google Office, Jakarta',
    date: '2026-07-23',
    time: '10:00',
    organizer: 'AI Indonesia',
    venue: 'Google Indonesia HQ',
    attendees: 100,
    rating: 4.8,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Menteng',
  },
  {
    id: '14',
    title: 'Photography Workshop',
    description: 'Master the art of photography with professional photographers. Learn composition, lighting, and editing techniques.',
    category: 'Workshops',
    image: 'https://picsum.photos/seed/photo/400/600',
    price: 80,
    location: 'Jakarta Art Center',
    date: '2026-07-24',
    time: '14:00',
    organizer: 'Photo Indonesia',
    venue: 'Gedung Kesenian',
    attendees: 50,
    rating: 4.6,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Grogol',
  },
  {
    id: '15',
    title: 'Badminton Tournament',
    description: 'Annual badminton tournament featuring top players from across the region. Spectators welcome!',
    category: 'Sports',
    image: 'https://picsum.photos/seed/badminton/400/600',
    price: 20,
    location: 'Istora Senayan, Jakarta',
    date: '2026-07-26',
    time: '09:00',
    organizer: 'Badminton Indonesia',
    venue: 'Istora Senayan',
    attendees: 5000,
    rating: 4.7,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'Senayan',
  },
];

export const mockUser: User = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+62 812 3456 7890',
  avatar: 'https://picsum.photos/seed/avatar/200/200',
  interests: ['Music', 'Art', 'Technology', 'Festival'],
  notifications: true,
  plan: 'basic',
};

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-001',
    eventId: '1',
    userId: 'user-001',
    type: 'VIP',
    price: 250,
    quantity: 2,
    seat: 'VIP-A12',
    qrCode: 'TKT-2026-JKT-MF-001',
    status: 'upcoming',
    purchaseDate: '2026-02-01',
  },
  {
    id: 'ticket-002',
    eventId: '9',
    userId: 'user-001',
    type: 'Regular',
    price: 350,
    quantity: 1,
    seat: 'B-24',
    qrCode: 'TKT-2026-JKT-TS-002',
    status: 'upcoming',
    purchaseDate: '2026-03-10',
  },
  {
    id: 'ticket-003',
    eventId: '3',
    userId: 'user-001',
    type: 'Standard',
    price: 75,
    quantity: 2,
    seat: 'C-08',
    qrCode: 'TKT-2026-JKT-CN-003',
    status: 'upcoming',
    purchaseDate: '2026-03-05',
  },
  {
    id: 'ticket-004',
    eventId: '4',
    userId: 'user-001',
    type: 'General',
    price: 35,
    quantity: 4,
    seat: 'GA-001',
    qrCode: 'TKT-2026-JKT-FF-004',
    status: 'upcoming',
    purchaseDate: '2026-04-20',
  },
  {
    id: 'ticket-005',
    eventId: '2',
    userId: 'user-001',
    type: 'Standard',
    price: 45,
    quantity: 2,
    seat: 'D-15',
    qrCode: 'TKT-2026-BLI-AB-005',
    status: 'past',
    purchaseDate: '2025-12-15',
  },
  {
    id: 'ticket-006',
    eventId: '5',
    userId: 'user-001',
    type: 'Weekend Pass',
    price: 180,
    quantity: 1,
    seat: 'GA-045',
    qrCode: 'TKT-2026-BDG-EM-006',
    status: 'cancelled',
    purchaseDate: '2026-01-20',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Booking Confirmed',
    message: 'Your ticket for Jakarta Music Festival 2026 has been confirmed. Check your email for details.',
    time: '2026-02-01T10:30:00',
    read: true,
    type: 'booking',
    icon: 'checkmark-circle',
  },
  {
    id: 'notif-002',
    title: 'Event Reminder',
    message: 'Jakarta Music Festival 2026 starts in 3 days. Don\'t forget to bring your ID and ticket.',
    time: '2026-07-12T08:00:00',
    read: false,
    type: 'reminder',
    icon: 'alarm',
  },
  {
    id: 'notif-003',
    title: 'Special Offer',
    message: 'Get 20% off on TechSummit Asia 2026 with code TECH20. Limited time offer!',
    time: '2026-07-01T14:00:00',
    read: false,
    type: 'promotion',
    icon: 'pricetag',
  },
  {
    id: 'notif-004',
    title: 'Booking Confirmed',
    message: 'Your tickets for Comedy Night Live Jakarta are ready. See you there!',
    time: '2026-07-05T16:45:00',
    read: true,
    type: 'booking',
    icon: 'checkmark-circle',
  },
  {
    id: 'notif-005',
    title: 'Event Update',
    message: 'TechSummit Asia 2026 has added 5 new speakers. Check out the updated lineup!',
    time: '2026-07-10T09:15:00',
    read: false,
    type: 'update',
    icon: 'information-circle',
  },
  {
    id: 'notif-006',
    title: 'Payment Failed',
    message: 'Your payment for Bandung Electronic Music Festival could not be processed. Please try again.',
    time: '2026-01-25T11:30:00',
    read: true,
    type: 'error',
    icon: 'alert-circle',
  },
  {
    id: 'notif-007',
    title: 'New Events Near You',
    message: '3 new events in your area match your interests. Check them out now!',
    time: '2026-07-01T07:00:00',
    read: false,
    type: 'recommendation',
    icon: 'compass',
  },
  {
    id: 'notif-008',
    title: 'Review Request',
    message: 'How was the Bali Art Biennale? Leave a review and help others discover great events.',
    time: '2025-12-20T12:00:00',
    read: true,
    type: 'feedback',
    icon: 'chatbubble',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    eventId: '1',
    tickets: [mockTickets[0]],
    totalAmount: 500,
    paymentMethod: 'Credit Card',
    status: 'confirmed',
    date: '2026-02-01',
  },
  {
    id: 'booking-002',
    eventId: '9',
    tickets: [mockTickets[1]],
    totalAmount: 350,
    paymentMethod: 'GoPay',
    status: 'confirmed',
    date: '2026-03-10',
  },
  {
    id: 'booking-003',
    eventId: '3',
    tickets: [mockTickets[2]],
    totalAmount: 150,
    paymentMethod: 'OVO',
    status: 'confirmed',
    date: '2026-03-05',
  },
  {
    id: 'booking-004',
    eventId: '4',
    tickets: [mockTickets[3]],
    totalAmount: 140,
    paymentMethod: 'Debit Card',
    status: 'confirmed',
    date: '2026-04-20',
  },
];

// ==================== CINEMA DATA ====================

export const mockCinemas: Cinema[] = [
  {
    id: 'cine-001',
    name: 'CGV Grand Indonesia',
    address: 'Jl. M.H. Thamrin No.1, Jakarta',
    distance: '1.2 km',
    neighborhood: 'Thamrin',
  },
  {
    id: 'cine-002',
    name: 'XXI Plaza Senayan',
    address: 'Jl. Asia Afrika No.8, Jakarta',
    distance: '2.5 km',
    neighborhood: 'Senayan',
  },
  {
    id: 'cine-003',
    name: 'Cinemaxx Central Park',
    address: 'Jl. Letjen S. Parman No.28, Jakarta',
    distance: '4.1 km',
    neighborhood: 'Grogol',
  },
  {
    id: 'cine-004',
    name: 'CGV Pondok Indah',
    address: 'Jl. Sultan Iskandar Muda, Jakarta',
    distance: '6.8 km',
    neighborhood: 'Pondok Indah',
  },
];

export const mockMovies: Movie[] = [
  {
    id: 'mov-001',
    title: 'Galactic Horizons',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    duration: 148,
    rating: 4.7,
    poster: 'https://picsum.photos/seed/movie1/400/600',
    releaseDate: '2026-06-28',
    synopsis: 'A team of astronauts embarks on humanity\'s deepest space exploration, encountering phenomena that challenge everything we know about the universe.',
    director: 'Elena Vasquez',
    cast: ['Marcus Chen', 'Aisha Patel', 'James Okoye'],
    ageRating: 'PG-13',
  },
  {
    id: 'mov-002',
    title: 'The Last Monsoon',
    genre: ['Drama', 'Romance'],
    duration: 132,
    rating: 4.5,
    poster: 'https://picsum.photos/seed/movie2/400/600',
    releaseDate: '2026-07-05',
    synopsis: 'Two strangers find love during the final monsoon season in a world grappling with climate change.',
    director: 'Ravi Kapoor',
    cast: ['Luna Zhao', 'Dev Sharma', 'Maya Sari'],
    ageRating: 'PG',
  },
  {
    id: 'mov-003',
    title: 'Shadow Protocol',
    genre: ['Action', 'Thriller'],
    duration: 119,
    rating: 4.3,
    poster: 'https://picsum.photos/seed/movie3/400/600',
    releaseDate: '2026-07-12',
    synopsis: 'A disgraced spy must prevent a catastrophic cyberattack while evading both enemy agents and her own government.',
    director: 'Kim Tanaka',
    cast: ['Sofia Reyes', 'Alex Turner', 'Hiro Nakamura'],
    ageRating: 'R',
  },
  {
    id: 'mov-004',
    title: 'Laughing Matters',
    genre: ['Comedy', 'Drama'],
    duration: 105,
    rating: 4.6,
    poster: 'https://picsum.photos/seed/movie4/400/600',
    releaseDate: '2026-07-10',
    synopsis: 'An aging comedian rediscovers her voice through an unlikely friendship with a young street performer.',
    director: 'Patricia Morales',
    cast: ['Diane Foster', 'Kevin Park', 'Amara Johnson'],
    ageRating: 'PG-13',
  },
  {
    id: 'mov-005',
    title: 'Deep Blue',
    genre: ['Documentary', 'Adventure'],
    duration: 92,
    rating: 4.8,
    poster: 'https://picsum.photos/seed/movie5/400/600',
    releaseDate: '2026-07-08',
    synopsis: 'A breathtaking journey into the deepest ocean trenches, revealing alien-like creatures never seen before.',
    director: 'James Calloway',
    cast: [],
    ageRating: 'G',
  },
  {
    id: 'mov-006',
    title: 'Neon Nights',
    genre: ['Sci-Fi', 'Noir'],
    duration: 141,
    rating: 4.4,
    poster: 'https://picsum.photos/seed/movie6/400/600',
    releaseDate: '2026-07-18',
    synopsis: 'In a rain-soaked megacity, a private detective unravels a conspiracy that blurs the line between human and machine.',
    director: 'Takeshi Okamura',
    cast: ['Rina Sato', 'David Blake', 'Leila Hassan'],
    ageRating: 'R',
  },
  {
    id: 'mov-007',
    title: 'The Cartographer\'s Daughter',
    genre: ['Fantasy', 'Adventure'],
    duration: 155,
    rating: 4.7,
    poster: 'https://picsum.photos/seed/movie7/400/600',
    releaseDate: '2026-07-15',
    synopsis: 'A young mapmaker discovers her late father\'s final map leads to a realm between worlds.',
    director: 'Clara Dubois',
    cast: ['Nadia El-Amin', 'Theo Van Dorn', 'Suki Zhang'],
    ageRating: 'PG-13',
  },
  {
    id: 'mov-008',
    title: 'Circuit Breaker',
    genre: ['Action', 'Tech-Thriller'],
    duration: 127,
    rating: 4.2,
    poster: 'https://picsum.photos/seed/movie8/400/600',
    releaseDate: '2026-07-22',
    synopsis: 'A white-hat hacker is recruited to stop a rogue AI that has taken control of the global financial system.',
    director: 'Liam O\'Brien',
    cast: ['Rami Hassan', 'Eva Liu', 'Carlos Mendes'],
    ageRating: 'PG-13',
  },
  {
    id: 'mov-009',
    title: 'Harvest Moon',
    genre: ['Drama', 'Family'],
    duration: 110,
    rating: 4.9,
    poster: 'https://picsum.photos/seed/movie9/400/600',
    releaseDate: '2026-07-01',
    synopsis: 'Three estranged siblings reunite at their childhood rice farm for the annual harvest festival.',
    director: 'Amira Rashid',
    cast: ['Wei Tanaka', 'Yuki Sato', 'Mei Ling'],
    ageRating: 'PG',
  },
];

export const mockShowtimes: MovieShowtime[] = [
  // mov-001 - Galactic Horizons at multiple cinemas
  { id: 'st-001', movieId: 'mov-001', cinemaId: 'cine-001', date: '2026-07-01', time: '10:30', format: 'IMAX', price: 95, availableSeats: 45 },
  { id: 'st-002', movieId: 'mov-001', cinemaId: 'cine-001', date: '2026-07-01', time: '14:00', format: 'IMAX', price: 95, availableSeats: 22 },
  { id: 'st-003', movieId: 'mov-001', cinemaId: 'cine-001', date: '2026-07-01', time: '17:30', format: '3D', price: 75, availableSeats: 38 },
  { id: 'st-004', movieId: 'mov-001', cinemaId: 'cine-002', date: '2026-07-01', time: '11:00', format: '3D', price: 75, availableSeats: 52 },
  { id: 'st-005', movieId: 'mov-001', cinemaId: 'cine-002', date: '2026-07-01', time: '15:30', format: '2D', price: 55, availableSeats: 67 },
  { id: 'st-006', movieId: 'mov-001', cinemaId: 'cine-003', date: '2026-07-01', time: '13:00', format: '3D', price: 70, availableSeats: 30 },
  // mov-002 - The Last Monsoon
  { id: 'st-007', movieId: 'mov-002', cinemaId: 'cine-001', date: '2026-07-01', time: '11:30', format: '2D', price: 55, availableSeats: 60 },
  { id: 'st-008', movieId: 'mov-002', cinemaId: 'cine-001', date: '2026-07-01', time: '16:00', format: '2D', price: 55, availableSeats: 41 },
  { id: 'st-009', movieId: 'mov-002', cinemaId: 'cine-002', date: '2026-07-01', time: '13:15', format: '2D', price: 55, availableSeats: 55 },
  { id: 'st-010', movieId: 'mov-002', cinemaId: 'cine-003', date: '2026-07-01', time: '19:00', format: '2D', price: 50, availableSeats: 34 },
  // mov-003 - Shadow Protocol
  { id: 'st-011', movieId: 'mov-003', cinemaId: 'cine-001', date: '2026-07-01', time: '12:45', format: '3D', price: 75, availableSeats: 28 },
  { id: 'st-012', movieId: 'mov-003', cinemaId: 'cine-002', date: '2026-07-01', time: '18:30', format: '2D', price: 55, availableSeats: 45 },
  { id: 'st-013', movieId: 'mov-003', cinemaId: 'cine-004', date: '2026-07-01', time: '20:00', format: 'IMAX', price: 90, availableSeats: 18 },
  // mov-004 - Laughing Matters
  { id: 'st-014', movieId: 'mov-004', cinemaId: 'cine-001', date: '2026-07-01', time: '10:00', format: '2D', price: 50, availableSeats: 72 },
  { id: 'st-015', movieId: 'mov-004', cinemaId: 'cine-003', date: '2026-07-01', time: '14:30', format: '2D', price: 50, availableSeats: 40 },
  // mov-005 - Deep Blue
  { id: 'st-016', movieId: 'mov-005', cinemaId: 'cine-002', date: '2026-07-01', time: '11:00', format: '2D', price: 45, availableSeats: 58 },
  { id: 'st-017', movieId: 'mov-005', cinemaId: 'cine-004', date: '2026-07-01', time: '15:00', format: '3D', price: 70, availableSeats: 33 },
  // mov-006 - Neon Nights
  { id: 'st-018', movieId: 'mov-006', cinemaId: 'cine-001', date: '2026-07-01', time: '20:30', format: '2D', price: 55, availableSeats: 42 },
  { id: 'st-019', movieId: 'mov-006', cinemaId: 'cine-002', date: '2026-07-01', time: '21:00', format: 'IMAX', price: 90, availableSeats: 15 },
  // mov-007 - The Cartographer's Daughter
  { id: 'st-020', movieId: 'mov-007', cinemaId: 'cine-001', date: '2026-07-01', time: '12:00', format: '3D', price: 75, availableSeats: 36 },
  { id: 'st-021', movieId: 'mov-007', cinemaId: 'cine-003', date: '2026-07-01', time: '16:30', format: '2D', price: 55, availableSeats: 48 },
  { id: 'st-022', movieId: 'mov-007', cinemaId: 'cine-004', date: '2026-07-01', time: '14:00', format: '3D', price: 75, availableSeats: 29 },
  // mov-008 - Circuit Breaker
  { id: 'st-023', movieId: 'mov-008', cinemaId: 'cine-002', date: '2026-07-01', time: '13:45', format: '2D', price: 55, availableSeats: 50 },
  { id: 'st-024', movieId: 'mov-008', cinemaId: 'cine-001', date: '2026-07-01', time: '19:15', format: '3D', price: 75, availableSeats: 24 },
  // mov-009 - Harvest Moon
  { id: 'st-025', movieId: 'mov-009', cinemaId: 'cine-001', date: '2026-07-01', time: '10:15', format: '2D', price: 45, availableSeats: 65 },
  { id: 'st-026', movieId: 'mov-009', cinemaId: 'cine-003', date: '2026-07-01', time: '12:30', format: '2D', price: 45, availableSeats: 53 },
  { id: 'st-027', movieId: 'mov-009', cinemaId: 'cine-004', date: '2026-07-01', time: '17:00', format: '2D', price: 45, availableSeats: 44 },
];

// Helper: Group showtimes by movie_id, then by cinema
export const getMoviesWithShowtimes = (): MovieWithShowtimes[] => {
  return mockMovies.map(movie => {
    const movieShowtimes = mockShowtimes.filter(s => s.movieId === movie.id);
    const cinemaMap = new Map<string, { cinema: Cinema; showtimes: MovieShowtime[] }>();
    
    movieShowtimes.forEach(showtime => {
      const cinema = mockCinemas.find(c => c.id === showtime.cinemaId);
      if (!cinema) return;
      
      const existing = cinemaMap.get(showtime.cinemaId);
      if (existing) {
        existing.showtimes.push(showtime);
      } else {
        cinemaMap.set(showtime.cinemaId, {
          cinema,
          showtimes: [showtime],
        });
      }
    });
    
    return {
      ...movie,
      cinemas: Array.from(cinemaMap.values()),
    };
  });
};

// ==================== RESTAURANT DATA ====================

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-001',
    name: 'Warung Babi Guling Ibu Oka',
    cuisine: 'Indonesian',
    image: 'https://picsum.photos/seed/restaurant1/400/300',
    priceRange: '$',
    rating: 4.6,
    reviewCount: 1280,
    address: 'Jl. Teuku Umar No.32, Jakarta',
    neighborhood: 'Menteng',
    distance: '1.8 km',
    phone: '+62 21 3192 6274',
    isOpen: true,
    hasLiveMusic: false,
    openingHours: '10:00 - 22:00',
    tags: ['Open Now', 'Popular'],
    featured: true,
  },
  {
    id: 'rest-002',
    name: 'Café Batavia',
    cuisine: 'International',
    image: 'https://picsum.photos/seed/restaurant2/400/300',
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 890,
    address: 'Jl. Pintu Besar Utara No.14, Jakarta',
    neighborhood: 'Kota Tua',
    distance: '3.2 km',
    phone: '+62 21 691 5531',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '08:00 - 23:00',
    tags: ['Open Now', 'Live Music Tonight', 'Historic'],
    featured: true,
  },
  {
    id: 'rest-003',
    name: 'Locavore To Go',
    cuisine: 'Modern Indonesian',
    image: 'https://picsum.photos/seed/restaurant3/400/300',
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 560,
    address: 'Jl. Dr. Ide Anak Agung Gde Agung, Jakarta',
    neighborhood: 'SCBD',
    distance: '2.1 km',
    phone: '+62 21 5795 8283',
    isOpen: true,
    hasLiveMusic: false,
    openingHours: '11:00 - 22:00',
    tags: ['Open Now', 'Farm to Table'],
    featured: false,
  },
  {
    id: 'rest-004',
    name: 'Pizza Marzano',
    cuisine: 'Italian',
    image: 'https://picsum.photos/seed/restaurant4/400/300',
    priceRange: '$$',
    rating: 4.4,
    reviewCount: 1540,
    address: 'Jl. Kemang Raya No.12, Jakarta',
    neighborhood: 'Kemang',
    distance: '5.3 km',
    phone: '+62 21 719 9234',
    isOpen: true,
    hasLiveMusic: false,
    openingHours: '10:00 - 23:00',
    tags: ['Open Now', 'Family Friendly'],
    featured: false,
  },
  {
    id: 'rest-005',
    name: 'Nusa Indonesian Gastronomy',
    cuisine: 'Indonesian Fine Dining',
    image: 'https://picsum.photos/seed/restaurant5/400/300',
    priceRange: '$$$$',
    rating: 4.9,
    reviewCount: 320,
    address: 'Jl. Gunawarman No.14, Jakarta',
    neighborhood: 'Senopati',
    distance: '4.7 km',
    phone: '+62 21 2751 2565',
    isOpen: false,
    hasLiveMusic: false,
    openingHours: '18:00 - 00:00',
    tags: ['Reservations Only', 'Fine Dining'],
    featured: true,
  },
  {
    id: 'rest-006',
    name: 'Kopi Anoman',
    cuisine: 'Café & Coffee',
    image: 'https://picsum.photos/seed/restaurant6/400/300',
    priceRange: '$',
    rating: 4.5,
    reviewCount: 2100,
    address: 'Jl. Cikini Raya No.73, Jakarta',
    neighborhood: 'Cikini',
    distance: '2.9 km',
    phone: '+62 21 3192 4567',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '07:00 - 22:00',
    tags: ['Open Now', 'Live Music Tonight', 'Cozy'],
    featured: false,
  },
  {
    id: 'rest-007',
    name: 'Bandar Djakarta',
    cuisine: 'Seafood',
    image: 'https://picsum.photos/seed/restaurant7/400/300',
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 3200,
    address: 'Jl. Baywalk Ancol, Jakarta',
    neighborhood: 'Ancol',
    distance: '7.5 km',
    phone: '+62 21 6471 0770',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '10:00 - 23:00',
    tags: ['Open Now', 'Live Music Tonight', 'Waterfront'],
    featured: false,
  },
  {
    id: 'rest-008',
    name: 'Sushi Sakura',
    cuisine: 'Japanese',
    image: 'https://picsum.photos/seed/restaurant8/400/300',
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 780,
    address: 'Jl. Rasuna Said Kav. B12, Jakarta',
    neighborhood: 'Rasuna Said',
    distance: '3.8 km',
    phone: '+62 21 252 0101',
    isOpen: true,
    hasLiveMusic: false,
    openingHours: '11:30 - 22:30',
    tags: ['Open Now', 'Authentic'],
    featured: false,
  },
  {
    id: 'rest-009',
    name: 'Mujigae Korean Restaurant',
    cuisine: 'Korean',
    image: 'https://picsum.photos/seed/restaurant9/400/300',
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 1120,
    address: 'Jl. Melawai Raya No.17, Jakarta',
    neighborhood: 'Blok M',
    distance: '4.2 km',
    phone: '+62 21 725 8890',
    isOpen: false,
    hasLiveMusic: false,
    openingHours: '11:00 - 22:00',
    tags: ['Korean BBQ', 'Popular'],
    featured: false,
  },
  {
    id: 'rest-010',
    name: 'The Junction Bar & Grill',
    cuisine: 'Western',
    image: 'https://picsum.photos/seed/restaurant10/400/300',
    priceRange: '$$$',
    rating: 4.4,
    reviewCount: 650,
    address: 'Jl. Sudirman Kav. 52-53, Jakarta',
    neighborhood: 'Senayan',
    distance: '2.5 km',
    phone: '+62 21 5785 2345',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '11:00 - 01:00',
    tags: ['Open Now', 'Live Music Tonight', 'Late Night'],
    featured: true,
  },
];

// Helper: Filter restaurants by criteria
export const filterRestaurants = (filters: {
  isOpen?: boolean;
  hasLiveMusic?: boolean;
  priceRange?: string;
  cuisine?: string;
  neighborhood?: string;
}): Restaurant[] => {
  return mockRestaurants.filter(restaurant => {
    if (filters.isOpen !== undefined && restaurant.isOpen !== filters.isOpen) return false;
    if (filters.hasLiveMusic !== undefined && restaurant.hasLiveMusic !== filters.hasLiveMusic) return false;
    if (filters.priceRange && restaurant.priceRange !== filters.priceRange) return false;
    if (filters.cuisine && !restaurant.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())) return false;
    if (filters.neighborhood && restaurant.neighborhood !== filters.neighborhood) return false;
    return true;
  });
};

// ==================== VENUE / ORGANIZER DATA ====================

export const mockVenues: Venue[] = [
  {
    id: 'ven-001',
    name: 'GBK Main Stadium',
    type: 'venue',
    logo: 'https://picsum.photos/seed/venue1logo/200/200',
    coverImage: 'https://picsum.photos/seed/venue1cover/800/400',
    bio: 'Indonesia\'s premier sports and entertainment stadium. Hosts world-class concerts, sports events, and cultural festivals with a capacity of 80,000.',
    address: 'Jl. Pintu Satu Senayan, Jakarta',
    neighborhood: 'Senayan',
    website: 'https://gbk.id',
    rating: 4.8,
    followerCount: 125000,
    eventCount: 48,
    tags: ['Stadium', 'Concerts', 'Sports', 'Festivals'],
  },
  {
    id: 'ven-002',
    name: 'Balai Kartini',
    type: 'venue',
    logo: 'https://picsum.photos/seed/venue2logo/200/200',
    coverImage: 'https://picsum.photos/seed/venue2cover/800/400',
    bio: 'Jakarta\'s iconic convention and exhibition center. Perfect for concerts, comedy shows, conferences, and cultural performances.',
    address: 'Jl. Jend. Gatot Subroto Kav. 37-38, Jakarta',
    neighborhood: 'Rasuna Said',
    website: 'https://balikartini.co.id',
    rating: 4.5,
    followerCount: 45000,
    eventCount: 32,
    tags: ['Convention Center', 'Concerts', 'Comedy', 'Exhibitions'],
  },
  {
    id: 'ven-003',
    name: 'Ancol Beach City',
    type: 'venue',
    logo: 'https://picsum.photos/seed/venue3logo/200/200',
    coverImage: 'https://picsum.photos/seed/venue3cover/800/400',
    bio: 'Waterfront entertainment complex at Ancol. Beach vibes, food festivals, live music, and family-friendly activities all year round.',
    address: 'Jl. Lodan Timur, Ancol, Jakarta',
    neighborhood: 'Ancol',
    website: 'https://ancol.com',
    rating: 4.4,
    followerCount: 89000,
    eventCount: 56,
    tags: ['Waterfront', 'Food Festivals', 'Family', 'Live Music'],
  },
  {
    id: 'ven-004',
    name: 'JCC Senayan',
    type: 'venue',
    logo: 'https://picsum.photos/seed/venue4logo/200/200',
    coverImage: 'https://picsum.photos/seed/venue4cover/800/400',
    bio: 'Jakarta Convention Center — the nation\'s flagship venue for international summits, tech conferences, trade shows, and exhibitions.',
    address: 'Jl. Gatot Subroto, Jakarta',
    neighborhood: 'Senayan',
    website: 'https://jcc.id',
    rating: 4.7,
    followerCount: 67000,
    eventCount: 41,
    tags: ['Convention Center', 'Tech', 'Summits', 'Exhibitions'],
  },
  {
    id: 'ven-005',
    name: 'Live Nation Indonesia',
    type: 'organizer',
    logo: 'https://picsum.photos/seed/org1logo/200/200',
    coverImage: 'https://picsum.photos/seed/org1cover/800/400',
    bio: 'Indonesia\'s leading live entertainment company. Bringing world-class concerts and festivals to Indonesian audiences since 2010.',
    address: 'SCBD, Jakarta',
    neighborhood: 'SCBD',
    website: 'https://livenation.co.id',
    rating: 4.9,
    followerCount: 210000,
    eventCount: 72,
    tags: ['Concerts', 'Festivals', 'International Artists', 'Music'],
  },
  {
    id: 'ven-006',
    name: 'Laugh Factory Asia',
    type: 'organizer',
    logo: 'https://picsum.photos/seed/org2logo/200/200',
    coverImage: 'https://picsum.photos/seed/org2cover/800/400',
    bio: 'Asia\'s premier comedy production company. Stand-up specials, comedy nights, and improvisation workshops across Southeast Asia.',
    address: 'Kemang, Jakarta',
    neighborhood: 'Kemang',
    website: 'https://laughfactory.asia',
    rating: 4.6,
    followerCount: 34000,
    eventCount: 28,
    tags: ['Comedy', 'Stand-up', 'Workshops', 'Improv'],
  },
  {
    id: 'ven-007',
    name: 'Indonesian Chef Association',
    type: 'organizer',
    logo: 'https://picsum.photos/seed/org3logo/200/200',
    coverImage: 'https://picsum.photos/seed/org3cover/800/400',
    bio: 'Celebrating Indonesian culinary excellence. Organizing food festivals, chef competitions, and culinary workshops nationwide.',
    address: 'Jakarta',
    neighborhood: 'Menteng',
    website: 'https://ica.id',
    rating: 4.5,
    followerCount: 56000,
    eventCount: 35,
    tags: ['Food', 'Culinary', 'Festivals', 'Chef Events'],
  },
  {
    id: 'ven-008',
    name: 'TechSummit Global',
    type: 'organizer',
    logo: 'https://picsum.photos/seed/org4logo/200/200',
    coverImage: 'https://picsum.photos/seed/org4cover/800/400',
    bio: 'Southeast Asia\'s premier technology conference series. Connecting innovators, entrepreneurs, and tech leaders across the region.',
    address: 'Singapore & Jakarta',
    neighborhood: 'SCBD',
    website: 'https://techsummit.asia',
    rating: 4.7,
    followerCount: 78000,
    eventCount: 24,
    tags: ['Tech', 'AI', 'Blockchain', 'Conferences'],
  },
];

// Helper: Get venue by ID
export const getVenueById = (id: string): Venue | undefined => {
  return mockVenues.find(v => v.id === id);
};

// Helper: Get events by venue ID
export const getEventsByVenue = (venueId: string): Event[] => {
  return mockEvents.filter(e => e.venueId === venueId);
};

// ==================== ORGANIZER DATA ====================

export const mockOrganizers: Organizer[] = [
  {
    id: 'org-001',
    name: 'Live Nation Indonesia',
    avatar: 'https://picsum.photos/seed/orgavatar1/200/200',
    coverImage: 'https://picsum.photos/seed/orgcover1/800/400',
    bio: 'Indonesia\'s leading live entertainment company. Bringing world-class concerts, festivals, and international artists to Indonesian audiences since 2010.',
    website: 'https://livenation.co.id',
    instagram: '@livenationid',
    rating: 4.9,
    followerCount: 210000,
    eventCount: 72,
    tags: ['Concerts', 'Festivals', 'International Artists', 'Music'],
  },
  {
    id: 'org-002',
    name: 'Laugh Factory Asia',
    avatar: 'https://picsum.photos/seed/orgavatar2/200/200',
    coverImage: 'https://picsum.photos/seed/orgcover2/800/400',
    bio: 'Asia\'s premier comedy production company. Stand-up specials, comedy nights, and improvisation workshops across Southeast Asia.',
    website: 'https://laughfactory.asia',
    instagram: '@laughfactoryasia',
    rating: 4.6,
    followerCount: 34000,
    eventCount: 28,
    tags: ['Comedy', 'Stand-up', 'Workshops', 'Improv'],
  },
  {
    id: 'org-003',
    name: 'Indonesian Chef Association',
    avatar: 'https://picsum.photos/seed/orgavatar3/200/200',
    coverImage: 'https://picsum.photos/seed/orgcover3/800/400',
    bio: 'Celebrating Indonesian culinary excellence. Organizing food festivals, chef competitions, and culinary workshops nationwide.',
    website: 'https://ica.id',
    instagram: '@indonesianchefassoc',
    rating: 4.5,
    followerCount: 56000,
    eventCount: 35,
    tags: ['Food', 'Culinary', 'Festivals', 'Chef Events'],
  },
  {
    id: 'org-004',
    name: 'TechSummit Global',
    avatar: 'https://picsum.photos/seed/orgavatar4/200/200',
    coverImage: 'https://picsum.photos/seed/orgcover4/800/400',
    bio: 'Southeast Asia\'s premier technology conference series. Connecting innovators, entrepreneurs, and tech leaders across the region.',
    website: 'https://techsummit.asia',
    instagram: '@techsummitasia',
    rating: 4.7,
    followerCount: 78000,
    eventCount: 24,
    tags: ['Tech', 'AI', 'Blockchain', 'Conferences'],
  },
];

// Helper: Get organizer by ID
export const getOrganizerById = (id: string): Organizer | undefined => {
  return mockOrganizers.find(o => o.id === id);
};

// Helper: Get events by organizer ID
export const getEventsByOrganizer = (organizerId: string): Event[] => {
  return mockEvents.filter(e => e.organizerId === organizerId);
};

// ==================== PAKISTAN SEED DATA ====================

export const pakistanOrganizers: Organizer[] = [
  {
    id: 'pak-org-1',
    name: 'Pakistan Comedy Association',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    bio: 'Bringing the best stand-up comedy and improv shows to Karachi and Lahore.',
    website: 'https://ticketwala.pk',
    instagram: '@pkcomedy',
    rating: 4.8,
    followerCount: 15000,
    eventCount: 12,
    tags: ['Comedy', 'Stand-up', 'Karachi Events'],
  },
  {
    id: 'pak-org-2',
    name: 'Smash Sports PK',
    avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    bio: 'Premium sports event organizers and venue managers in Lahore and Islamabad.',
    website: 'https://playtomic.io',
    instagram: '@smashpadel.pk',
    rating: 4.9,
    followerCount: 22000,
    eventCount: 35,
    tags: ['Sports', 'Padel', 'Turf', 'Fitness'],
  }
];

export const pakistanVenues: Venue[] = [
  {
    id: 'pak-ven-1',
    name: 'Pakistan American Cultural Center (PACC)',
    type: 'venue',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    bio: 'Historic cultural center in Karachi hosting theater plays, stand-up comedy, and educational workshops.',
    address: 'Plot 11, Fatima Jinnah Road, Cantt, Karachi',
    neighborhood: 'Cantt',
    website: 'https://pacc.edu.pk',
    rating: 4.5,
    followerCount: 32000,
    eventCount: 18,
    tags: ['Cultural Center', 'Theater', 'Comedy', 'Art'],
    city: 'karachi',
  },
  {
    id: 'pak-ven-2',
    name: 'Smash Padel Club DHA Phase 6',
    type: 'venue',
    logo: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    bio: 'Pakistan\'s premier padel tennis facility with state-of-the-art panoramic courts and pro-shop.',
    address: 'DHA Phase 6, Lahore',
    neighborhood: 'DHA Phase 6',
    website: 'https://playtomic.io/smash-padel',
    rating: 4.8,
    followerCount: 8900,
    eventCount: 50,
    tags: ['Sports', 'Padel', 'Fitness', 'Outdoor'],
    city: 'lahore',
  },
  {
    id: 'pak-ven-3',
    name: 'Universal Cinemas Emporium Mall',
    type: 'venue',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200',
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    bio: 'Pakistan\'s largest multiplex cinema featuring IMAX and ultra-premium screening halls.',
    address: 'Emporium Mall, Johar Town, Lahore',
    neighborhood: 'Johar Town',
    website: 'https://universalcinemas.com',
    rating: 4.7,
    followerCount: 45000,
    eventCount: 365,
    tags: ['Cinema', 'IMAX', 'Movies', 'Entertainment'],
    city: 'lahore',
  }
];

export const pakistanEvents: Event[] = [
  {
    id: 'pak-event-1',
    title: 'Comedy Night at the Pakistan American Cultural Center (PACC)',
    description: 'Get ready for an evening filled with laughter! Karachi\'s top stand-up comedians gather at PACC for a hilarious live show. Don\'t miss out on this night of pure comedy.',
    category: 'Comedy',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=800',
    price: 1500,
    location: 'Plot 11, Fatima Jinnah Road, Cantt, Karachi',
    date: '2026-07-10',
    time: '20:00',
    organizer: 'Pakistan Comedy Association',
    organizerId: 'pak-org-1',
    venue: 'PACC Auditorium',
    venueId: 'pak-ven-1',
    attendees: 450,
    rating: 4.7,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Cantt',
    city: 'karachi',
    bookingType: 'external_link',
    externalLink: 'https://ticketwala.pk/event/comedy-night-pacc',
    dataSource: 'ticketwala',
  },
  {
    id: 'pak-event-2',
    title: 'Padel Match Slot - Smash Padel DHA Phase 6',
    description: 'Book your 90-minute court slot at Lahore\'s premier sports venue. Enjoy a fast-paced game of Padel tennis with friends on state-of-the-art courts.',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    price: 4000,
    location: 'DHA Phase 6, Lahore',
    date: '2026-07-05',
    time: '18:00',
    organizer: 'Smash Sports PK',
    organizerId: 'pak-org-2',
    venue: 'Smash Padel Club',
    venueId: 'pak-ven-2',
    attendees: 12,
    rating: 4.8,
    isFavorite: false,
    isFeatured: false,
    neighborhood: 'DHA Phase 6',
    city: 'lahore',
    bookingType: 'whatsapp',
    whatsappNumber: '+923001234567',
    dataSource: 'manual_entry',
  },
  {
    id: 'pak-event-3',
    title: 'Atif Aslam Live in Concert Lahore',
    description: 'Experience the magic of Pakistan\'s global superstar Atif Aslam live in Lahore. Performing all his hit songs with a full live band at Alhamra Art Council.',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    price: 3500,
    location: 'Mall Road, Lahore',
    date: '2026-07-25',
    time: '19:30',
    organizer: 'Smash Sports PK',
    organizerId: 'pak-org-2',
    venue: 'Alhamra Open Air Theater',
    venueId: 'pak-ven-2',
    attendees: 5000,
    rating: 4.9,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Mall Road',
    city: 'lahore',
    bookingType: 'external_link',
    externalLink: 'https://ticketwala.pk/event/atif-aslam-live-lahore',
    dataSource: 'ticketwala',
  },
  {
    id: 'pak-event-4',
    title: 'Islamabad Literature Festival',
    description: 'A three-day literary extravaganza featuring talks, panel discussions, book launches, poetry readings, and musical performances.',
    category: 'Workshops',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    price: 0,
    location: 'Shakarparian, Islamabad',
    date: '2026-07-12',
    time: '10:00',
    organizer: 'Pakistan Comedy Association',
    organizerId: 'pak-org-1',
    venue: 'Lok Virsa Museum',
    venueId: 'pak-ven-1',
    attendees: 1200,
    rating: 4.6,
    isFavorite: false,
    isFeatured: true,
    neighborhood: 'Shakarparian',
    city: 'islamabad',
    bookingType: 'in_app',
    dataSource: 'manual_entry',
  }
];

export const pakistanMovies: Movie[] = [
  {
    id: 'pak-mov-1',
    title: 'The Legend of Maula Jatt',
    genre: ['Action', 'Drama'],
    duration: 150,
    rating: 4.9,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
    releaseDate: '2026-07-01',
    synopsis: 'An epic action-drama focusing on the legendary rivalry between local hero Maula Jatt and the brutal clan leader Noori Natt.',
    director: 'Bilal Lashari',
    cast: ['Fawad Khan', 'Hamza Ali Abbasi', 'Mahira Khan'],
    ageRating: 'PG-13',
    city: 'lahore',
    bookingType: 'external_link',
    externalLink: 'https://bookme.pk/movies/the-legend-of-maula-jatt-emporium',
    dataSource: 'bookme',
  }
];

export const pakistanCinemas: Cinema[] = [
  {
    id: 'pak-cine-1',
    name: 'Universal Cinemas Emporium Mall',
    address: 'Emporium Mall, Johar Town, Lahore',
    distance: '2.0 km',
    neighborhood: 'Johar Town',
    city: 'lahore',
  },
  {
    id: 'pak-cine-2',
    name: 'Nueplex Cinemas DHA',
    address: 'DHA Phase 8, Karachi',
    distance: '1.5 km',
    neighborhood: 'DHA Phase 8',
    city: 'karachi',
  },
  {
    id: 'pak-cine-3',
    name: 'Centaurus Cineplex',
    address: 'Centaurus Mall, F-8, Islamabad',
    distance: '3.0 km',
    neighborhood: 'F-8',
    city: 'islamabad',
  }
];

export const pakistanShowtimes: MovieShowtime[] = [
  {
    id: 'pak-st-1',
    movieId: 'pak-mov-1',
    cinemaId: 'pak-cine-1',
    date: '2026-07-01',
    time: '18:00',
    format: 'IMAX',
    price: 1200,
    availableSeats: 85,
    bookingType: 'external_link',
    externalLink: 'https://bookme.pk/movies/the-legend-of-maula-jatt-emporium',
    dataSource: 'bookme',
    city: 'lahore',
  },
  {
    id: 'pak-st-2',
    movieId: 'pak-mov-1',
    cinemaId: 'pak-cine-2',
    date: '2026-07-01',
    time: '21:00',
    format: '3D',
    price: 1000,
    availableSeats: 120,
    bookingType: 'external_link',
    externalLink: 'https://bookme.pk/movies/the-legend-of-maula-jatt-nueplex',
    dataSource: 'bookme',
    city: 'karachi',
  },
  {
    id: 'pak-st-3',
    movieId: 'pak-mov-1',
    cinemaId: 'pak-cine-3',
    date: '2026-07-01',
    time: '19:30',
    format: '2D',
    price: 800,
    availableSeats: 64,
    bookingType: 'external_link',
    externalLink: 'https://bookme.pk/movies/the-legend-of-maula-jatt-centaurus',
    dataSource: 'bookme',
    city: 'islamabad',
  }
];

export const pakistanRestaurants: Restaurant[] = [
  {
    id: 'pak-rest-1',
    name: 'Haveli Restaurant Lahore',
    cuisine: 'Mughlai & Traditional',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 3200,
    address: 'Food Street, Fort Road, Lahore',
    neighborhood: 'Walled City',
    distance: '4.2 km',
    phone: '+923004001234',
    isOpen: true,
    hasLiveMusic: false,
    openingHours: '16:00 - 01:00',
    tags: ['Heritage View', 'Popular', 'Rooftop'],
    featured: true,
    city: 'lahore',
    bookingType: 'external_link',
    externalLink: 'https://haveli.com.pk/reservations',
    dataSource: 'manual_entry',
  },
  {
    id: 'pak-rest-2',
    name: 'Kolachi Restaurant Karachi',
    cuisine: 'Traditional BBQ & Seafood',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    priceRange: '$$$$',
    rating: 4.9,
    reviewCount: 9800,
    address: 'Do Darya, Beach Avenue, Phase 8, DHA, Karachi',
    neighborhood: 'DHA Phase 8',
    distance: '6.0 km',
    phone: '+922111111111',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '18:00 - 01:00',
    tags: ['Waterfront', 'Fine Dining', 'Live Music Tonight'],
    featured: true,
    city: 'karachi',
    bookingType: 'whatsapp',
    whatsappNumber: '+923008881234',
    dataSource: 'manual_entry',
  },
  {
    id: 'pak-rest-3',
    name: 'Monal Restaurant Islamabad',
    cuisine: 'Pakistani Traditional & Continental',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 4500,
    address: 'Pir Sohawa, Margalla Hills, Islamabad',
    neighborhood: 'Margalla Hills',
    distance: '8.5 km',
    phone: '+92512898044',
    isOpen: true,
    hasLiveMusic: true,
    openingHours: '12:00 - 00:00',
    tags: ['Scenic View', 'Fine Dining', 'Live Music Tonight'],
    featured: true,
    city: 'islamabad',
    bookingType: 'whatsapp',
    whatsappNumber: '+923005559999',
    dataSource: 'manual_entry',
  }
];

// Helper functions to tag existing Indonesian mock data with city
export const getTaggedEvents = (): Event[] => {
  return mockEvents.map(e => {
    const loc = (e.location + ' ' + (e.neighborhood || '')).toLowerCase();
    let city: PakistanCity = 'lahore';
    if (loc.includes('bali') || loc.includes('kuta') || loc.includes('nusa')) city = 'karachi' as PakistanCity;
    else if (loc.includes('bandung') || loc.includes('dago') || loc.includes('gedung sate')) city = 'islamabad' as PakistanCity;
    return { ...e, city };
  });
};

export const getTaggedCinemas = (): Cinema[] => {
  return mockCinemas.map(c => ({ ...c, city: 'lahore' as PakistanCity }));
};

export const getTaggedRestaurants = (): Restaurant[] => {
  return mockRestaurants.map(r => ({ ...r, city: 'lahore' as PakistanCity }));
};

export const getTaggedMovies = (): Movie[] => {
  return mockMovies.map(m => ({ ...m, city: 'lahore' as PakistanCity }));
};

export const getTaggedShowtimes = (): MovieShowtime[] => {
  return mockShowtimes.map(s => ({ ...s, city: 'lahore' as PakistanCity }));
};

export const getTaggedVenues = (): Venue[] => {
  return mockVenues.map(v => {
    const loc = (v.address + ' ' + (v.neighborhood || '')).toLowerCase();
    let city: PakistanCity = 'lahore';
    if (loc.includes('bali') || loc.includes('kuta') || loc.includes('nusa')) city = 'karachi' as PakistanCity;
    else if (loc.includes('bandung') || loc.includes('dago') || loc.includes('gedung sate')) city = 'islamabad' as PakistanCity;
    return { ...v, city };
  });
};


// ============================================================
// SOCIAL: Mock Friends & Attendance
// ============================================================

export const mockFriends: Friend[] = [
  { id: 'f-001', name: 'Andi Pratama', handle: '@andi.pratama', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', mutualFriends: 5, isOnline: true },
  { id: 'f-002', name: 'Sari Dewi', handle: '@sari.dewi', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', mutualFriends: 3, isOnline: true },
  { id: 'f-003', name: 'Rizky Ramadhan', handle: '@rizky.r', avatar: 'https://randomuser.me/api/portraits/men/42.jpg', mutualFriends: 8, isOnline: false },
  { id: 'f-004', name: 'Putri Ayu', handle: '@putri.ayu', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', mutualFriends: 2, isOnline: true },
  { id: 'f-005', name: 'Dimas Saputra', handle: '@dimas.sap', avatar: 'https://randomuser.me/api/portraits/men/43.jpg', mutualFriends: 6, isOnline: false },
  { id: 'f-006', name: 'Nadia Putri', handle: '@nadia.putri', avatar: 'https://randomuser.me/api/portraits/women/46.jpg', mutualFriends: 4, isOnline: true },
  { id: 'f-007', name: 'Fajar Nugroho', handle: '@fajar.n', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', mutualFriends: 1, isOnline: false },
  { id: 'f-008', name: 'Maya Anggraeni', handle: '@maya.a', avatar: 'https://randomuser.me/api/portraits/women/47.jpg', mutualFriends: 7, isOnline: true },
  { id: 'f-009', name: 'Budi Santoso', handle: '@budi.s', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', mutualFriends: 3, isOnline: false },
  { id: 'f-010', name: 'Rina Wulandari', handle: '@rina.w', avatar: 'https://randomuser.me/api/portraits/women/48.jpg', mutualFriends: 2, isOnline: true },
  { id: 'f-011', name: 'Yoga Firmansyah', handle: '@yoga.f', avatar: 'https://randomuser.me/api/portraits/men/46.jpg', mutualFriends: 5, isOnline: false },
  { id: 'f-012', name: 'Lestari Budiman', handle: '@lestari.b', avatar: 'https://randomuser.me/api/portraits/women/49.jpg', mutualFriends: 4, isOnline: true },
];

// Which friends are attending which events (event ID → array of friend IDs)
export const friendAttendees: Record<string, string[]> = {
  '1': ['f-001', 'f-002', 'f-005', 'f-008', 'f-011'],  // Jakarta Music Festival
  '3': ['f-003', 'f-006'],                                // Comedy Night Live
  '4': ['f-001', 'f-004', 'f-007', 'f-010'],             // Jakarta Food Festival
  '6': ['f-002', 'f-009'],                                // Nusa Penida Beach Party
  '7': ['f-005', 'f-012'],                                // Indonesian Indie Film Festival
  '9': ['f-001', 'f-003', 'f-008'],                       // Bandung Jazz Festival
  '11': ['f-006', 'f-010'],                               // Tech Startup Summit
  '13': ['f-002', 'f-004', 'f-007', 'f-011', 'f-012'],  // Sunset Yoga & Sound
};

// Helper: Get attending friends for an event (respects privacy)
export const getAttendingFriends = (
  eventId: string,
  friendsList: string[],
  privateRSVPs: string[],
  privacyHideRSVPs: boolean
): Friend[] => {
  if (privacyHideRSVPs) return [];
  const attendingIds = friendAttendees[eventId] || [];
  return mockFriends.filter(
    f => attendingIds.includes(f.id) && friendsList.includes(f.id) && !privateRSVPs.includes(eventId)
  );
};

// Helper: Get events where friends have RSVP'd
export const getEventsWithFriendAttendance = (
  friendsList: string[],
  privateRSVPs: string[],
  privacyHideRSVPs: boolean
): Event[] => {
  if (privacyHideRSVPs) return [];
  return mockEvents.filter(event => {
    const attendingIds = friendAttendees[event.id] || [];
    return attendingIds.some(id => friendsList.includes(id) && !privateRSVPs.includes(event.id));
  });
};
