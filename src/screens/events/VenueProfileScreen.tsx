import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { getVenueById, getEventsByVenue } from '../../services/mockData';
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

  const venue = useMemo(() => getVenueById(venueId), [venueId]);
  const venueEvents = useMemo(() => getEventsByVenue(venueId), [venueId]);

  // Separate upcoming and past events
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
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleWebsite = () => {
    if (venue?.website) {
      Linking.openURL(venue.website);
    }
  };

  const renderEventItem = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
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
          <Text style={styles.eventMetaText} numberOfLines={1}>{event.venue}</Text>
        </View>
      </View>
      <View style={styles.eventPriceTag}>
        <Text style={styles.eventPrice}>{event.price === 0 ? 'Free' : `$${event.price}`}</Text>
      </View>
    </TouchableOpacity>
  );

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
          <Image source={{ uri: venue.coverImage }} style={styles.coverImage} />
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
          <Image source={{ uri: venue.logo }} style={styles.logo} />
          
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
              {venue.type === 'venue' ? 'Venue' : 'Organizer'} • {venue.neighborhood}
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
            {venue.tags.map((tag, index) => (
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
            <Text style={styles.emptyEventsSubtitle}>
              Follow {venue.name} to get notified about new events
            </Text>
          </View>
        )}

        {/* Claim This Venue */}
        <View style={styles.claimSection}>
          <TouchableOpacity
            style={styles.claimLink}
            onPress={() => setShowClaimModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="rgba(255,255,255,0.35)" />
            <Text style={styles.claimText}>Do you own this business? <Text style={styles.claimHighlight}>Claim this page.</Text></Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ClaimVenueModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        venueName={venue?.name || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0A0C12',
    marginBottom: 12,
  },
  nameSection: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  organizerBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  followBtnActive: {
    backgroundColor: 'rgba(228,52,20,0.15)',
    borderColor: 'rgba(228,52,20,0.3)',
  },
  followBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  followBtnTextActive: {
    color: '#E43414',
    fontFamily: fonts.bodyBold,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.2)',
  },
  mapBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
    fontFamily: fonts.bodyBold,
  },
  websiteBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  eventsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    fontFamily: fonts.subheading,
  },
  sectionTitleMuted: {
    color: 'rgba(255,255,255,0.4)',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E43414',
  },
  sectionCountMuted: {
    color: 'rgba(255,255,255,0.3)',
  },
  eventCard: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  eventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    padding: 14,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: fonts.subheading,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  eventMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fonts.body,
  },
  eventPriceTag: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eventPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyEventsTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyEventsSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Claim Section
  claimSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  claimLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  claimText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: fonts.body,
  },
  claimHighlight: {
    color: 'rgba(255,107,74,0.7)',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
});

export default VenueProfileScreen;
