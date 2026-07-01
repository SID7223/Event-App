import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockEvents, getOrganizerById } from '../../services/mockData';
import { useAuth } from '../../store';
import { requestNotificationPermissions } from '../../utils/notifications';

const { width, height } = Dimensions.get('window');

const HERO_H = 340;

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

const formatFullDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

interface EventDetailScreenProps {}

const EventDetailScreen: React.FC<EventDetailScreenProps> = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { savedEvents, toggleRSVP } = useAuth();
  const isSaved = savedEvents.includes(eventId);
  
  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];
  
  // Mock social proof data
  const friendsGoing = Math.floor(Math.random() * 20) + 5;
  const localsInterested = Math.floor(Math.random() * 500) + 100;

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [-50, 0, 80],
    extrapolate: 'clamp',
  });

  const handleRSVPToggle = async () => {
    await toggleRSVP(eventId, event.title, event.date, event.time);
  };

  const handleShare = async () => {
    try {
      const deepLink = `zyntr://event/${event.id}`;
      const webLink = `https://zyntr.app/event/${event.id}`;
      
      const result = await Share.share({
        message: `Check out ${event.title} on Zyntr! ${webLink}`,
        url: webLink,
        title: event.title,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share event');
    }
  };

  const handleGetTickets = () => {
    // For demo purposes, show options
    Alert.alert(
      'Get Tickets',
      'Where would you like to get tickets?',
      [
        {
          text: 'Eventbrite',
          onPress: () => Linking.openURL(`https://www.eventbrite.com/e/${event.id}`),
        },
        {
          text: 'Ticketmaster',
          onPress: () => Linking.openURL(`https://www.ticketmaster.com/search?q=${encodeURIComponent(event.title)}`),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleVenuePress = () => {
    if (event.venueId) {
      navigation.navigate('VenueProfile', { venueId: event.venueId });
    } else {
      // Fallback: show directions alert
      Alert.alert(
        event.venue,
        event.location,
        [
          { text: 'Get Directions', onPress: () => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.location)}`) },
          { text: 'Close', style: 'cancel' },
        ]
      );
    }
  };

  const handleOrganizerPress = () => {
    if (event.organizerId) {
      navigation.navigate('OrganizerProfile', { organizerId: event.organizerId });
    }
  };

  // Look up organizer data for "Hosted By" row
  const organizerData = event.organizerId ? getOrganizerById(event.organizerId) : null;

  const isFreeEvent = event.price === 0;

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <Animated.View
        style={[styles.heroContainer, { transform: [{ translateY: imageTranslateY }] }]}
      >
        <Image source={{ uri: event.image }} style={styles.heroImage} />
        <LinearGradient
          colors={['rgba(10,12,18,0.2)', 'rgba(10,12,18,0.4)', 'rgba(10,12,18,0.95)']}
          locations={[0, 0.5, 1]}
          style={styles.heroGradient}
        />
      </Animated.View>

      {/* Floating Buttons */}
      <SafeAreaView style={styles.floatingButtons} edges={['top']}>
        <TouchableOpacity
          style={styles.floatBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.floatRight}>
          <TouchableOpacity style={styles.floatBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatBtn, isSaved && styles.floatBtnActive]} 
            onPress={handleRSVPToggle}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={22} 
              color={isSaved ? "#E43414" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSpacer} />

        <View style={styles.contentSection}>
          {/* Quick Info Bar */}
          <View style={styles.quickInfoBar}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar" size={16} color="#99E1D9" />
              <Text style={styles.quickInfoText}>
                {getMonth(event.date)} {getDay(event.date)}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="time" size={16} color="#99E1D9" />
              <Text style={styles.quickInfoText}>{formatTime(event.time)}</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <TouchableOpacity 
              style={styles.quickInfoItem} 
              onPress={handleVenuePress}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={16} color="#99E1D9" />
              <Text style={[styles.quickInfoText, styles.venueLink]} numberOfLines={1}>
                {event.venue}
              </Text>
              <Ionicons name="open-outline" size={12} color="rgba(153,225,217,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Title + Price */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            {!isFreeEvent && (
              <View style={styles.pricePill}>
                <Text style={styles.priceText}>${event.price}</Text>
              </View>
            )}
            {isFreeEvent && (
              <View style={[styles.pricePill, styles.freePill]}>
                <Text style={[styles.priceText, styles.freeText]}>FREE</Text>
              </View>
            )}
          </View>

          {/* Social Proof Badge */}
          <View style={styles.socialProofContainer}>
            <View style={styles.socialProofBadge}>
              <Ionicons name="flame" size={16} color="#E43414" />
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofNumber}>{friendsGoing}</Text> friends going
              </Text>
            </View>
            <View style={styles.socialProofDivider} />
            <View style={styles.socialProofBadge}>
              <Ionicons name="people" size={16} color="#99E1D9" />
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofNumber}>{localsInterested}+</Text> locals interested
              </Text>
            </View>
          </View>

          {/* Date & Time Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When & Where</Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#99E1D9" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatFullDate(event.date)}</Text>
                </View>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#99E1D9" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{formatTime(event.time)}</Text>
                </View>
              </View>
              
              <View style={styles.detailDivider} />
              
              <TouchableOpacity 
                style={styles.detailRow} 
                onPress={handleVenuePress}
                activeOpacity={0.7}
              >
                <View style={styles.detailIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#99E1D9" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Venue</Text>
                  <Text style={styles.detailValue}>{event.venue}</Text>
                  <Text style={styles.detailSubtext}>{event.location}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hosted By */}
          {organizerData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hosted By</Text>
              <TouchableOpacity
                style={styles.hostedByCard}
                onPress={handleOrganizerPress}
                activeOpacity={0.85}
              >
                <Image source={{ uri: organizerData.avatar }} style={styles.hostedByAvatar} />
                <View style={styles.hostedByInfo}>
                  <Text style={styles.hostedByName}>{organizerData.name}</Text>
                  <Text style={styles.hostedByFollowers}>
                    {organizerData.followerCount >= 1000
                      ? `${(organizerData.followerCount / 1000).toFixed(1)}k`
                      : organizerData.followerCount} followers
                  </Text>
                </View>
                <View style={styles.hostedByAction}>
                  <Text style={styles.hostedByViewText}>View Profile</Text>
                  <Ionicons name="chevron-forward" size={16} color="#99E1D9" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Event Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Stats</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={24} color="#99E1D9" />
                <Text style={styles.statNumber}>{event.attendees.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Attendees</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="star-outline" size={24} color="#FFD700" />
                <Text style={styles.statNumber}>{event.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="pricetag-outline" size={24} color="#E43414" />
                <Text style={styles.statNumber}>{event.category}</Text>
                <Text style={styles.statLabel}>Category</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.bottomBarContent}>
          {/* RSVP Button (always visible) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleRSVPToggle}
            style={styles.rsvpBtn}
          >
            <View style={[styles.rsvpBtnInner, isSaved && styles.rsvpBtnSaved]}>
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={20} 
                color={isSaved ? "#E43414" : "#FFFFFF"} 
              />
              <Text style={[styles.rsvpBtnText, isSaved && styles.rsvpBtnTextSaved]}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Get Tickets / RSVP Main Button */}
          {isFreeEvent ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleRSVPToggle}
              style={styles.mainBtnContainer}
            >
              <LinearGradient
                colors={isSaved ? ['#E43414', '#FF6B6B'] : ['#99E1D9', '#E43414']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainBtn}
              >
                <Ionicons 
                  name={isSaved ? "checkmark-circle" : "add-circle-outline"} 
                  size={22} 
                  color="#FFFFFF" 
                />
                <Text style={styles.mainBtnText}>
                  {isSaved ? "I'm Going" : "RSVP / I'm Going"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleGetTickets}
              style={styles.mainBtnContainer}
            >
              <LinearGradient
                colors={['#99E1D9', '#E43414']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mainBtn}
              >
                <Ionicons name="ticket-outline" size={22} color="#FFFFFF" />
                <Text style={styles.mainBtnText}>Get Tickets</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {/* Share Button */}
          <TouchableOpacity 
            style={styles.shareBtn} 
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_H,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  floatingButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 10,
  },
  floatRight: {
    flexDirection: 'row',
    gap: 10,
  },
  floatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatBtnActive: {
    backgroundColor: 'rgba(228,52,20,0.2)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSpacer: {
    height: HERO_H - 40,
  },
  contentSection: {
    backgroundColor: '#0A0C12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  // Quick Info Bar
  quickInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  venueLink: {
    color: '#99E1D9',
    textDecorationLine: 'underline',
    maxWidth: 120,
  },
  quickInfoDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  // Title Section
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  pricePill: {
    backgroundColor: '#99E1D9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0C12',
  },
  freePill: {
    backgroundColor: '#2ED573',
  },
  freeText: {
    color: '#FFFFFF',
  },
  // Social Proof
  socialProofContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  socialProofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialProofText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  socialProofNumber: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  socialProofDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  // Detail Card
  detailCard: {
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(153,225,217,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  // Hosted By
  hostedByCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  hostedByAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostedByInfo: {
    flex: 1,
  },
  hostedByName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  hostedByFollowers: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  hostedByAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostedByViewText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#99E1D9',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#161B24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(10,12,18,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rsvpBtn: {
    // RSVP button container
  },
  rsvpBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  rsvpBtnSaved: {
    backgroundColor: 'rgba(228,52,20,0.15)',
    borderColor: 'rgba(228,52,20,0.3)',
  },
  rsvpBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  rsvpBtnTextSaved: {
    color: '#E43414',
  },
  mainBtnContainer: {
    flex: 1,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    gap: 8,
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  shareBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});

export default EventDetailScreen;
