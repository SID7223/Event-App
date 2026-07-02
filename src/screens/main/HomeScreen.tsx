import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useApp } from '../../store';
import { sortVibesByPreferences, getAttendingFriends } from '../../services/mockData';
import { Event, VibeCategory } from '../../types';
import AnimatedHamburger from '../../components/ui/AnimatedHamburger';
import GlassPill from '../../components/ui/GlassPill';
import { BlurView } from 'expo-blur';
import { useFilteredContent } from '../../hooks/useFilteredContent';
import { fonts } from '../../theme/fonts';
import {
  getTimeOfDay,
  GRADIENT_MAP,
  getWeatherIconKey,
  fetchWeather,
  isWeatherCacheValid,
  TimeOfDay,
} from '../../utils/weather';
import { WEATHER_ICON_MAP } from '../../assets/weatherIcons';

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

interface HomeScreenProps {
  onOpenSidebar?: () => void;
  sidebarVisible?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenSidebar, sidebarVisible = false }) => {
  const navigation = useNavigation<any>();
  const { location, preferences, friendsList, privateRSVPs, privacySettings } = useAuth();
  const { activeVibe, setActiveVibe, setActiveTab, weather, setWeather } = useApp();
  
  const [showCityPicker, setShowCityPicker] = useState(false);
  const { events: filteredEventsList, userSelectedCity } = useFilteredContent();
  const [iconOpen, setIconOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipScrollRef = useRef<ScrollView>(null);

  // Time-of-day and weather
  const timeOfDay: TimeOfDay = getTimeOfDay();
  const gradientColors = GRADIENT_MAP[timeOfDay];
  const weatherIconKey = weather
    ? getWeatherIconKey(weather.conditionCode, weather.isDay)
    : getWeatherIconKey(800, timeOfDay !== 'night');
  const weatherIconSource = WEATHER_ICON_MAP[weatherIconKey];

  // Debug: log weather state
  useEffect(() => {
    console.log('[Home] weather:', weather ? `${weather.condition} code=${weather.conditionCode} isDay=${weather.isDay}` : 'null');
    console.log('[Home] weatherIconKey:', weatherIconKey);
    console.log('[Home] timeOfDay:', timeOfDay);
  }, [weather, weatherIconKey]);

  // Fetch weather on mount (always null at startup) and when city changes
  useEffect(() => {
    if (isWeatherCacheValid(weather) && weather?.city === userSelectedCity.toLowerCase()) {
      return; // in-session cache still valid, skip
    }
    let cancelled = false;
    fetchWeather(userSelectedCity).then((data) => {
      if (!cancelled && data) {
        setWeather(data);
      }
    });
    return () => { cancelled = true; };
  }, [userSelectedCity]);

  // Sort vibes based on user preferences (preferred first)
  const sortedVibes: VibeCategory[] = useMemo(() => {
    return sortVibesByPreferences(preferences || []);
  }, [preferences]);

  // Get featured event (highest rated isFeatured event)
  const featuredEvent = useMemo(() => {
    return filteredEventsList
      .filter(e => e.isFeatured)
      .sort((a, b) => b.rating - a.rating)[0];
  }, [filteredEventsList]);

  // Filter events based on active vibe
  const filteredEvents = useMemo(() => {
    if (!activeVibe || activeVibe === 'all') {
      return filteredEventsList;
    }
    
    // Special handling for "Friends" vibe — show events where friends are attending
    if (activeVibe === 'friends') {
      return filteredEventsList.filter(e => {
        const attending = getAttendingFriends(e.id, friendsList, privateRSVPs, privacySettings.hideRSVPs);
        return attending.length > 0;
      });
    }
    
    const vibe = sortedVibes.find(v => v.id === activeVibe);
    if (!vibe) return filteredEventsList;
    
    return filteredEventsList.filter(e => 
      e.category.toLowerCase().includes(vibe.label.toLowerCase()) ||
      e.category.toLowerCase().includes(vibe.id.toLowerCase())
    );
  }, [activeVibe, sortedVibes, filteredEventsList, friendsList, privateRSVPs, privacySettings.hideRSVPs]);

  // Source list for sections — uses filteredEvents when a vibe filter is active
  const sectionSource = (!activeVibe || activeVibe === 'all') ? filteredEventsList : filteredEvents;

  // Search results — filter by query across title, category, venue, neighborhood
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return sectionSource.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      (e.neighborhood && e.neighborhood.toLowerCase().includes(q)) ||
      e.description.toLowerCase().includes(q)
    );
  }, [searchQuery, sectionSource]);

  const isSearching = searchQuery.trim().length > 0;

  // Get popular events in neighborhood
  const popularInArea = useMemo(() => {
    const neighborhood = location?.neighborhood;
    const matchingNeighborhood = sectionSource.filter(e => e.neighborhood === neighborhood);
    const sourceList = matchingNeighborhood.length > 0 ? matchingNeighborhood : sectionSource;
    return [...sourceList]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);
  }, [sectionSource, location]);

  // Get new & upcoming events (flexible date sorting)
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sectionSource
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [sectionSource]);

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

  const handleSelectCity = (city: string) => {
    useApp.getState().setUserSelectedCity(city.toLowerCase());
    setShowCityPicker(false);
  };

  const renderCityPicker = () => {
    const cities = ['Lahore', 'Karachi', 'Islamabad'];
    return (
      <Modal visible={showCityPicker} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowCityPicker(false)}
        >
          <View style={styles.cityDropdownContainer}>
            <Text style={styles.dropdownTitle}>Select City</Text>
            {cities.map((city) => {
              const isActive = userSelectedCity.toLowerCase() === city.toLowerCase();
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityOption, isActive && styles.cityOptionActive]}
                  onPress={() => handleSelectCity(city)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cityOptionText, isActive && styles.cityOptionTextActive]}>
                    {city}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#99E1D9" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

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
              colors={['#FF6B4A', '#E43414']}
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

  const renderPopularEvent = (event: Event) => {
    const attendingFriends = getAttendingFriends(event.id, friendsList, privateRSVPs, privacySettings.hideRSVPs);
    const hasFriendsAttending = attendingFriends.length > 0;

    return (
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
          {hasFriendsAttending ? (
            <View style={styles.friendAttendanceRow}>
              <View style={styles.stackedAvatars}>
                {attendingFriends.slice(0, 3).map((friend, idx) => (
                  <Image
                    key={friend.id}
                    source={{ uri: friend.avatar }}
                    style={[styles.miniAvatar, { marginLeft: idx > 0 ? -8 : 0, zIndex: 3 - idx }]}
                  />
                ))}
              </View>
              <Text style={styles.friendAttendeeText} numberOfLines={1}>
                {attendingFriends.map(f => f.name.split(' ')[0]).slice(0, 2).join(', ')}
                {attendingFriends.length > 2 && ` + ${attendingFriends.length - 2}`}
                {' '}other{attendingFriends.length > 2 ? 's' : ''} going
              </Text>
            </View>
          ) : (
            <View style={styles.popularMeta}>
              <Ionicons name="people" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.popularAttendees}>{event.attendees.toLocaleString()} going</Text>
            </View>
          )}
          <View style={styles.popularPriceTag}>
            <Text style={styles.popularPrice}>${event.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUpcomingEvent = (event: Event) => {
    const attendingFriends = getAttendingFriends(event.id, friendsList, privateRSVPs, privacySettings.hideRSVPs);
    const hasFriendsAttending = attendingFriends.length > 0;

    return (
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
          {hasFriendsAttending ? (
            <View style={styles.upcomingFriendRow}>
              <View style={styles.stackedAvatarsSmall}>
                {attendingFriends.slice(0, 2).map((friend, idx) => (
                  <Image
                    key={friend.id}
                    source={{ uri: friend.avatar }}
                    style={[styles.miniAvatarSmall, { marginLeft: idx > 0 ? -6 : 0, zIndex: 2 - idx }]}
                  />
                ))}
              </View>
              <Text style={styles.upcomingFriendText} numberOfLines={1}>
                {attendingFriends.map(f => f.name.split(' ')[0]).slice(0, 2).join(', ')}
                {attendingFriends.length > 2 && ` +${attendingFriends.length - 2}`} going
              </Text>
            </View>
          ) : (
            <View style={styles.upcomingMeta}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.upcomingLocation} numberOfLines={1}>{event.venue}</Text>
            </View>
          )}
        </View>
        <View style={styles.upcomingPriceTag}>
          <Text style={styles.upcomingPrice}>${event.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Dynamic Time-of-Day Gradient Background */}
      <LinearGradient
        colors={gradientColors as unknown as string[]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={styles.timeGradient}
      />

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
            onPress={() => setShowCityPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={14} color="#E43414" />
            <Text style={styles.locationText}>
              {userSelectedCity.charAt(0).toUpperCase() + userSelectedCity.slice(1)}
            </Text>
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

        {/* Greeting with Weather Emoji */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            {weatherIconSource ? (
              <Image source={weatherIconSource} style={styles.weatherIcon} />
            ) : null}
          </View>
          <Text style={styles.greetingSubtext}>{getGreetingSubtext()}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrap}>
          <BlurView intensity={40} tint="dark" style={styles.searchBarBlur}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); Keyboard.dismiss(); }} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Search Results */}
        {isSearching ? (
          <View style={styles.searchResultsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="search" size={18} color="#FF6B4A" />
              <Text style={styles.sectionTitle}>Results for "{searchQuery}"</Text>
              <Text style={styles.sectionCount}>{searchResults.length}</Text>
            </View>
            {searchResults.length > 0 ? (
              searchResults.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.searchResultCard}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: event.image }} style={styles.searchResultImage} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle} numberOfLines={1}>{event.title}</Text>
                    <View style={styles.searchResultMeta}>
                      <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.searchResultMetaText} numberOfLines={1}>{event.venue}</Text>
                    </View>
                    <View style={styles.searchResultMeta}>
                      <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.searchResultMetaText}>{event.date} · {event.time}</Text>
                    </View>
                  </View>
                  <View style={styles.searchResultPriceBadge}>
                    <Text style={styles.searchResultPrice}>{event.price === 0 ? 'Free' : `$${event.price}`}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.searchEmpty}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.15)" />
                <Text style={styles.searchEmptyText}>No events found</Text>
                <Text style={styles.searchEmptySubtext}>Try a different search term</Text>
              </View>
            )}
          </View>
        ) : (
          <>
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
            <GlassPill
              label="All"
              icon="flash"
              active={!activeVibe || activeVibe === 'all'}
              onPress={() => handleVibePress('all')}
              activeTextColor="#FF6B4A"
            />
            <GlassPill
              label="Friends"
              icon="people"
              active={activeVibe === 'friends'}
              onPress={() => handleVibePress('friends')}
              activeTextColor="#FF6B4A"
            />
            {sortedVibes.map((vibe) => (
              <GlassPill
                key={vibe.id}
                label={vibe.label}
                icon={vibe.icon as any}
                active={activeVibe === vibe.id}
                onPress={() => handleVibePress(vibe.id)}
                activeTextColor="#FF6B4A"
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular in Neighborhood Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={18} color="#FF6B4A" />
              <Text style={styles.sectionTitle}>Popular in {userSelectedCity.charAt(0).toUpperCase() + userSelectedCity.slice(1)}</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('ExploreTab')}>
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
            <TouchableOpacity onPress={() => setActiveTab('ExploreTab')}>
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
          </>
        )}
      </ScrollView>
      {renderCityPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  timeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 1,
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
    fontWeight: '500',
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
    zIndex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  weatherIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  greetingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontFamily: fonts.body,
  },
  searchBarWrap: {
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 1,
  },
  searchBarBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: fonts.body,
    paddingVertical: 0,
  },
  searchResultsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchResultImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    marginBottom: 4,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  searchResultMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  searchResultPriceBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchResultPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
  },
  searchEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  searchEmptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  searchEmptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  // Featured Banner Styles
  featuredBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFD700',
    fontFamily: fonts.body,
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: fonts.heading,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.body,
  },
  rsvpButton: {
    alignSelf: 'flex-start',
  },
  rsvpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  rsvpText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // Vibe Filters
  vibesSection: {
    marginBottom: 24,
    zIndex: 1,
  },
  vibesContainer: {
    paddingHorizontal: 20,
    gap: 10,
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
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
  },
  seeAll: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    fontFamily: fonts.body,
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.subheading,
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
    fontFamily: fonts.body,
  },
  // Friend attendance (stacked avatars)
  friendAttendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  stackedAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  friendAttendeeText: {
    fontSize: 11,
    color: '#FF6B4A',
    fontWeight: '500',
    flex: 1,
    fontFamily: fonts.bodyBold,
  },
  // Upcoming friend attendance
  upcomingFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stackedAvatarsSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  upcomingFriendText: {
    fontSize: 11,
    color: '#FF6B4A',
    fontWeight: '500',
    flex: 1,
    fontFamily: fonts.bodyBold,
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
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
  },
  upcomingContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    fontWeight: '500',
    color: '#E43414',
  },
  upcomingMonth: {
    fontSize: 10,
    fontWeight: '500',
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
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.subheading,
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
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityDropdownContainer: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 20,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: fonts.heading,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cityOptionActive: {
    backgroundColor: 'rgba(153,225,217,0.1)',
  },
  cityOptionText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  cityOptionTextActive: {
    color: '#99E1D9',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
});

export default HomeScreen;

