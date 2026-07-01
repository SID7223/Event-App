import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFilteredContent } from '../../hooks/useFilteredContent';
import GlassPill from '../../components/ui/GlassPill';
import { BlurView } from 'expo-blur';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

const FILTER_TABS = ['All', 'Events', 'Artists', 'Venues'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDateRange = (dateStr: string) => {
  const d = new Date(dateStr);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return `${MONTHS[d.getMonth()]} ${d.getDate()} - ${MONTHS[next.getMonth()]} ${next.getDate()}, ${next.getFullYear()}`;
};

const getDay = (dateStr: string) => new Date(dateStr).getDate();
const getMonth = (dateStr: string) => MONTHS[new Date(dateStr).getMonth()].toUpperCase();

// Fake attendee counts for display
const FAKE_COUNTS = [170, 169, 70, 10, 104, 106, 204, 150, 200, 40, 80, 99];

const LOCATION_SHORT: Record<string, string> = {
  'Gelora Bung Karno, Jakarta': 'Jakarta, Indonesia',
  'Jakarta Convention Center': 'Jakarta, Indonesia',
  'Museum MACAN, Bali': 'Bali, Indonesia',
  'Balai Kartini, Jakarta': 'Jakarta, Indonesia',
  'Ancol, Jakarta': 'Jakarta, Indonesia',
  'The Ritz-Carlton, Jakarta': 'Jakarta, Indonesia',
  'Dago Pakar, Bandung': 'Bandung, Indonesia',
  'GoWork, Jakarta': 'Jakarta, Indonesia',
  'Nusa Penida, Bali': 'Bali, Indonesia',
  'CGV Grand Indonesia, Jakarta': 'Jakarta, Indonesia',
  'Gedung Sate, Bandung': 'Bandung, Indonesia',
  'The Mulia, Bali': 'Bali, Indonesia',
};

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { events: filteredEventsList, userSelectedCity } = useFilteredContent();

  const filtered = filteredEventsList.filter((e) => {
    if (!searchQuery) return true;
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderItem = ({ item, index }: { item: typeof filteredEventsList[0]; index: number }) => {
    const count = FAKE_COUNTS[index % FAKE_COUNTS.length];
    const location = LOCATION_SHORT[item.location] ?? item.location;

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        activeOpacity={0.82}
      >
        {/* Thumbnail with date badge overlay */}
        <View style={styles.thumbContainer}>
          <Image source={{ uri: item.image }} style={styles.thumb} />
          {/* Date badge overlaid top-left of image */}
          <View style={styles.dateBadge}>
            <Text style={styles.badgeDay}>{getDay(item.date)}</Text>
            <Text style={styles.badgeMonth}>{getMonth(item.date)}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.dateRange}>{formatDateRange(item.date)}</Text>
          <Text style={styles.location}>{location}</Text>
        </View>

        {/* Count + Price */}
        <View style={styles.priceCol}>
          <Text style={styles.count}>({count})</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Your city directory</Text>
      </View>

      {/* City Directory Hub Grid */}
      <View style={styles.hubSection}>
        <Text style={styles.hubSectionTitle}>What are you looking for?</Text>
        <View style={styles.hubGrid}>
          {/* Cinema Card */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => navigation.navigate('Cinema')}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' }}
              style={styles.hubCardImage}
            />
            <View style={styles.hubCardOverlay} />
            <View style={styles.hubCardContent}>
              <View style={[styles.hubIconWrap, { backgroundColor: 'rgba(228,52,20,0.85)' }]}>
                <Ionicons name="film" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.hubCardTitle}>Cinema</Text>
              <Text style={styles.hubCardSub}>Movies & showtimes</Text>
            </View>
          </TouchableOpacity>

          {/* Dining Card */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => navigation.navigate('Dining')}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }}
              style={styles.hubCardImage}
            />
            <View style={styles.hubCardOverlay} />
            <View style={styles.hubCardContent}>
              <View style={[styles.hubIconWrap, { backgroundColor: 'rgba(255,107,74,0.85)' }]}>
                <Ionicons name="restaurant" size={20} color="#0A0C12" />
              </View>
              <Text style={styles.hubCardTitle}>Dining</Text>
              <Text style={styles.hubCardSub}>Restaurants & cafes</Text>
            </View>
          </TouchableOpacity>

          {/* Play & Sports Card */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => navigation.navigate('PlaySports')}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80' }}
              style={styles.hubCardImage}
            />
            <View style={styles.hubCardOverlay} />
            <View style={styles.hubCardContent}>
              <View style={[styles.hubIconWrap, { backgroundColor: 'rgba(255,184,0,0.85)' }]}>
                <Ionicons name="football" size={20} color="#0A0C12" />
              </View>
              <Text style={styles.hubCardTitle}>Play & Sports</Text>
              <Text style={styles.hubCardSub}>Venues & courts</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <BlurView intensity={40} tint="dark" style={styles.searchBlur}>
          <Ionicons name="search-outline" size={17} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.searchInput}
            placeholder={`"Concerts in ${userSelectedCity.charAt(0).toUpperCase() + userSelectedCity.slice(1)}"`}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab, i) => (
          <GlassPill
            key={tab}
            label={tab}
            active={activeFilter === i}
            onPress={() => setActiveFilter(i)}

          />
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },

  /* ── Header ── */
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: fonts.heading,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: fonts.body,
  },

  /* ── Hub Grid ── */
  hubSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  hubSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  hubGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  hubCard: {
    flex: 1,
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  hubCardImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hubCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,12,18,0.55)',
  },
  hubCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  hubIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  hubCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 1,
    fontFamily: fonts.heading,
  },
  hubCardSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },

  /* ── Search ── */
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    height: 48,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%',
    ...({
      outlineWidth: 0,
      outlineColor: 'transparent',
      outlineStyle: 'none',
    } as any),
  },

  /* ── Filter chips ── */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },


  /* ── List ── */
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* ── Row ── */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },

  /* Thumbnail + date overlay */
  thumbContainer: {
    position: 'relative',
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 14,
    resizeMode: 'cover',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(10,12,18,0.82)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    minWidth: 30,
  },
  badgeDay: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  badgeMonth: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    lineHeight: 12,
  },

  /* Event info */
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 21,
    marginBottom: 5,
  },
  dateRange: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 3,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  /* Price column */
  priceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    minWidth: 52,
  },
  count: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E43414',
  },
});

export default ExploreScreen;
