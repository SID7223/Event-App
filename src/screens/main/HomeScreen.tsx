import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { mockEvents } from '../../services/mockData';
import AnimatedHamburger from '../../components/ui/AnimatedHamburger';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'feed', label: 'My feed', icon: 'flame' as const, active: true },
  { id: 'food', label: 'Food', icon: 'restaurant' as const, active: false },
  { id: 'concerts', label: 'Concerts', icon: 'musical-notes' as const, active: false },
  { id: 'art', label: 'Art', icon: 'color-palette' as const, active: false },
  { id: 'tech', label: 'Tech', icon: 'laptop' as const, active: false },
  { id: 'sports', label: 'Sports', icon: 'football' as const, active: false },
];

const getMonth = (dateStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[new Date(dateStr).getMonth()];
};
const getDay = (dateStr: string) => new Date(dateStr).getDate();
const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

interface HomeScreenProps {
  onOpenSidebar?: () => void;
  sidebarVisible?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSidebar, sidebarVisible = false }) => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('feed');
  const [iconOpen, setIconOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync icon state when sidebar closes externally (overlay tap, menu item)
  useEffect(() => {
    if (!sidebarVisible && iconOpen) {
      setIconOpen(false);
    }
  }, [sidebarVisible]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleHamburgerPress = useCallback(() => {
    if (iconOpen) {
      // Stairs → close sidebar immediately
      setIconOpen(false);
      onOpenSidebar?.();
    } else {
      // Fries → Stairs transition (0.3s), then open sidebar
      setIconOpen(true);
      timerRef.current = setTimeout(() => {
        onOpenSidebar?.();
      }, 300);
    }
  }, [iconOpen, onOpenSidebar]);

  const upcomingEvents = mockEvents.slice(0, 4);

  const renderEventCard = ({ item, index }: { item: typeof mockEvents[0]; index: number }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: item.image }} style={styles.eventCardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,12,18,0.85)']}
        style={styles.eventCardGradient}
      />
      {/* Date badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateDay}>{getDay(item.date)}</Text>
        <Text style={styles.dateMonth}>{getMonth(item.date)}</Text>
      </View>
      {/* Info */}
      <View style={styles.eventCardInfo}>
        <Text style={styles.eventCardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.eventCardMeta}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.eventCardLocation} numberOfLines={1}>
            {item.location.split(',')[1]?.trim() || item.location} - {formatTime(item.time)}
          </Text>
        </View>
      </View>
      <View style={styles.priceTag}>
        <Text style={styles.eventCardPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <AnimatedHamburger
            isOpen={iconOpen}
            onPress={handleHamburgerPress}
          />

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#E43414" />
            <Text style={styles.locationText}>Jakarta, Ina</Text>
          </View>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ExploreTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.searchPlaceholder}>Search all events...</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                />
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Event Cards */}
        <View style={styles.eventsContainer}>
          {upcomingEvents.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderEventCard({ item, index })}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E43414',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 16,
    height: 52,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1A1F2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryChipActive: {
    backgroundColor: '#E43414',
    borderColor: '#E43414',
  },
  categoryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  eventCard: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#161B24',
  },
  eventCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  eventCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  dateBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(10,12,18,0.7)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  eventCardInfo: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  eventCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  eventCardLocation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  priceTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  eventCardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0C12',
  },
});

export default HomeScreen;
