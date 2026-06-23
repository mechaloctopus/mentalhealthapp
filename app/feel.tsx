import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { EmotionWheel } from '../src/components/EmotionWheel';
import { GradientButton } from '../src/components/GradientButton';
import { Serif, Muted } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { buildSelfCheckIn } from '../src/lib/voice';
import { getEmotion } from '../src/lib/emotions';
import { colors, spacing } from '../src/theme/theme';
import { success } from '../src/lib/haptics';

export default function Feel() {
  const router = useRouter();
  const { addCheckIn } = useApp();
  const [emotion, setEmotion] = useState<string>('calm');

  const log = () => {
    const c = buildSelfCheckIn(emotion);
    addCheckIn(c);
    success();
    const e = getEmotion(emotion);
    // Offer the matched practice straight away.
    router.replace(e.practice.route as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={getEmotion(emotion).color} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="How do you feel?" accent={getEmotion(emotion).color} />
        <Animated.View entering={FadeIn} style={styles.body}>
          <Serif center style={{ fontSize: 22, marginBottom: 4 }}>Name the feeling</Serif>
          <Muted center style={{ marginBottom: spacing.xl, maxWidth: 300 }}>
            Naming what you feel — even roughly — is a small act of clarity.
          </Muted>
          <EmotionWheel value={emotion} onChange={setEmotion} size={300} />
        </Animated.View>
        <View style={styles.footer}>
          <GradientButton label="Log this feeling" onPress={log} full />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.md },
});
