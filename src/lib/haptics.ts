// Thin wrapper around expo-haptics that respects a global on/off flag.
import * as Haptics from 'expo-haptics';

let enabled = true;
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function tap() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
export function press() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}
export function select() {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}
export function success() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
