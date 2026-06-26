// Rolling local daily messages. iOS caps pending local notifications, so the app
// schedules a 60-day window and refreshes it when preferences change.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { dayOfYear, messageForDay, TYPE_META } from '../data/messages';

const WINDOW_DAYS = 60;
const CHANNEL_ID = 'daily-messages';

export interface NotifPrefs {
  enabled: boolean;
  hour: number;
  minute: number;
}

// Notifications are opt-in. Enabling them from Profile triggers the permission request.
export const DEFAULT_NOTIF_PREFS: NotifPrefs = { enabled: false, hour: 9, minute: 0 };

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily messages',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#66e0ca',
    vibrationPattern: [0, 120, 80, 120],
    sound: undefined,
  });
}

export async function requestPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    status = request.status;
  }
  return status === 'granted';
}

function nextOccurrence(daysAhead: number, hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + daysAhead);
  return date;
}

export async function scheduleDailyMessages(prefs: NotifPrefs): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return 0;

  const granted = await requestPermissions();
  if (!granted) return 0;
  await ensureAndroidChannel();

  const now = new Date();
  const todayTime = new Date();
  todayTime.setHours(prefs.hour, prefs.minute, 0, 0);
  const startOffset = now.getTime() >= todayTime.getTime() ? 1 : 0;

  let scheduled = 0;
  for (let index = startOffset; index < startOffset + WINDOW_DAYS; index++) {
    const when = nextOccurrence(index, prefs.hour, prefs.minute);
    const message = messageForDay(dayOfYear(when));
    const meta = TYPE_META[message.type];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${meta.label} · MoodSignal`,
        body: message.body,
        data: { messageId: message.id, url: `/message/${message.id}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });
    scheduled++;
  }
  return scheduled;
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function pendingCount(): Promise<number> {
  const list = await Notifications.getAllScheduledNotificationsAsync();
  return list.length;
}

export async function sendPreview(): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;
  await ensureAndroidChannel();
  const message = messageForDay(dayOfYear());
  const meta = TYPE_META[message.type];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${meta.label} · MoodSignal`,
      body: message.body,
      data: { messageId: message.id, url: `/message/${message.id}` },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 4,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}
