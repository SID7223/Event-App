import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { Event } from '../../types';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, fontSizes, fontWeights } from '../../theme/spacing';

interface CalendarWidgetProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  style?: ViewStyle;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  onDateSelect,
  selectedDate,
  style,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startPadding = getDay(monthStart);
    const paddedDays: (Date | null)[] = [
      ...Array(startPadding).fill(null),
      ...days,
    ];

    return paddedDays;
  }, [currentMonth]);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (isSameMonth(eventDate, currentMonth)) {
        dates.add(format(eventDate, 'yyyy-MM-dd'));
      }
    });
    return dates;
  }, [events, currentMonth]);

  const hasEvent = (date: Date) => {
    return eventDates.has(format(date, 'yyyy-MM-dd'));
  };

  const isSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.daysOfWeekRow}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={`dow-${index}`} style={styles.dayOfWeekCell}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const today = isToday(date);
          const selected = isSelected(date);
          const hasEventOnDay = hasEvent(date);

          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={styles.dayCell}
              onPress={() => onDateSelect?.(date)}
              activeOpacity={0.7}
            >
              {selected ? (
                <LinearGradient
                  colors={[...colors.gradient.cyan]}
                  style={styles.selectedDayGradient}
                >
                  <Text style={[styles.dayText, styles.selectedDayText]}>
                    {format(date, 'd')}
                  </Text>
                </LinearGradient>
              ) : (
                <Text
                  style={[
                    styles.dayText,
                    today && styles.todayText,
                  ]}
                >
                  {format(date, 'd')}
                </Text>
              )}
              {hasEventOnDay && !selected && (
                <View style={styles.eventDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26,32,42,0.8)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  arrowButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.sm,
  },
  monthTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayOfWeekText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.text.primary,
  },
  todayText: {
    color: colors.accent.cyan,
    fontWeight: fontWeights.bold,
  },
  selectedDayGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: colors.text.inverse,
    fontWeight: fontWeights.bold,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.cyan,
    marginTop: 2,
  },
});

export default CalendarWidget;