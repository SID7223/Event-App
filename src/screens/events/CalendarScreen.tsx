import React, { useState, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { mockEvents } from '../../services/mockData';

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Dates with events for demo  
const EVENT_DAYS = [2, 12, 21, 25, 29];

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(new Date(2021, 11, 21)); // Dec 21
  const [currentMonth, setCurrentMonth] = useState(11); // December
  const [currentYear, setCurrentYear] = useState(2021);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay();

  const changeMonth = (dir: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      let m = currentMonth + dir;
      let y = currentYear;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      setCurrentMonth(m);
      setCurrentYear(y);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const eventsForDate = (date: Date) =>
    mockEvents.filter((e) => {
      const ed = new Date(e.date);
      return ed.toDateString() === date.toDateString();
    });

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDay(currentMonth, currentYear);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`e${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const hasEvent = EVENT_DAYS.includes(day);
      const isEventDay2 = day === 2;  // Today-style blue
      const isEventDay12 = day === 12; // Teal
      const isEventDay21 = day === 21; // Selected orange
      const isEventDay25 = day === 25; // Orange
      const isEventDay29 = day === 29; // Red/orange

      let cellBg = 'transparent';
      let textColor = '#FFFFFF';
      let borderColor = 'transparent';

      if (isSelected) {
        cellBg = '#E43414';
        textColor = '#FFFFFF';
      } else if (isEventDay2) {
        borderColor = '#FF6B4A';
      } else if (isEventDay12) {
        borderColor = '#FF6B4A';
      } else if (isEventDay25) {
        borderColor = '#E43414';
      } else if (isEventDay29) {
        borderColor = '#E43414';
      }

      cells.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => setSelectedDate(date)}
        >
          <View
            style={[
              styles.dayInner,
              { backgroundColor: cellBg, borderColor, borderWidth: borderColor !== 'transparent' ? 1.5 : 0 },
            ]}
          >
            <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  const selectedEvents = eventsForDate(selectedDate);
  // Fallback to first event for demo
  const displayEvents = selectedEvents.length > 0 ? selectedEvents : [mockEvents[0]];

  const selLabel = `${FULL_DAYS[selectedDate.getDay()]}, ${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events Calendar</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Month header */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.daysHeader}>
            {DAYS.map((d) => (
              <Text key={d} style={styles.dayHeaderText}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <Animated.View style={[styles.daysGrid, { opacity: fadeAnim }]}>
            {renderCalendar()}
          </Animated.View>
        </View>

        {/* Selected date events */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsDateLabel}>{selLabel}</Text>

          {displayEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              activeOpacity={0.88}
            >
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventBadgeDay}>{selectedDate.getDate()}</Text>
                <Text style={styles.eventBadgeMonth}>{SHORT_MONTHS[selectedDate.getMonth()]}</Text>
              </View>
              <Image source={{ uri: event.image }} style={styles.eventThumb} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventName} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.eventTime}>10:00 AM</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CELL_SIZE = (width - 48) / 7;

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
    paddingBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  eventsSection: {
    gap: 12,
  },
  eventsDateLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  eventDateBadge: {
    width: 44,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingVertical: 6,
  },
  eventBadgeDay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  eventBadgeMonth: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  eventThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 19,
  },
  eventTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default CalendarScreen;
