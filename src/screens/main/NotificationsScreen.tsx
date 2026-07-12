import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme/useTheme';
import { fonts } from '../../theme/fonts';
import { useNotifications } from '../../hooks/useApi';
import { markNotificationRead, markAllNotificationsRead } from '../../services/api';

import type { Notification } from '../../types';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  booking: 'ticket-outline',
  reminder: 'alarm-outline',
  promotion: 'pricetag-outline',
  update: 'information-circle-outline',
  error: 'alert-circle-outline',
  recommendation: 'compass-outline',
  feedback: 'chatbubble-outline',
  event_approved: 'checkmark-circle-outline',
  event_rejected: 'close-circle-outline',
};

const groupByTime = (items: Notification[]) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const today: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];

  items.forEach((n) => {
    const d = new Date(n.time);
    if (d >= todayStart) today.push(n);
    else if (d >= weekAgo) thisWeek.push(n);
    else earlier.push(n);
  });

  return { today, thisWeek, earlier };
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const t = useTheme();
  const queryClient = useQueryClient();
  const { data } = useNotifications();

  const notifications: Notification[] = (data as { items: Notification[] } | undefined)?.items ?? [];

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const groups = useMemo(() => groupByTime(notifications), [notifications]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {}
  };

  const handlePress = async (id: string) => {
    try {
      await markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {}
  };

  const renderGroup = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;
    return (
      <View key={title} style={styles.group}>
        <Text style={[styles.sectionTitle, { color: t.textMuted }]}>{title}</Text>
        {items.map((item, idx) => (
          <View key={item.id}>
            <TouchableOpacity
              style={[styles.item, { backgroundColor: t.bgItem }]}
              activeOpacity={0.7}
              onPress={() => handlePress(item.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: t.bgIcon }]}>
                <Ionicons
                  name={ICON_MAP[item.type] || 'notifications-outline'}
                  size={22}
                  color={t.accent}
                />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, { color: t.textPrimary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.body, { color: t.textMuted }]} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
            {idx < items.length - 1 && <View style={[styles.divider, { backgroundColor: t.divider }]} />}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={t.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.markBtn}>
          <Text style={[styles.markText, { color: t.accent }]}>Read all</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Groups */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {renderGroup('Today', groups.today)}
        {renderGroup('This week', groups.thisWeek)}
        {renderGroup('Earlier', groups.earlier)}

        {notifications.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={t.textMuted} />
            <Text style={[styles.emptyText, { color: t.textMuted }]}>No notifications yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: fonts.heading,
  },
  badge: {
    backgroundColor: '#E43414',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fonts.bodyBold,
  },
  markBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  markText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  group: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: fonts.bodyBold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.bodyBold,
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E43414',
  },
  divider: {
    height: 1,
    marginLeft: 70,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.body,
  },
});

export default NotificationsScreen;
