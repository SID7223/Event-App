import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GlassPill from '../../components/ui/GlassPill';
import { fonts } from '../../theme/fonts';

interface PlayVenue {
  id: string;
  name: string;
  type: string;
  icon: string;
  image: string;
  address: string;
  neighborhood: string;
  distance: string;
  rating: number;
  reviewCount: number;
  openHours: string;
  isOpen: boolean;
  tags: string[];
  whatsapp: string;
  website: string;
}

const PLAY_VENUES: PlayVenue[] = [
  // Padel
  {
    id: 'pv-001',
    name: 'Jakarta Padel Club',
    type: 'Padel',
    icon: 'tennisball',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    address: 'Jl. Pintu X Senayan, Jakarta',
    neighborhood: 'Senayan',
    distance: '0.8 km',
    rating: 4.7,
    reviewCount: 156,
    openHours: '07:00 – 23:00',
    isOpen: true,
    tags: ['Indoor', 'AC', 'Equipment Rental', 'Coaching'],
    whatsapp: '+6281234567890',
    website: 'https://jakartapadelclub.com',
  },
  {
    id: 'pv-002',
    name: 'Padel Arena Kuningan',
    type: 'Padel',
    icon: 'tennisball',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    address: 'Kuningan City Mall, Jakarta',
    neighborhood: 'Kuningan',
    distance: '2.1 km',
    rating: 4.5,
    reviewCount: 89,
    openHours: '08:00 – 22:00',
    isOpen: true,
    tags: ['Indoor', 'AC', '4 Courts'],
    whatsapp: '+6281234567891',
    website: '',
  },
  // Snooker
  {
    id: 'pv-003',
    name: 'Champion Snooker & Billiard',
    type: 'Snooker',
    icon: 'ellipse',
    image: 'https://images.unsplash.com/photo-1529154091711-7d3d50d2f31a?w=800',
    address: 'Plaza Senayan, LG Floor',
    neighborhood: 'Senayan',
    distance: '0.5 km',
    rating: 4.4,
    reviewCount: 203,
    openHours: '10:00 – 02:00',
    isOpen: true,
    tags: ['Indoor', 'AC', 'Full Bar', '12 Tables'],
    whatsapp: '+6281234567892',
    website: 'https://championsnooker.co.id',
  },
  {
    id: 'pv-004',
    name: '8-Ball Pool Lounge',
    type: 'Snooker',
    icon: 'ellipse',
    image: 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?w=800',
    address: 'Grand Indonesia, East Mall L5',
    neighborhood: 'Menteng',
    distance: '1.3 km',
    rating: 4.2,
    reviewCount: 134,
    openHours: '11:00 – 01:00',
    isOpen: true,
    tags: ['Indoor', 'AC', 'Snacks & Drinks'],
    whatsapp: '+6281234567893',
    website: '',
  },
  // Futsal
  {
    id: 'pv-005',
    name: 'Futsal Arena GBK',
    type: 'Futsal',
    icon: 'football',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    address: 'GBK Complex, Senayan',
    neighborhood: 'Senayan',
    distance: '1.0 km',
    rating: 4.6,
    reviewCount: 287,
    openHours: '06:00 – 23:00',
    isOpen: true,
    tags: ['Outdoor', '6 Fields', 'Locker Room', 'Parking'],
    whatsapp: '+6281234567894',
    website: 'https://futsalarena-gbk.com',
  },
  {
    id: 'pv-006',
    name: 'Legion Futsal',
    type: 'Futsal',
    icon: 'football',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    address: 'Jl. Gatot Subroto, Jakarta',
    neighborhood: 'Kuningan',
    distance: '2.5 km',
    rating: 4.3,
    reviewCount: 178,
    openHours: '07:00 – 22:00',
    isOpen: true,
    tags: ['Indoor', 'Synthetic Turf', 'Shower', 'Rentals'],
    whatsapp: '+6281234567895',
    website: '',
  },
  // Gaming / PC
  {
    id: 'pv-007',
    name: 'Warnet GG Elite',
    type: 'Gaming / PC',
    icon: 'game-controller',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    address: 'Menteng Square, L2',
    neighborhood: 'Menteng',
    distance: '1.8 km',
    rating: 4.5,
    reviewCount: 312,
    openHours: '24 Hours',
    isOpen: true,
    tags: ['AC', 'RTX 4090', '144Hz', 'Private Rooms'],
    whatsapp: '+6281234567896',
    website: 'https://warnetgg.com',
  },
  {
    id: 'pv-008',
    name: 'Pixel Gaming Hub',
    type: 'Gaming / PC',
    icon: 'game-controller',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    address: 'Central Park Mall, L3',
    neighborhood: 'Tanjung Duren',
    distance: '4.2 km',
    rating: 4.3,
    reviewCount: 198,
    openHours: '10:00 – 23:00',
    isOpen: true,
    tags: ['AC', 'PS5 Zone', 'VR Station', 'Streaming Booth'],
    whatsapp: '+6281234567897',
    website: '',
  },
  // Board Games
  {
    id: 'pv-009',
    name: 'Meeples Board Game Cafe',
    type: 'Board Games',
    icon: 'apps',
    image: 'https://images.unsplash.com/photo-1611891483129-793514c67171?w=800',
    address: 'Jl. Panglima Polim, Jakarta',
    neighborhood: 'Senayan',
    distance: '1.5 km',
    rating: 4.8,
    reviewCount: 167,
    openHours: '12:00 – 23:00',
    isOpen: true,
    tags: ['Indoor', 'AC', '500+ Games', 'Cafe'],
    whatsapp: '+6281234567898',
    website: 'https://meeplescafe.com',
  },
  {
    id: 'pv-010',
    name: 'Dice & Coffee',
    type: 'Board Games',
    icon: 'apps',
    image: 'https://images.unsplash.com/photo-1606503153255-59d8b2e4b9e4?w=800',
    address: 'Kemang Timur, Jakarta',
    neighborhood: 'Kemang',
    distance: '5.0 km',
    rating: 4.6,
    reviewCount: 94,
    openHours: '10:00 – 22:00',
    isOpen: false,
    tags: ['Indoor', 'AC', 'Coffee', 'Family Friendly'],
    whatsapp: '+6281234567899',
    website: '',
  },
];

const PLAY_FILTERS = ['All', 'Padel', 'Snooker', 'Futsal', 'Gaming / PC', 'Board Games'];

const PlaySportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState(0);

  const filtered = useMemo(() => {
    if (activeFilter === 0) return PLAY_VENUES;
    const selectedType = PLAY_FILTERS[activeFilter];
    return PLAY_VENUES.filter(v => v.type === selectedType);
  }, [activeFilter]);

  const handleCheckAvailability = (venue: PlayVenue) => {
    const phone = venue.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi! I'd like to check availability at ${venue.name}.`);
    Linking.openURL(`https://wa.me/${phone}?text=${message}`).catch(() => {});
  };

  const handleDirections = (address: string) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const renderVenue = ({ item }: { item: PlayVenue }) => (
    <View style={styles.venueCard}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.venueImage} />
        <View style={styles.imageOverlay} />
        {/* Status Badge */}
        <View style={[styles.statusBadge, item.isOpen ? styles.statusOpen : styles.statusClosed]}>
          <View style={[styles.statusDot, item.isOpen ? styles.dotOpen : styles.dotClosed]} />
          <Text style={styles.statusText}>{item.isOpen ? 'Open Now' : 'Closed'}</Text>
        </View>
        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Ionicons name={item.icon as any} size={12} color="#FFFFFF" />
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.venueInfo}>
        <View style={styles.venueHeader}>
          <View style={styles.venueTitleBlock}>
            <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.45)" />
              <Text style={styles.locationText} numberOfLines={1}>{item.neighborhood}</Text>
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
          </View>
        </View>

        {/* Hours */}
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.45)" />
          <Text style={styles.hoursText}>{item.openHours}</Text>
        </View>

        {/* Quick Tags */}
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.checkAvailBtn}
            onPress={() => handleCheckAvailability(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
            <Text style={styles.checkAvailText}>Check Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => handleDirections(item.address)}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Play</Text>
            <Text style={styles.headerSubtitle}>Find courts & tables nearby</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {PLAY_FILTERS.map((filter, i) => (
            <GlassPill
              key={filter}
              label={filter}
              active={activeFilter === i}
              onPress={() => setActiveFilter(i)}
            />
          ))}
        </ScrollView>

        {/* Venue List */}
        {filtered.length > 0 ? (
          filtered.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.separator} />}
              {renderVenue({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>No venues found</Text>
            <Text style={styles.emptySub}>Try a different filter</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    fontFamily: fonts.body,
  },
  headerRight: {
    width: 40,
  },
  // Filters
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 16,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.subheading,
  },
  emptySub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fonts.body,
  },
  // Venue Card
  venueCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  venueImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,12,18,0.25)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusOpen: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  statusClosed: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: '#22C55E',
  },
  dotClosed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,12,18,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Venue Info
  venueInfo: {
    padding: 14,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  venueTitleBlock: {
    flex: 1,
  },
  venueName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.subheading,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
    fontFamily: fonts.body,
  },
  distanceText: {
    fontSize: 12,
    color: '#FF6B4A',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
    fontFamily: fonts.bodyBold,
  },
  reviewCountText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fonts.body,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  hoursText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,107,74,0.08)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkAvailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22C55E',
  },
  checkAvailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  directionsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E43414',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaySportsScreen;
