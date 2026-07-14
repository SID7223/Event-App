import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CachedImage from '../../components/ui/CachedImage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../store';
import { fonts } from '../../theme/fonts';
import { resolveImage } from '../../utils/images';
import { getOrganizerById, getOrganizerEvents } from '../../services/api';
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

  const [organizer, setOrganizer] = useState<any>(null);
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  useEffect(() => {
    loadData();
  }, [organizerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgData, eventsData] = await Promise.all([
        getOrganizerById(organizerId),
        getOrganizerEvents(organizerId),
      ]);
      setOrganizer(orgData.organizer);
      setOrganizerEvents(eventsData);
    } catch (_) {
      setOrganizer(null);
      setOrganizerEvents([]);
    } finally {
      setLoading(false);
    }
  };

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
      <CachedImage uri={resolveImage(event.imageId, event.image, 'medium')} style={styles.eventImage} />
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
          <CachedImage uri={resolveImage(organizer.coverId, organizer.coverImage, 'large')} style={styles.coverImage} priority="high" />
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
            <CachedImage uri={resolveImage(organizer.avatarId, organizer.avatar, 'thumbnail')} style={styles.avatar} priority="high" />
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
            {organizer.tags?.map((tag, index) => (
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

        {/* Events List */}
        {displayEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {displayEvents.map(event => renderEventItem(event, activeTab === 'past'))}
          </View>
        ) : (
          <View style={styles.emptyEvents}>
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyEventsTitle}>
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </Text>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A0C12',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  organizerBio: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(228,52,20,0.15)',
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  tabTextActive: {
    color: '#E43414',
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(228,52,20,0.25)',
  },
  tabBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  tabBadgeTextActive: {
    color: '#E43414',
  },
  eventsList: {
    paddingHorizontal: 20,
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

export default OrganizerProfileScreen;