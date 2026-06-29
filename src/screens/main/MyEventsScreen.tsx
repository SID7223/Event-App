import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mockEvents, mockTickets } from '../../services/mockData';

const TABS = ['Upcoming', 'Past', 'Saved'];

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

type StatusType = 'confirmed' | 'interested' | 'past';

const getStatusForIndex = (index: number, tab: number): StatusType => {
  if (tab === 1) return 'past';
  return index % 2 === 0 ? 'confirmed' : 'interested';
};

const MyEventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: activeTab,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [activeTab]);

  const upcomingTickets = mockTickets.filter(t => t.status === 'upcoming');
  const pastTickets = mockTickets.filter(t => t.status === 'past');

  const getEventById = (id: string) => mockEvents.find(e => e.id === id) || mockEvents[0];

  const getListData = () => {
    if (activeTab === 0) return upcomingTickets.map(t => ({ ticket: t, event: getEventById(t.eventId) }));
    if (activeTab === 1) return pastTickets.map(t => ({ ticket: t, event: getEventById(t.eventId) }));
    return mockEvents.slice(0, 3).map(e => ({ ticket: null, event: e }));
  };

  const renderEventItem = ({ item, index }: { item: { ticket: any; event: typeof mockEvents[0] }; index: number }) => {
    const status = getStatusForIndex(index, activeTab);

    return (
      <TouchableOpacity
        style={styles.eventRow}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })}
        activeOpacity={0.88}
      >
        {/* Date badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{getDay(item.event.date)}</Text>
          <Text style={styles.dateMonth}>{getMonth(item.event.date)}</Text>
        </View>

        {/* Thumbnail */}
        <Image source={{ uri: item.event.image }} style={styles.thumbnail} />

        {/* Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.event.title}</Text>
          <Text style={styles.eventDate}>{formatDateRange(item.event.date)}</Text>
          <Text style={styles.eventLocation} numberOfLines={1}>{item.event.location}</Text>
          <Text style={styles.eventPrice}>
            {item.event.price === 0 ? 'Free' : `$${item.event.price}`}
          </Text>
          {/* Status badge */}
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusBadge,
                status === 'confirmed' ? styles.statusConfirmed :
                status === 'interested' ? styles.statusInterested :
                styles.statusPast,
              ]}
            >
              {status === 'confirmed' ? 'Ticket Confirmed' :
               status === 'interested' ? 'Interested' : 'Past'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const listData = getListData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === index && styles.tabActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      <FlatList
        data={listData as any}
        renderItem={renderEventItem}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#161B24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#99E1D9',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 12,
  },
  dateBadge: {
    width: 44,
    alignItems: 'center',
    backgroundColor: '#161B24',
    borderRadius: 10,
    paddingVertical: 6,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    lineHeight: 13,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  eventPrice: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusRow: {
    alignSelf: 'flex-end',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusConfirmed: {
    color: '#99E1D9',
  },
  statusInterested: {
    color: '#E43414',
  },
  statusPast: {
    color: 'rgba(255,255,255,0.4)',
  },
});

export default MyEventsScreen;
