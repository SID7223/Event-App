import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { resolveImage } from '../../utils/images';
import { getVenueById, getVenueEvents } from '../../services/api';
import { Event } from '../../types';
import ClaimVenueModal from '../../components/ui/ClaimVenueModal';
import MatteGlassCard from '../../components/ui/MatteGlassCard';

const { width } = Dimensions.get('window');

const getMonth = (dateStr: string) => {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
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

const formatFollowers = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
};

const VenueProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { venueId } = route.params;

  const { followedVenues, toggleFollowVenue } = useAuth();
  const isFollowed = followedVenues.includes(venueId);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const [venue, setVenue] = useState<any>(null);
  const [venueEvents, setVenueEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [venueId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [venueData, eventsData] = await Promise.all([
        getVenueById(venueId),
        getVenueEvents(venueId),
      ]);
      setVenue(venueData.venue);
      setVenueEvents(eventsData);
    } catch (_) {
      setVenue(null);
      setVenueEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingEvents = venueEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = venueEvents
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFollow = async () => {
    if (venue) {
      await toggleFollowVenue(venue.id, venue.name);
    }
  };

  const handleMapLink = () => {
    if (venue) {
      const query = encodeURIComponent(venue.address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    }
  };

  const handleWebsite = () => {
    if (venue?.website) {
      Linking.openURL(venue.website).catch(() => {});
    }
  };

  const renderEventItem = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: resolveImage(event.imageId, event.image, 'medium') }} style={styles.eventImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,12,18,0.85)']}
        style={styles.eventGradient}
      />
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDay}>{getDay(event.date)}</Text>
        <Text style={styles.eventMonth}>{getMonth(event.date)}</Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.eventMetaText}>{formatTime(event.time)}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.eventMetaText} numberOfLines={1}>{event.venue || event.venue_name}</Text>
        </View>
      </View>
      <View style={styles.eventPriceTag}>
        <Text style={styles.eventPrice}>{event.price === 0 ? 'Free' : `Rs. ${event.price.toLocaleString('en-PK')}`}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#E43414" />
        </View>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Venue not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: resolveImage(venue.coverId, venue.coverImage, 'large') }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(10,12,18,0.3)', 'rgba(10,12,18,0.95)']}
            style={styles.coverGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: resolveImage(venue.logoId, venue.logo, 'thumbnail') }} style={styles.logo} />
          
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.venueName}>{venue.name}</Text>
              {venue.type === 'organizer' && (
                <View style={styles.organizerBadge}>
                  <Ionicons name="star" size={10} color="#FFD700" />
                </View>
              )}
            </View>
            <Text style={styles.venueType}>
              {venue.type === 'venue' ? 'Venue' : 'Organizer'}
            </Text>
          </View>

          {/* Stats Row */}
          <MatteGlassCard style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatFollowers(venue.followerCount)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{venue.eventCount}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statNumber}>{venue.rating}</Text>
            </View>
          </MatteGlassCard>

          {/* Follow + Map Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.followBtn, isFollowed && styles.followBtnActive]}
              onPress={handleFollow}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFollowed ? 'heart' : 'heart-outline'}
                size={20}
                color={isFollowed ? '#E43414' : '#FFFFFF'}
              />
              <Text style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}>
                {isFollowed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapBtn}
              onPress={handleMapLink}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={20} color="#FF6B4A" />
              <Text style={styles.mapBtnText}>Map</Text>
            </TouchableOpacity>

            {venue.website && (
              <TouchableOpacity
                style={styles.websiteBtn}
                onPress={handleWebsite}
                activeOpacity={0.8}
              >
                <Ionicons name="globe-outline" size={20} color="#FF6B4A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{venue.bio}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsList}>
            {venue.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={18} color="#E43414" />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Text style={styles.sectionCount}>{upcomingEvents.length}</Text>
            </View>
            {upcomingEvents.map(renderEventItem)}
          </View>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.4)" />
              <Text style={[styles.sectionTitle, styles.sectionTitleMuted]}>Past Events</Text>
              <Text style={[styles.sectionCount, styles.sectionCountMuted]}>{pastEvents.length}</Text>
            </View>
            {pastEvents.map(renderEventItem)}
          </View>
        )}

        {/* Empty State */}
        {venueEvents.length === 0 && (
          <View style={styles.emptyEvents}>
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyEventsTitle}>No events yet</Text>
          </View>
        )}

        {/* Claim Venue */}
        <TouchableOpacity style={styles.claimLink} onPress={() => setShowClaimModal(true)} activeOpacity={0.7}>
          <Text style={styles.claimLinkText}>Claim this page</Text>
        </TouchableOpacity>

        <ClaimVenueModal visible={showClaimModal} onClose={() => setShowClaimModal(false)} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
  },
  coverContainer: {
    width: width,
    height: 260,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  organizerBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueType: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: '#E43414',
  },
  followBtnActive: {
    backgroundColor: 'rgba(228,52,20,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(228,52,20,0.3)',
  },
  followBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  followBtnTextActive: {
    color: '#E43414',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.25)',
  },
  mapBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#FF6B4A',
  },
  websiteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.25)',
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  eventsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  sectionTitleMuted: {
    color: 'rgba(255,255,255,0.4)',
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#E43414',
    backgroundColor: 'rgba(228,52,20,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionCountMuted: {
    color: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  eventCard: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#14161E',
    position: 'relative',
  },
  eventCardPast: {
    opacity: 0.7,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  eventDateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(10,12,18,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDay: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 2,
  },
  eventMonth: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#E43414',
    letterSpacing: 1,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 70,
  },
  eventTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventMetaText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  eventPriceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  eventPrice: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyEventsTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.3)',
  },
  claimLink: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 10,
  },
  claimLinkText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
  },
});

export default VenueProfileScreen;