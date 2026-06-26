import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { GradientButton } from '../../src/components/GradientButton';
import { Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { ZodiacWheel } from '../../src/components/ZodiacWheel';
import { getItem, setItem, KEYS } from '../../src/lib/storage';
import { getPlanetPositions } from '../../src/lib/astronomy';
import { PLANET_LORE } from '../../src/data/cosmicRim';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

interface CosmicBirth { year: string; month: string; day: string; hour: string; minute: string }
const EMPTY: CosmicBirth = { year: '', month: '', day: '', hour: '', minute: '' };

function toDate(b: CosmicBirth): Date | null {
  const y = parseInt(b.year, 10), m = parseInt(b.month, 10), d = parseInt(b.day, 10);
  const h = b.hour ? parseInt(b.hour, 10) : 12;
  const min = b.minute ? parseInt(b.minute, 10) : 0;
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d, h, min);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function BirthEcho() {
  const [birth, setBirth] = useState<CosmicBirth>(EMPTY);
  const [hasTime, setHasTime] = useState(true);

  useEffect(() => {
    getItem<{ birth: CosmicBirth; hasTime: boolean } | null>(KEYS.cosmicBirth, null).then((saved) => {
      if (saved) { setBirth(saved.birth); setHasTime(saved.hasTime); }
    });
  }, []);

  const birthDate = useMemo(() => toDate(hasTime ? birth : { ...birth, hour: '12', minute: '0' }), [birth, hasTime]);
  const echoPositions = useMemo(() => (birthDate ? getPlanetPositions(birthDate) : undefined), [birthDate]);
  const todayPositions = useMemo(() => getPlanetPositions(new Date()), []);

  const save = async () => {
    tap();
    await setItem(KEYS.cosmicBirth, { birth, hasTime });
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.lavender} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Your birth echo" accent={colors.lavender} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
          <Serif style={{ fontSize: 19, lineHeight: 27 }}>
            Enter your birth date (and time, if you know it) to see a faint echo of where the
            seven classical planets stood the day you were born — beside where they stand today.
          </Serif>
          <Muted style={{ marginTop: 8, fontSize: 12.5, lineHeight: 19 }}>
            Stored only on this device. Without an exact time we use midday, which is accurate
            for every planet except the fast-moving Moon (it can drift up to roughly one sign
            either side across a day).
          </Muted>

          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <GlassCard style={{ gap: spacing.sm }}>
              <Label>DATE OF BIRTH</Label>
              <Row gap={8}>
                <TextInput style={[styles.input, { flex: 1.3 }]} placeholder="YYYY" placeholderTextColor={colors.textFaint} keyboardType="number-pad" maxLength={4} value={birth.year} onChangeText={(t) => setBirth((b) => ({ ...b, year: t }))} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM" placeholderTextColor={colors.textFaint} keyboardType="number-pad" maxLength={2} value={birth.month} onChangeText={(t) => setBirth((b) => ({ ...b, month: t }))} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="DD" placeholderTextColor={colors.textFaint} keyboardType="number-pad" maxLength={2} value={birth.day} onChangeText={(t) => setBirth((b) => ({ ...b, day: t }))} />
              </Row>
              <Row gap={10} style={{ marginTop: 4, justifyContent: 'space-between' }}>
                <Body style={{ fontSize: 13 }}>I know my birth time</Body>
                <Pressable onPress={() => { tap(); setHasTime((v) => !v); }} accessibilityRole="button" accessibilityLabel="Toggle whether birth time is known">
                  <View style={[styles.toggle, hasTime && styles.toggleOn]}>
                    <Body color={hasTime ? colors.lavender : colors.textDim} style={{ fontSize: 13, fontFamily: font.sansMedium }}>{hasTime ? 'Yes' : 'No (use midday)'}</Body>
                  </View>
                </Pressable>
              </Row>
              {hasTime && (
                <Row gap={8}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="HH (24h)" placeholderTextColor={colors.textFaint} keyboardType="number-pad" maxLength={2} value={birth.hour} onChangeText={(t) => setBirth((b) => ({ ...b, hour: t }))} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM" placeholderTextColor={colors.textFaint} keyboardType="number-pad" maxLength={2} value={birth.minute} onChangeText={(t) => setBirth((b) => ({ ...b, minute: t }))} />
                </Row>
              )}
              <GradientButton label="Save" onPress={save} full />
            </GlassCard>

            {echoPositions && (
              <>
                <View style={{ alignItems: 'center', marginTop: spacing.md }}>
                  <ZodiacWheel size={280} positions={todayPositions} echoPositions={echoPositions} />
                </View>
                <Muted center style={{ fontSize: 12 }}>Bright glyphs: today. Faint glyphs: your birth moment.</Muted>

                <GlassCard style={{ gap: 8 }}>
                  <Label>YOUR BIRTH SKY</Label>
                  {echoPositions.map((p) => (
                    <Row key={p.id} style={{ justifyContent: 'space-between' }}>
                      <Row gap={8}>
                        <Body style={{ color: PLANET_LORE[p.id].color, fontSize: 16 }}>{PLANET_LORE[p.id].glyph}</Body>
                        <Body color={colors.text} style={{ fontFamily: font.sansMedium }}>{PLANET_LORE[p.id].name}</Body>
                      </Row>
                      <Muted>{p.sign} · {p.degreeInSign.toFixed(1)}°</Muted>
                    </Row>
                  ))}
                </GlassCard>
              </>
            )}
          </Animated.View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { fontFamily: font.sans, fontSize: 15, color: colors.text, backgroundColor: colors.surface1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.panelBorder, paddingVertical: 10, paddingHorizontal: 12, textAlign: 'center' },
  toggle: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1 },
  toggleOn: { borderColor: colors.lavender + '66', backgroundColor: colors.lavender + '18' },
});
