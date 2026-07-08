// Notification service for MoodSignal v2 — daily check-in reminders.

import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

const REMINDER_KEY = 'moodsignal_reminder_hour_v2';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDaily(hour = 8): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await SecureStore.setItemAsync(REMINDER_KEY, String(hour));
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'How are you feeling?',
      body: 'Take a moment for your daily check-in.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await SecureStore.deleteItemAsync(REMINDER_KEY);
}

export async function getReminderHour(): Promise<number | null> {
  const val = await SecureStore.getItemAsync(REMINDER_KEY);
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}
