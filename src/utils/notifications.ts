import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
} as any);

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  // Configure for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('event-reminders', {
      name: 'Event Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E43414',
    });
  }

  return true;
};

// Schedule a reminder notification for an event
export const scheduleEventReminder = async (
  eventId: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Parse event date and time
    const [hours, minutes] = eventTime.split(':').map(Number);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(hours, minutes, 0, 0);

    // Set reminder 2 hours before event
    const reminderTime = new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000);
    
    // Don't schedule if event is in the past or reminder time is in the past
    if (reminderTime <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Event Reminder',
        body: `${eventTitle} starts in 2 hours! Don't miss it.`,
        data: { eventId, type: 'event-reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
        channelId: 'event-reminders',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelEventReminder = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Cancel all scheduled notifications for an event
export const cancelAllEventReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// ==================== TOPIC / ORGANIZER NOTIFICATIONS ====================

// Configure Android channel for organizer updates
const ensureOrganizerChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('organizer-updates', {
      name: 'Organizer Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B4A',
    });
  }
};

// Subscribe to topic notifications for a venue/organizer
// In a real app, this would register for FCM/APNs topic subscriptions.
// Here we schedule a sample "new event" notification to confirm subscription.
export const scheduleTopicNotification = async (
  organizerId: string,
  organizerName: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    await ensureOrganizerChannel();

    // Schedule a confirmation notification (simulates topic subscription)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⭐ Now Following ${organizerName}`,
        body: `You'll be notified when ${organizerName} publishes new events.`,
        data: { organizerId, type: 'organizer-follow' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: 'organizer-updates',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return null;
  }
};

// Cancel/unsubscribe from topic notifications
export const cancelTopicNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling topic notification:', error);
  }
};
