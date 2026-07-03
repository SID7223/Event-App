import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store';
import { mockEvents } from '../../services/mockData';
import { Event } from '../../types';
import GlassPill from '../../components/ui/GlassPill';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

type TabType = 'upcoming' | 'saved' | 'past';

interface PlanEvent {
  event: Event;
  isPast: boolean;
  isUpcoming: boolean;
}

const getDayOfWeek = (dateStr: string): string => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date(dateStr).getDay()];
};

const getDay = (dateStr: string): string => {
  return String(new Date(dateStr).getDate()).padStart(2, '0');
};

const getMonth = (dateStr: string): string => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[new Date(dateStr).getMonth()];
};

const formatTime = (time: string): string => {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const isEventPast = (event: Event): boolean => {
  const now = new Date();
  const eventDate = new Date(event.date);
  // Assume event ends at 11:59 PM on the event date
  eventDate.setHours(23, 59, 59, 999);
  return eventDate < now;
};

const isEventUpcoming = (event: Event): boolean => {
  const now = new Date();
  const eventDate = new Date(event.date);
  // Event is upcoming if date is today or in the future
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return eventDate >= todayStart;
};

const getWeatherIcon = (event: Event): string => {
  // V2 placeholder: random weather icons for demo
  const icons = ['sunny', 'cloudy', 'rainy', 'thunderstorm'];
  const index = parseInt(event.id) % icons.length;
  return icons[index];
};

const getWeatherLabel = (event: Event): string => {
  const labels = ['Clear skies', 'Partly cloudy', 'Rain expected', 'Thunderstorms'];
  const index = parseInt(event.id) % labels.length;
  return labels[index];
};

const MyPlansScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { savedEvents } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Build plans from saved events
  const plans = useMemo<PlanEvent[]>(() => {
    const saved = mockEvents.filter(e => savedEvents.includes(e.id));
    return saved.map(event => ({
      event,
      isPast: isEventPast(event),
      isUpcoming: isEventUpcoming(event),
    }));
  }, [savedEvents]);

  // Filter by tab
  const filteredPlans = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return plans
          .filter(p => p.isUpcoming && !p.isPast)
          .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
      case 'saved':
        return plans
          .filter(p => !p.isPast)
          .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
      case 'past':
        return plans
          .filter(p => p.isPast)
          .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
      default:
        return plans;
    }
  }, [plans, activeTab]);

  const tabs: { key: TabType; label: string; count: number }[] = useMemo(() => [
    {
      key: 'upcoming',
      label: 'Upcoming',
      count: plans.filter(p => p.isUpcoming && !p.isPast).length,
    },
    {
      key: 'saved',
      label: 'Saved',
      count: plans.filter(p => !p.isPast).length,
    },
    {
      key: 'past',
      label: 'Past',
      count: plans.filter(p => p.isPast).length,
    },
  ], [plans]);

  const renderPlanItem = ({ item }: { item: PlanEvent }) => {
    const { event, isPast } = item;

    return (
      <TouchableOpacity
        style={[styles.planRow, isPast && styles.planRowPast]}
        onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
        activeOpacity={0.88}
      >
        {/* Date Column */}
        <View style={styles.dateColumn}>
          <Text style={[styles.dayOfWeek, isPast && styles.textMuted]}>
            {getDayOfWeek(event.date)}
          </Text>
          <Text style={[styles.dayNumber, isPast && styles.textMuted]}>
            {getDay(event.date)}
          </Text>
          <Text style={[styles.monthLabel, isPast && styles.textMuted]}>
            {getMonth(event.date)}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.dateDivider, isPast && styles.dateDividerPast]} />

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, isPast && styles.textMuted]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isPast ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.timeText, isPast && styles.textMuted]}>
              {formatTime(event.time)}
            </Text>
          </View>
          <View style={styles.venueRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={isPast ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.venueText, isPast && styles.textMuted]} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
          
          {/* Weather Context (V2 placeholder) */}
          {!isPast && activeTab === 'upcoming' && (
            <View style={styles.weatherRow}>
              <Ionicons
                name={getWeatherIcon(event) as any}
                size={14}
                color="#FF6B4A"
              />
              <Text style={styles.weatherText}>{getWeatherLabel(event)}</Text>
            </View>
          )}
        </View>

        {/* Arrow */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isPast ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}
          style={styles.arrow}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const messages: Record<TabType, { icon: string; title: string; subtitle: string }> = {
      upcoming: {
        icon: 'calendar-outline',
        title: 'No upcoming plans',
        subtitle: 'RSVP to events to see them here',
      },
      saved: {
        icon: 'bookmark-outline',
        title: 'No saved events',
        subtitle: 'Save events you\'re interested in',
      },
      past: {
        icon: 'time-outline',
        title: 'No past events',
        subtitle: 'Events you attended will appear here',
      },
    };

    const msg = messages[activeTab];

    return (
      <View style={styles.emptyState}>
        <Ionicons name={msg.icon as any} size={48} color="rgba(255,255,255,0.15)" />
        <Text style={styles.emptyTitle}>{msg.title}</Text>
        <Text style={styles.emptySubtitle}>{msg.subtitle}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plans</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <GlassPill
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
            badge={tab.count > 0 ? tab.count : undefined}
          />
        ))}
      </View>

      {/* Plans List */}
      <FlatList
        data={filteredPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.event.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: spacing.xs,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  planRowPast: {
    opacity: 0.6,
  },
  dateColumn: {
    width: 48,
    alignItems: 'center',
  },
  dayOfWeek: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FF6B4A',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  dateDivider: {
    width: 2,
    height: 50,
    backgroundColor: 'rgba(228,52,20,0.3)',
    borderRadius: 1,
  },
  dateDividerPast: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.subheading,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  timeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venueText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
    fontFamily: fonts.body,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  weatherText: {
    fontSize: 12,
    color: '#FF6B4A',
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 4,
  },
  textMuted: {
    color: 'rgba(255,255,255,0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.subheading,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: fonts.body,
  },
});

export default MyPlansScreen;
