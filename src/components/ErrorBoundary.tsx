import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/theme';

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes and shows a readable fallback instead of a frozen
 * screen. Also force-hides the native splash so the user is never stuck.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch() {
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>
            MoodSignal hit an unexpected error while starting. Please reopen the app — if it keeps happening, share this message:
          </Text>
          <ScrollView style={styles.box} contentContainerStyle={{ padding: 14 }}>
            <Text style={styles.err}>{this.state.error.message}</Text>
            {this.state.error.stack ? <Text style={styles.stack}>{this.state.error.stack}</Text> : null}
          </ScrollView>
          <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingTop: 80, paddingHorizontal: 24, gap: 14 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  box: { maxHeight: 320, backgroundColor: '#15110f', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,120,108,0.4)' },
  err: { color: colors.coral, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  stack: { color: colors.textDim, fontSize: 11, lineHeight: 16 },
  btn: { backgroundColor: colors.teal, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 4 },
  btnText: { color: colors.black, fontSize: 15, fontWeight: '700' },
});
