import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockEvents } from '../../services/mockData';

const { width, height } = Dimensions.get('window');

const HERO_H = 300;

const ARTISTS = [
  { name: 'Cevin Sephora', role: 'Visual Artist', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Jane Haris', role: 'Speaker', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

const getMonth = (dateStr: string) => {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return months[new Date(dateStr).getMonth()];
};
const getDay = (dateStr: string) => new Date(dateStr).getDate();
const formatDateRange = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const next = new Date(d); next.setDate(next.getDate() + 1);
  return `${months[d.getMonth()]} ${d.getDate()} - ${months[next.getMonth()]} ${next.getDate()}, ${d.getFullYear()}`;
};

const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { eventId } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [-50, 0, 80],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <Animated.View
        style={[styles.heroContainer, { transform: [{ translateY: imageTranslateY }] }]}
      >
        <Image source={{ uri: event.image }} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', '#0A0C12']}
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
          <TouchableOpacity style={styles.floatBtn}>
            <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatBtn}>
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
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
          {/* Date + Title + Price pill */}
          <View style={styles.titleRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{getDay(event.date)}</Text>
              <Text style={styles.dateMonth}>{getMonth(event.date)}</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.eventTitle}>{event.title}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>${event.price}</Text>
            </View>
          </View>

          {/* Info rows */}
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoText}>{formatDateRange(event.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoText}>10:00 AM – 10:00 PM</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={18} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoText}>{event.category}</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Artists */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Artists</Text>
            {ARTISTS.map((artist) => (
              <TouchableOpacity key={artist.name} style={styles.artistRow} activeOpacity={0.8}>
                <Image source={{ uri: artist.avatar }} style={styles.artistAvatar} />
                <View style={styles.artistInfo}>
                  <Text style={styles.artistName}>{artist.name}</Text>
                  <Text style={styles.artistRole}>{artist.role}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Book Ticket Button */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Booking', { eventId: event.id })}
        >
          <LinearGradient
            colors={['#99E1D9', '#E43414']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtn}
          >
            <Text style={styles.bookBtnText}>Book Ticket</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    height: 180,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  dateBadge: {
    width: 52,
    backgroundColor: '#161B24',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    lineHeight: 13,
  },
  titleCol: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  pricePill: {
    backgroundColor: '#99E1D9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0C12',
  },
  infoRows: {
    gap: 12,
    marginBottom: 24,
    paddingTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  artistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  artistRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0A0C12',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  bookBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EventDetailScreen;
