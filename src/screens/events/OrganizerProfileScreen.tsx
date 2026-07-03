import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { getOrganizerById, getEventsByOrganizer } from '../../services/mockData';
import { Event } from '../../types';
import ClaimVenueModal from '../../components/ui/ClaimVenueModal';
import MatteGlassCard from '../../components/ui/MatteGlassCard';

const { width } = Dimensions.get('window');

type TabType = 'upcoming' | 'past';

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

const OrganizerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { organizerId } = route.params;

  const { followedOrganizers, toggleFollowOrganizer } = useAuth();
  const isFollowed = followedOrganizers.includes(organizerId);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const organizer = useMemo(() => getOrganizerById(organizerId), [organizerId]);
  const organizerEvents = useMemo(() => getEventsByOrganizer(organizerId), [organizerId]);

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = organizerEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = organizerEvents
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleFollow = async () => {
    if (organizer) {
      await toggleFollowOrganizer(organizer.id, organizer.name);
    }
  };

  const handleInstagram = () => {
    if (organizer?.instagram) {
      const username = organizer.instagram.replace('@', '');
      Linking.openURL(`https://instagram.com/${username}`).catch(() => {});
    }
  };

  const handleWebsite = () => {
    if (organizer?.website) {
      Linking.openURL(organizer.website).catch(() => {});
    }
  };

  const renderEventItem = (event: Event, isPast: boolean) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, isPast && styles.eventCardPast]}
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
        <Text style={styles.eventPrice}>{event.price === 0 ? 'Free' : `Rs. ${event.price.toLocaleString('en-PK')}`}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!organizer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Organizer not found</Text>
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
          <Image source={{ uri: organizer.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(10,12,18,0.2)', 'rgba(10,12,18,0.95)']}
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
          {/* Centered Circular Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: organizer.avatar }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
            </View>
          </View>

          {/* Name + Bio */}
          <Text style={styles.organizerName}>{organizer.name}</Text>
          <Text style={styles.organizerBio}>{organizer.bio}</Text>

          {/* Metrics Row */}
          <MatteGlassCard style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{formatFollowers(organizer.followerCount)}</Text>
              <Text style={styles.metricLabel}>Followers</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{organizer.eventCount}</Text>
              <Text style={styles.metricLabel}>Events Hosted</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.metricNumber}>{organizer.rating}</Text>
            </View>
          </MatteGlassCard>

          {/* Action Buttons */}
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
              style={styles.socialBtn}
              onPress={handleInstagram}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              <Text style={styles.socialBtnText}>Instagram</Text>
            </TouchableOpacity>

            {organizer.website && (
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={handleWebsite}
                activeOpacity={0.8}
              >
                <Ionicons name="globe-outline" size={20} color="#FF6B4A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsList}>
            {organizer.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Event Feed Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
            {upcomingEvents.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'upcoming' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'upcoming' && styles.tabBadgeTextActive]}>
                  {upcomingEvents.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
            onPress={() => setActiveTab('past')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              Past Events
            </Text>
            {pastEvents.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'past' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'past' && styles.tabBadgeTextActive]}>
                  {pastEvents.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Event Feed */}
        <View style={styles.eventsSection}>
          {displayEvents.length > 0 ? (
            displayEvents.map(event => renderEventItem(event, activeTab === 'past'))
          ) : (
            <View style={styles.emptyEvents}>
              <Ionicons
                name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
                size={48}
                color="rgba(255,255,255,0.15)"
              />
              <Text style={styles.emptyEventsTitle}>
                {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              </Text>
              <Text style={styles.emptyEventsSubtitle}>
                {activeTab === 'upcoming'
                  ? 'Follow to get notified about new events'
                  : 'Events hosted by this organizer will appear here'}
              </Text>
            </View>
          )}
        </View>

        {/* Claim This Organizer */}
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
        venueName={organizer?.name || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    height: 180,
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
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#000000',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerName: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: fonts.heading,
  },
  organizerBio: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    fontFamily: fonts.body,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
  metricLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
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
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.bodyBold,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  tabActive: {
    backgroundColor: '#E43414',
    borderColor: '#E43414',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  eventsSection: {
    paddingHorizontal: 20,
  },
  eventCard: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  eventCardPast: {
    opacity: 0.6,
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
    color: '#000000',
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

export default OrganizerProfileScreen;
