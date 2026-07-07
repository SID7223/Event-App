import { Platform } from 'react-native';

let Notifications: any = null;
let notificationsAvailable = true;

const loadNotifications = async (): Promise<any | null> => {
  if (Notifications) return Notifications;
  if (!notificationsAvailable) return null;
  try {
    const mod = await import('expo-notifications');
    Notifications = mod.default ?? mod;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return Notifications;
  } catch (error) {
    console.warn('expo-notifications not available in this environment:', error);
    notificationsAvailable = false;
    return null;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const N = await loadNotifications();
  if (!N) return false;

  try {
    const { status: existingStatus } = await N.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('event-reminders', {
        name: 'Event Reminders',
        importance: N.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E43414',
      });
    }

    return true;
  } catch (error) {
    console.warn('Notification permissions unavailable:', error);
    return false;
  }
};

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

    const N = await loadNotifications();
    if (!N) return null;

    const [hours, minutes] = eventTime.split(':').map(Number);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(hours, minutes, 0, 0);

    const reminderTime = new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000);

    if (reminderTime <= new Date()) {
      return null;
    }

    const notificationId = await N.scheduleNotificationAsync({
      content: {
        title: 'Event Reminder',
        body: `${eventTitle} starts in 2 hours! Don't miss it.`,
        data: { eventId, type: 'event-reminder' },
        sound: true,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
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

export const cancelEventReminder = async (notificationId: string): Promise<void> => {
  try {
    const N = await loadNotifications();
    if (!N) return;
    await N.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllEventReminders = async (): Promise<void> => {
  try {
    const N = await loadNotifications();
    if (!N) return;
    await N.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const getScheduledNotifications = async (): Promise<any[]> => {
  try {
    const N = await loadNotifications();
    if (!N) return [];
    return await N.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

const ensureOrganizerChannel = async (): Promise<void> => {
  const N = await loadNotifications();
  if (!N) return;
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('organizer-updates', {
      name: 'Organizer Updates',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B4A',
    });
  }
};

export const scheduleTopicNotification = async (
  organizerId: string,
  organizerName: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const N = await loadNotifications();
    if (!N) return null;

    await ensureOrganizerChannel();

    const notificationId = await N.scheduleNotificationAsync({
      content: {
        title: `Now Following ${organizerName}`,
        body: `You'll be notified when ${organizerName} publishes new events.`,
        data: { organizerId, type: 'organizer-follow' },
        sound: true,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
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

export const cancelTopicNotification = async (notificationId: string): Promise<void> => {
  try {
    const N = await loadNotifications();
    if (!N) return;
    await N.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling topic notification:', error);
  }
};
