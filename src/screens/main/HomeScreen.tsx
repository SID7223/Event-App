import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { useAuth, useApp } from '../../store';
import { mockEvents, sortVibesByPreferences } from '../../services/mockData';
import { Event, VibeCategory } from '../../types';
import AnimatedHamburger from '../../components/ui/AnimatedHamburger';

const { width } = Dimensions.get('window');

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

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

const getGreetingSubtext = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Ready to explore?';
  } else if (hour >= 12 && hour < 17) {
    return 'What\'s happening today?';
  } else if (hour >= 17 && hour < 21) {
    return 'Let\'s go out!';
  } else {
    return 'Discover something new';
  }
};

const isThisWeek = (dateStr: string): boolean => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  return eventDate >= today && eventDate <= weekEnd;
};

interface HomeScreenProps {
  onOpenSidebar?: () => void;
  sidebarVisible?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSidebar, sidebarVisible = false }) => {
  const navigation = useNavigation<any>();
  const { location, preferences } = useAuth();
  const { activeVibe, setActiveVibe } = useApp();
  
  const [iconOpen, setIconOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipScrollRef = useRef<ScrollView>(null);

  // Sort vibes based on user preferences (preferred first)
  const sortedVibes: VibeCategory[] = useMemo(() => {
    return sortVibesByPreferences(preferences || []);
  }, [preferences]);

  // Get featured event (highest rated isFeatured event)
  const featuredEvent = useMemo(() => {
    return mockEvents
      .filter(e => e.isFeatured)
      .sort((a, b) => b.rating - a.rating)[0];
  }, []);

  // Filter events based on active vibe
  const filteredEvents = useMemo(() => {
    if (!activeVibe || activeVibe === 'all') {
      return mockEvents;
    }
    
    const vibe = sortedVibes.find(v => v.id === activeVibe);
    if (!vibe) return mockEvents;
    
    return mockEvents.filter(e => 
      e.category.toLowerCase().includes(vibe.label.toLowerCase()) ||
      e.category.toLowerCase().includes(vibe.id.toLowerCase())
    );
  }, [activeVibe, sortedVibes]);

  // Get popular events in neighborhood
  const popularInArea = useMemo(() => {
    const neighborhood = location?.neighborhood || 'Senayan';
    return mockEvents
      .filter(e => e.neighborhood === neighborhood)
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);
  }, [location]);

  // Get new & upcoming events (mixed types)
  const upcomingEvents = useMemo(() => {
    return mockEvents
      .filter(e => isThisWeek(e.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, []);

  // Sync icon state when sidebar closes externally
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
      setIconOpen(false);
      onOpenSidebar?.();
    } else {
      setIconOpen(true);
      timerRef.current = setTimeout(() => {
        onOpenSidebar?.();
      }, 300);
    }
  }, [iconOpen, onOpenSidebar]);

  const handleVibePress = (vibeId: string) => {
    const newVibe = activeVibe === vibeId ? 'all' : vibeId;
    setActiveVibe(newVibe);
    // Scroll chips to start when changing
    chipScrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const neighborhood = location?.neighborhood || 'Your Area';

  const renderFeaturedBanner = () => {
    if (!featuredEvent) return null;
    
    return (
      <TouchableOpacity
        style={styles.featuredBanner}
        onPress={() => navigation.navigate('EventDetail', { eventId: featuredEvent.id })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: featuredEvent.image }} style={styles.featuredImage} />
        <LinearGradient
          colors={['rgba(10,12,18,0.3)', 'rgba(10,12,18,0.5)', 'rgba(10,12,18,0.95)']}
          locations={[0, 0.4, 1]}
          style={styles.featuredGradient}
        />
        
        {/* Featured Badge */}
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.featuredBadgeText}>Featured Today</Text>
        </View>
        
        {/* Featured Info */}
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredTitle} numberOfLines={2}>{featuredEvent.title}</Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>
                {getMonth(featuredEvent.date)} {getDay(featuredEvent.date)}
              </Text>
            </View>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText}>{formatTime(featuredEvent.time)}</Text>
            </View>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredMetaText} numberOfLines={1}>{featuredEvent.venue}</Text>
            </View>
          </View>
          
          {/* RSVP Button */}
          <View style={styles.rsvpButton}>
            <LinearGradient
              colors={['#99E1D9', '#E43414']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rsvpGradient}
            >
              <Text style={styles.rsvpText}>View Event</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPopularEvent = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.popularCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: event.image }} style={styles.popularImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,12,18,0.85)']}
        style={styles.popularGradient}
      />
      <View style={styles.popularInfo}>
        <Text style={styles.popularTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.popularMeta}>
          <Ionicons name="people" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.popularAttendees}>{event.attendees.toLocaleString()} going</Text>
        </View>
        <View style={styles.popularPriceTag}>
          <Text style={styles.popularPrice}>${event.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUpcomingEvent = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.upcomingCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.88}
    >
      <View style={styles.upcomingDateBadge}>
        <Text style={styles.upcomingDay}>{getDay(event.date)}</Text>
        <Text style={styles.upcomingMonth}>{getMonth(event.date)}</Text>
      </View>
      <Image source={{ uri: event.image }} style={styles.upcomingImage} />
      <View style={styles.upcomingInfo}>
        <Text style={styles.upcomingTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.upcomingMeta}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.upcomingLocation} numberOfLines={1}>{event.venue}</Text>
        </View>
      </View>
      <View style={styles.upcomingPriceTag}>
        <Text style={styles.upcomingPrice}>${event.price}</Text>
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

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={14} color="#E43414" />
            <Text style={styles.locationText}>{location?.city || 'Jakarta'}</Text>
            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.greetingSubtext}>{getGreetingSubtext()}</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ExploreTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.searchPlaceholder}>Search events...</Text>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Featured Event Banner */}
        {renderFeaturedBanner()}

        {/* Vibe Filters */}
        <View style={styles.vibesSection}>
          <ScrollView
            ref={chipScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vibesContainer}
          >
            {/* All chip (always first) */}
            <TouchableOpacity
              style={[styles.vibeChip, (!activeVibe || activeVibe === 'all') && styles.vibeChipActive]}
              onPress={() => handleVibePress('all')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flash"
                size={16}
                color={!activeVibe || activeVibe === 'all' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.vibeLabel, (!activeVibe || activeVibe === 'all') && styles.vibeLabelActive]}>
                All
              </Text>
            </TouchableOpacity>
            
            {/* Dynamic vibe chips based on preferences */}
            {sortedVibes.map((vibe) => {
              const isActive = activeVibe === vibe.id;
              const isPreferred = (preferences || []).some(p => 
                p.toLowerCase().includes(vibe.id.toLowerCase()) || 
                vibe.id.toLowerCase().includes(p.toLowerCase()) ||
                p.toLowerCase().includes(vibe.label.toLowerCase()) ||
                vibe.label.toLowerCase().includes(p.toLowerCase())
              );
              
              return (
                <TouchableOpacity
                  key={vibe.id}
                  style={[
                    styles.vibeChip, 
                    isActive && styles.vibeChipActive,
                    isPreferred && !isActive && styles.vibeChipPreferred,
                  ]}
                  onPress={() => handleVibePress(vibe.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={vibe.icon as any}
                    size={16}
                    color={isActive ? '#FFFFFF' : isPreferred ? '#99E1D9' : 'rgba(255,255,255,0.6)'}
                  />
                  <Text style={[
                    styles.vibeLabel, 
                    isActive && styles.vibeLabelActive,
                    isPreferred && !isActive && styles.vibeLabelPreferred,
                  ]}>
                    {vibe.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Popular in Neighborhood Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={18} color="#99E1D9" />
              <Text style={styles.sectionTitle}>Popular in {neighborhood}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularContainer}
          >
            {popularInArea.length > 0 ? (
              popularInArea.map(renderPopularEvent)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No popular events in your area yet</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* New & Upcoming Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={18} color="#E43414" />
              <Text style={styles.sectionTitle}>New & Upcoming</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.upcomingContainer}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(renderUpcomingEvent)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming events this week</Text>
              </View>
            )}
          </View>
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
    paddingBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greetingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 16,
    height: 52,
    marginHorizontal: 20,
    marginBottom: 20,
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
  // Featured Banner Styles
  featuredBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#161B24',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  featuredGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 28,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  rsvpButton: {
    alignSelf: 'flex-start',
  },
  rsvpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rsvpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Vibe Filters
  vibesSection: {
    marginBottom: 24,
  },
  vibesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1A1F2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  vibeChipActive: {
    backgroundColor: '#E43414',
    borderColor: '#E43414',
  },
  vibeChipPreferred: {
    borderColor: 'rgba(153,225,217,0.4)',
    backgroundColor: 'rgba(153,225,217,0.1)',
  },
  vibeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  vibeLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  vibeLabelPreferred: {
    color: '#99E1D9',
  },
  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  popularContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  popularCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#161B24',
  },
  popularImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  popularGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  popularInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  popularTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  popularAttendees: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  popularPriceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0C12',
  },
  upcomingContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  upcomingDateBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(228,52,20,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E43414',
  },
  upcomingMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(228,52,20,0.7)',
    textTransform: 'uppercase',
  },
  upcomingImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  upcomingPriceTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upcomingPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default HomeScreen;
