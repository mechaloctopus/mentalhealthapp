// 365-day rolling daily affirmations via local notifications.
//
// iOS caps pending local notifications at ~64, so we schedule a rolling window
// (default 60 days) of distinct daily messages and top it up every time the app
// opens. Tapping a notification deep-links into the message viewport.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { dayOfYear, messageForDay, TYPE_META } from '../data/messages';

const WINDOW_DAYS = 60;
const CHANNEL_ID = 'daily-affirmations';

export interface NotifPrefs {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = { enabled: true, hour: 9, minute: 0 };

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily affirmations',
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
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    status = req.status;
  }
  return status === 'granted';
}

function nextOccurrence(daysAhead: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + daysAhead);
  return d;
}

// Cancels existing and schedules a fresh rolling window of daily messages.
export async function scheduleDailyMessages(prefs: NotifPrefs): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return 0;

  const granted = await requestPermissions();
  if (!granted) return 0;
  await ensureAndroidChannel();

  const now = new Date();
  const todayTime = new Date();
  todayTime.setHours(prefs.hour, prefs.minute, 0, 0);
  // If today's time already passed, start from tomorrow.
  const startOffset = now.getTime() >= todayTime.getTime() ? 1 : 0;

  let scheduled = 0;
  for (let i = startOffset; i < startOffset + WINDOW_DAYS; i++) {
    const when = nextOccurrence(i, prefs.hour, prefs.minute);
    const day = dayOfYear(when);
    const msg = messageForDay(day);
    const meta = TYPE_META[msg.type];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${meta.label} · MoodSignal`,
        body: msg.body,
        data: { messageId: msg.id, url: `/message/${msg.id}` },
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

// Fire a sample notification a few seconds out so users can preview the experience.
export async function sendPreview(): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;
  await ensureAndroidChannel();
  const msg = messageForDay(dayOfYear());
  const meta = TYPE_META[msg.type];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${meta.label} · MoodSignal`,
      body: msg.body,
      data: { messageId: msg.id, url: `/message/${msg.id}` },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 4,
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}
