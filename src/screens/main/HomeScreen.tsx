import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { mockEvents } from '../../services/mockData';

const { width } = Dimensions.get('window');

const CARD_WIDTH = (width - 48 - 12) / 2;

const CATEGORIES = [
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'festival', label: 'Festival', icon: '🎉' },
  { id: 'more', label: 'More', icon: '···' },
];

const getMonth = (dateStr: string) => {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const d = new Date(dateStr);
  return months[d.getMonth()];
};
const getDay = (dateStr: string) => new Date(dateStr).getDate();

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const sectionAnim1 = useRef(new Animated.Value(0)).current;
  const sectionAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(sectionAnim1, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(sectionAnim2, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const popularEvents = mockEvents.slice(0, 6);

  const renderEventCard = ({ item, index }: { item: typeof mockEvents[0]; index: number }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.88}
    >
      <Image source={{ uri: item.image }} style={styles.eventCardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,12,18,0.92)']}
        style={styles.eventCardGradient}
      />
      {/* Heart icon */}
      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart-outline" size={18} color="#fff" />
      </TouchableOpacity>
      {/* Date badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateDay}>{getDay(item.date)}</Text>
        <Text style={styles.dateMonth}>{getMonth(item.date)}</Text>
      </View>
      {/* Info */}
      <View style={styles.eventCardInfo}>
        <Text style={styles.eventCardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventCardLocation} numberOfLines={1}>{item.location}</Text>
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
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hi, John 👋</Text>
            <Text style={styles.subGreeting}>Discover events{'\n'}just for you</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('ExploreTab')}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.searchPlaceholder}>Search events, artists, locations...</Text>
        </TouchableOpacity>

        {/* Popular Events */}
        <Animated.View style={{ opacity: sectionAnim1 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.cardRow}
            scrollEnabled={false}
            contentContainerStyle={styles.cardGrid}
          />
        </Animated.View>

        {/* Categories */}
        <Animated.View style={[styles.categoriesSection, { opacity: sectionAnim2 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('ExploreTab')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  avatarBtn: {
    marginLeft: 16,
    marginTop: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#99E1D9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    height: 50,
    marginHorizontal: 24,
    marginBottom: 28,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 14,
    color: '#99E1D9',
    fontWeight: '500',
  },
  cardGrid: {
    paddingHorizontal: 24,
  },
  cardRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
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
    height: 130,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(10,12,18,0.8)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    lineHeight: 13,
  },
  eventCardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  eventCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    lineHeight: 18,
  },
  eventCardLocation: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  eventCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E43414',
  },
  categoriesSection: {
    marginTop: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#161B24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
});

export default HomeScreen;
