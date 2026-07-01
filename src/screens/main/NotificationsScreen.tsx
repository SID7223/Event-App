import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import NotificationCard from '../../components/cards/NotificationCard';
import EmptyState from '../../components/layout/EmptyState';
import { mockNotifications } from '../../services/mockData';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [badgeCount, setBadgeCount] = useState(
    mockNotifications.filter((n) => !n.read).length
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(
      100,
      notifications.map(() =>
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setBadgeCount(0);
  };

  const deleteNotification = (id: string) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {badgeCount > 0 && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount} new</Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              style={[
                styles.notificationWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <NotificationCard
                notification={notification}
                onDelete={() => deleteNotification(notification.id)}
                onPress={() => {
                  setNotifications((prev) =>
                    prev.map((n) =>
                      n.id === notification.id ? { ...n, read: true } : n
                    )
                  );
                  setBadgeCount((prev) => Math.max(0, prev - 1));
                }}
              />
            </Animated.View>
          ))
        ) : (
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            message="You're all caught up!"
          />
        )}
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: fonts.heading,
  },
  markAllRead: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  badgeContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,74, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent.cyan,
    fontFamily: fonts.body,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  notificationWrapper: {
    marginBottom: 12,
  },
});

export default NotificationsScreen;
