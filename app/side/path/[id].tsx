import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../../src/components/AnimatedBackground';
import { ModalHeader } from '../../../src/components/ModalHeader';
import { GradientButton } from '../../../src/components/GradientButton';
import { Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../../src/components/ui';
import { useSide } from '../../../src/side/SideContext';
import { getPath } from '../../../src/side/content';
import { getPathContext } from '../../../src/side/pathContext';
import { FlowerOfLife } from '../../../src/components/sacred/Geometry';
import { colors, font, radius, spacing } from '../../../src/theme/theme';
import { tap, select } from '../../../src/lib/haptics';

export default function PathDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const side = useSide();
  const path = getPath(String(id));

  if (!path) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaView style={{ flex: 1 }}><ModalHeader title="Path" /></SafeAreaView>
      </View>
    );
  }

  const active = side.activePaths.includes(path.id);
  const prog = side.pathProgress(path.id);
  const ctx = getPathContext(path.id);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={path.color} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title={path.title} accent={path.color} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
          <View style={styles.crestWrap}>
            <View style={styles.crestGeometry} pointerEvents="none">
              <FlowerOfLife size={150} color={path.color} opacity={0.12} rings={2} />
            </View>
            <View style={[styles.crest, { backgroundColor: path.color + '18', borderColor: path.color + '55' }]}>
              <Ionicons name={path.icon} size={34} color={path.color} />
            </View>
          </View>
          <Display style={{ fontSize: 28, marginTop: spacing.md }}>{path.title}</Display>
          <Muted style={{ marginTop: 2 }}>{path.tradition}</Muted>
          <Serif style={{ fontSize: 17, lineHeight: 26, marginTop: spacing.md }}>{path.blurb}</Serif>

          {active && (
            <Row style={{ marginTop: spacing.md }} gap={8}>
              <View style={[styles.activePill, { borderColor: path.color + '66' }]}>
                <Ionicons name="checkmark-circle" size={13} color={path.color} />
                <Muted style={{ fontSize: 12, color: path.color }}>Active · {prog.done}/{prog.total} quests</Muted>
              </View>
            </Row>
          )}

          {/* The teaching & its source */}
          {ctx && (
            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <GlassCard accent={path.color} style={{ gap: 8 }}>
                <Label color={path.color}>THE TEACHING</Label>
                <Body style={{ fontSize: 14.5, lineHeight: 22 }}>{ctx.concept}</Body>
              </GlassCard>
              <GlassCard style={{ gap: 8 }}>
                <Label>HOW WE PRACTICE IT</Label>
                <Body style={{ fontSize: 14, lineHeight: 21 }}>{ctx.practice}</Body>
              </GlassCard>
              <GlassCard style={{ gap: 6 }}>
                <Row gap={8}>
                  <Ionicons name="library-outline" size={14} color={colors.textDim} />
                  <Label>SOURCE MATERIAL</Label>
                </Row>
                <Muted style={{ fontSize: 12.5, lineHeight: 19 }}>{ctx.source}</Muted>
              </GlassCard>
            </View>
          )}

          {path.stages.map((stage, si) => (
            <Animated.View key={stage.id} entering={FadeInDown.delay(si * 60).duration(450)} style={{ marginTop: spacing.xl }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Label color={path.color}>STAGE {si + 1}</Label>
                  <Serif style={{ fontSize: 20, marginTop: 3 }}>{stage.title}</Serif>
                  <Muted style={{ fontSize: 13, marginTop: 2 }}>{stage.theme}</Muted>
                </View>
                <View style={[styles.reward, { borderColor: path.color + '40' }]}>
                  <Muted style={{ fontSize: 9.5, color: colors.textDim }}>REWARD</Muted>
                  <Body color={path.color} style={{ fontFamily: font.sansSemibold, fontSize: 12 }}>{stage.reward}</Body>
                </View>
              </Row>
              {stage.boss ? (
                <Row gap={6} style={{ marginTop: 8 }}>
                  <Ionicons name="skull-outline" size={13} color={colors.coral} />
                  <Muted style={{ fontSize: 12, color: colors.coral }}>Boss · {stage.boss}</Muted>
                </Row>
              ) : null}

              {ctx?.teachings?.[stage.id] ? (
                <GlassCard accent={path.color} style={{ marginTop: spacing.md }}>
                  <Serif style={{ fontSize: 15, lineHeight: 23 }}>{ctx.teachings[stage.id]}</Serif>
                </GlassCard>
              ) : null}

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                {stage.quests.map((q) => {
                  const done = q.repeatable ? side.isDoneToday(q.id) : side.isCompleted(q.id);
                  return (
                    <Pressable key={q.id} onPress={() => { tap(); router.push(`/side/quest/${q.id}`); }}>
                      <GlassCard style={[styles.quest, done && { opacity: 0.6 }]}>
                        <View style={[styles.check, done ? { backgroundColor: path.color, borderColor: path.color } : { borderColor: colors.panelBorderStrong }]}>
                          {done ? <Ionicons name="checkmark" size={13} color={colors.black} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14, textDecorationLine: done ? 'line-through' : 'none' }}>{q.title}</Body>
                          <Muted style={{ fontSize: 12 }} numberOfLines={1}>+{q.resonance} resonance{q.minutes ? ` · ${q.minutes} min` : ''}</Muted>
                        </View>
                        <Ionicons name="chevron-forward" size={15} color={colors.textDim} />
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ))}
        </Animated.ScrollView>

        {!active && (
          <View style={styles.footer}>
            <GradientButton label="Begin this path" onPress={() => { select(); side.startPath(path.id); }} full />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  crestWrap: { width: 150, height: 90, alignItems: 'center', justifyContent: 'center' },
  crestGeometry: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  crest: { width: 74, height: 74, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface1 },
  reward: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.surface1 },
  quest: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm, backgroundColor: 'transparent' },
});
