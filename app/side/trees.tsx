import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { Display, Body, Muted, GlassCard, Row } from '../../src/components/ui';
import { useSide } from '../../src/side/SideContext';
import { TREES, treeLevel } from '../../src/side/trees';
import { colors, font, spacing } from '../../src/theme/theme';

export default function Trees() {
  const side = useSide();
  const sorted = [...TREES].sort((a, b) => (side.treeXp[b.id] ?? 0) - (side.treeXp[a.id] ?? 0));
  const totalLevels = TREES.reduce((a, t) => a + treeLevel(side.treeXp[t.id] ?? 0).level, 0);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.lavender} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Skill trees" accent={colors.lavender} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
          <Display style={{ fontSize: 28 }}>Your growth</Display>
          <Muted style={{ marginTop: 4, marginBottom: spacing.xl }}>
            {totalLevels} total levels across {TREES.length} trees. Each quest you complete waters the trees it belongs to.
          </Muted>

          <View style={{ gap: spacing.md }}>
            {sorted.map((t, i) => {
              const lv = treeLevel(side.treeXp[t.id] ?? 0);
              return (
                <Animated.View key={t.id} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(400)}>
                  <GlassCard style={{ gap: 10 }}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Row gap={10}>
                        <View style={[styles.icon, { backgroundColor: t.color + '1f' }]}>
                          <Ionicons name={t.icon} size={18} color={t.color} />
                        </View>
                        <View>
                          <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{t.label}</Body>
                          <Muted style={{ fontSize: 11.5 }}>{side.treeXp[t.id] ?? 0} XP</Muted>
                        </View>
                      </Row>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Body style={{ fontFamily: font.serif, fontSize: 22, color: t.color }}>{lv.level}</Body>
                        <Muted style={{ fontSize: 10 }}>LEVEL</Muted>
                      </View>
                    </Row>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.round((lv.into / lv.span) * 100)}%`, backgroundColor: t.color }]} />
                    </View>
                  </GlassCard>
                </Animated.View>
              );
            })}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  track: { height: 7, borderRadius: 6, backgroundColor: colors.hairline, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 6 },
});
