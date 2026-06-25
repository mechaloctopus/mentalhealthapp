import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { GradientButton } from '../../src/components/GradientButton';
import { Display, Body, Muted, Label, GlassCard, Serif, Row, Title } from '../../src/components/ui';
import { getItem, setItem } from '../../src/lib/storage';
import { useSide } from '../../src/side/SideContext';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap, success, select } from '../../src/lib/haptics';

interface Post { id: string; text: string; at: number; hearts: number; mine?: boolean }

const SEEDED: Post[] = [
  { id: 's1', text: 'Day 4 of choosing rest over guilt. It’s getting easier.', at: Date.now() - 36e5 * 2, hearts: 23 },
  { id: 's2', text: 'Forgave someone today — mostly for my own peace. Lighter already.', at: Date.now() - 36e5 * 5, hearts: 41 },
  { id: 's3', text: 'Anxious all morning, but I did my breathing and showed up anyway.', at: Date.now() - 36e5 * 8, hearts: 58 },
  { id: 's4', text: 'Called my mom for the first time in months. So glad I did.', at: Date.now() - 36e5 * 14, hearts: 76 },
  { id: 's5', text: 'To whoever needs it: you’re allowed to begin again. No speech required.', at: Date.now() - 36e5 * 22, hearts: 112 },
];

// A plausible, gently-moving "people present" number so it feels alive (local only).
function presentNow(): number {
  const t = Date.now() / 1000;
  return 60 + Math.round(45 * Math.abs(Math.sin(t / 900)) + 12 * Math.abs(Math.cos(t / 240)));
}

export default function Community() {
  const router = useRouter();
  const side = useSide();
  const [posts, setPosts] = useState<Post[]>(SEEDED);
  const [draft, setDraft] = useState('');
  const [present, setPresent] = useState(presentNow());

  useEffect(() => {
    (async () => {
      const mine = await getItem<Post[]>('communityPosts', []);
      const heartsMap = await getItem<Record<string, number>>('communityHearts', {});
      setPosts([...mine, ...SEEDED].map((p) => ({ ...p, hearts: p.hearts + (heartsMap[p.id] ? 1 : 0) })));
    })();
    const t = setInterval(() => setPresent(presentNow()), 5000);
    return () => clearInterval(t);
  }, []);

  const weekKarma = side.karma; // contribution proxy
  const goal = 10000;
  const communityProgress = 6480 + (weekKarma % 50); // seeded + your nudge

  const post = async () => {
    if (!draft.trim()) return;
    const entry: Post = { id: 'm' + Date.now(), text: draft.trim(), at: Date.now(), hearts: 0, mine: true };
    const mine = await getItem<Post[]>('communityPosts', []);
    const next = [entry, ...mine].slice(0, 100);
    await setItem('communityPosts', next);
    setPosts((p) => [entry, ...p]);
    setDraft('');
    success();
  };

  const heart = async (id: string) => {
    select();
    const heartsMap = await getItem<Record<string, number>>('communityHearts', {});
    if (heartsMap[id]) return; // one heart each
    heartsMap[id] = 1;
    await setItem('communityHearts', heartsMap);
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, hearts: p.hearts + 1 } : p)));
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.coral} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Community" accent={colors.coral} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
            <Display style={{ fontSize: 26 }}>You’re not alone</Display>
            <Muted style={{ marginTop: 4, marginBottom: spacing.lg }}>
              Anonymous, kind, and safe. A preview — it connects to the live community in a future update.
            </Muted>

            {/* Collective Calm */}
            <Animated.View entering={FadeInDown.duration(500)}>
              <GlassCard accent={colors.teal} style={{ gap: spacing.md }}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Label color={colors.teal}>COLLECTIVE CALM</Label>
                    <Serif style={{ fontSize: 20, marginTop: 4 }}>Sit together, now</Serif>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Row gap={6}>
                      <View style={styles.live} />
                      <Title style={{ fontFamily: font.serif, fontSize: 24, color: colors.teal }}>{present}</Title>
                    </Row>
                    <Muted style={{ fontSize: 11 }}>present now</Muted>
                  </View>
                </Row>
                <GradientButton label="Join the sit" onPress={() => { tap(); router.push('/breath'); }} full />
              </GlassCard>
            </Animated.View>

            {/* Weekly challenge */}
            <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.md }}>
              <GlassCard accent={colors.gold} style={{ gap: 10 }}>
                <Label color={colors.gold}>THIS WEEK’S COMPASSION CHALLENGE</Label>
                <Serif style={{ fontSize: 18 }}>10,000 small kindnesses</Serif>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, Math.round((communityProgress / goal) * 100))}%`, backgroundColor: colors.gold }]} />
                </View>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Muted style={{ fontSize: 12 }}>{communityProgress.toLocaleString()} / {goal.toLocaleString()}</Muted>
                  <Muted style={{ fontSize: 12, color: colors.gold }}>Your karma this week: {weekKarma}</Muted>
                </Row>
              </GlassCard>
            </Animated.View>

            {/* Compassion wall */}
            <Label style={{ marginTop: spacing.xl, marginBottom: 12 }}>THE COMPASSION WALL</Label>
            <GlassCard style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: spacing.md }}>
              <TextInput
                style={styles.input}
                placeholder="Share something honest or kind (anonymous)…"
                placeholderTextColor={colors.textFaint}
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <Pressable onPress={post} disabled={!draft.trim()} style={[styles.send, { backgroundColor: draft.trim() ? colors.coral : 'rgba(255,255,255,0.08)' }]}>
                <Ionicons name="arrow-up" size={18} color={draft.trim() ? colors.black : colors.textDim} />
              </Pressable>
            </GlassCard>

            <View style={{ gap: spacing.sm }}>
              {posts.map((p) => (
                <GlassCard key={p.id} style={{ gap: 10 }} accent={p.mine ? colors.coral : undefined}>
                  <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 22 }}>{p.text}</Body>
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Muted style={{ fontSize: 11.5 }}>{p.mine ? 'You · ' : 'Anonymous · '}{timeAgo(p.at)}</Muted>
                    <Pressable onPress={() => heart(p.id)} hitSlop={8}>
                      <Row gap={5}>
                        <Ionicons name="heart" size={15} color={colors.coral} />
                        <Muted style={{ fontSize: 12.5 }}>{p.hearts}</Muted>
                      </Row>
                    </Pressable>
                  </Row>
                </GlassCard>
              ))}
            </View>

            <Muted center style={{ marginTop: spacing.xl, fontSize: 11.5, lineHeight: 17 }}>
              Be kind. This is a space for support, not advice or crisis help. If you’re in danger, contact local emergency services or a crisis line.
            </Muted>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function timeAgo(ts: number): string {
  const h = Math.floor((Date.now() - ts) / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const styles = StyleSheet.create({
  live: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.moss },
  track: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 6 },
  input: { flex: 1, maxHeight: 100, minHeight: 40, fontFamily: font.sans, fontSize: 14.5, color: colors.text, paddingVertical: 8 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
