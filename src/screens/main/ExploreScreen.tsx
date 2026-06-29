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
import { mockEvents } from '../../services/mockData';

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

  const filtered = mockEvents.filter((e) => {
    if (!searchQuery) return true;
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderItem = ({ item, index }: { item: typeof mockEvents[0]; index: number }) => {
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
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={17} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder='"Concerts in Jakarta"'
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
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
            onPress={() => setActiveFilter(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },

  /* ── Search ── */
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 14,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%',
  },

  /* ── Filter chips ── */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  filterChipActive: {
    backgroundColor: '#99E1D9',
    borderColor: '#99E1D9',
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#0A0C12',
    fontWeight: '700',
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
    backgroundColor: '#161B24',
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
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  badgeMonth: {
    fontSize: 9,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#E43414',
  },
});

export default ExploreScreen;
