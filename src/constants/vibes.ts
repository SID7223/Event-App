import { VibeCategory, Friend } from '../types';

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

export const getAttendingFriends = (
  eventId: string,
  friendsList: string[],
  privateRSVPs: string[],
  hideRSVPs: boolean
): Friend[] => {
  return [];
};

export const getVenueById = (id: string): any => null;

export const getOrganizerById = (id: string): any => null;

export const getEventsByVenue = (venueId: string): any[] => [];

export const getEventsByOrganizer = (organizerId: string): any[] => [];
