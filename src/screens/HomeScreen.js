import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, Badge, MacroBar, SectionHeader, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const ALERTS = [
  { id: 1, text: 'You have 20 min before class — Baker has low wait & GF options!', type: 'info' },
  { id: 2, text: 'Swipe balance running low: 8 swipes remain for the week.', type: 'warning' },
];

export default function HomeScreen({ navigation }) {
  const { user, diningHalls, loggedMeals } = useApp();
  const calPct = Math.min((user.currentCalories / user.calorieGoal) * 100, 100);
  const remaining = Math.max(user.calorieGoal - user.currentCalories, 0);
  const openHalls = diningHalls.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero header (OSU-style) ─────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroAppName}>Nutrigain</Text>
            <Text style={styles.heroGreeting}>{getGreeting()}, {user.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.name || 'S')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
        {/* Streak pill on hero */}
        <View style={styles.streakPill}>
          <Text style={styles.streakPillText}>🔥 {user.streak}-day logging streak</Text>
        </View>
      </View>

      {/* ── AT A GLANCE ─────────────────────────────────────────── */}
      <SectionHeader title="At a Glance" />
      <View style={styles.glanceRow}>
        {/* Calories card */}
        <View style={[styles.glanceCard, styles.glanceCardWide]}>
          <Text style={styles.glanceLabel}>Calories Today</Text>
          <Text style={styles.glanceNum}>{user.currentCalories}</Text>
          <Text style={styles.glanceSub}>{remaining} remaining of {user.calorieGoal}</Text>
          <View style={styles.glanceBar}>
            <View style={[styles.glanceBarFill, { width: `${calPct}%`, backgroundColor: calPct > 100 ? COLORS.error : COLORS.primary }]} />
          </View>
        </View>
        {/* Swipes card */}
        <View style={styles.glanceCard}>
          <Text style={styles.glanceLabel}>Swipes</Text>
          <Text style={styles.glanceNum}>{user.swipesRemaining}</Text>
          <Text style={styles.glanceSub}>remaining</Text>
        </View>
      </View>

      {/* Macros row */}
      <View style={styles.macroRow}>
        {[
          { label: 'Protein', cur: user.currentProtein, goal: user.proteinGoal, color: COLORS.primary },
          { label: 'Carbs', cur: user.currentCarbs, goal: user.carbGoal, color: COLORS.warning },
          { label: 'Fat', cur: user.currentFat, goal: user.fatGoal, color: '#FF9500' },
        ].map((m) => (
          <View key={m.label} style={styles.macroMini}>
            <Text style={styles.macroMiniLabel}>{m.label}</Text>
            <View style={styles.macroMiniBar}>
              <View style={[styles.macroMiniFill, {
                width: `${Math.min((m.cur / m.goal) * 100, 100)}%`,
                backgroundColor: m.color,
              }]} />
            </View>
            <Text style={styles.macroMiniVal}>{m.cur}g</Text>
          </View>
        ))}
      </View>

      {/* ── SMART ALERTS ────────────────────────────────────────── */}
      <SectionHeader title="Smart Alerts" action="See all" onAction={() => {}} />
      {ALERTS.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, alert.type === 'warning' && styles.alertWarning]}>
          <View style={[styles.alertDot, { backgroundColor: alert.type === 'warning' ? COLORS.warning : COLORS.primary }]} />
          <Text style={styles.alertText}>{alert.text}</Text>
        </View>
      ))}

      {/* ── NEARBY DINING ───────────────────────────────────────── */}
      <SectionHeader title="Nearby Dining" action="View all" onAction={() => navigation.navigate('DiningTab')} />
      <View style={styles.hallList}>
        {openHalls.map((hall, i) => (
          <TouchableOpacity
            key={hall.id}
            style={[styles.hallRow, i < openHalls.length - 1 && styles.hallRowBorder]}
            onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
            activeOpacity={0.7}
          >
            <View style={[styles.hallDotWrap, { backgroundColor: hall.status === 'green' ? COLORS.greenLight : hall.status === 'yellow' ? COLORS.yellowLight : COLORS.redLight }]}>
              <CrowdingDot status={hall.status} />
            </View>
            <View style={styles.hallMeta}>
              <Text style={styles.hallName}>{hall.name}</Text>
              <Text style={styles.hallSub}>{hall.distance} · {hall.waitTime}</Text>
            </View>
            <Text style={styles.hallChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TODAY'S MEALS ───────────────────────────────────────── */}
      <SectionHeader title="Today's Meals" action="Log meal" onAction={() => navigation.navigate('DiningTab')} />
      {loggedMeals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No meals logged yet today</Text>
          <Text style={styles.emptySub}>Browse dining halls to get started</Text>
        </View>
      ) : (
        loggedMeals.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <Text style={styles.logPeriod}>{log.mealPeriod.charAt(0).toUpperCase() + log.mealPeriod.slice(1)}</Text>
            {log.items.map((item, i) => (
              <View key={i} style={styles.logItem}>
                <Text style={styles.logItemName}>{item.name}</Text>
                <Text style={styles.logItemCal}>{item.calories} kcal</Text>
              </View>
            ))}
            <View style={styles.logTotal}>
              <Text style={styles.logTotalText}>Total: {log.totalCalories} kcal</Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {},

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroAppName: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.surface,
    letterSpacing: -1,
  },
  heroGreeting: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.surface },
  streakPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  streakPillText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.surface,
  },

  // At a Glance cards
  glanceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  glanceCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  glanceCardWide: { flex: 2 },
  glanceLabel: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  glanceNum: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xl,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  glanceSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  glanceBar: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  glanceBarFill: { height: '100%', borderRadius: RADIUS.full },

  // Macros row
  macroRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  macroMini: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    ...SHADOWS.subtle,
  },
  macroMiniLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  macroMiniBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  macroMiniFill: { height: '100%', borderRadius: RADIUS.full },
  macroMiniVal: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
  },

  // Alerts
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  alertWarning: { borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    marginTop: 5,
    flexShrink: 0,
  },
  alertText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Hall list (OSU-style grouped card)
  hallList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  hallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  hallRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  hallDotWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hallMeta: { flex: 1 },
  hallName: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  hallChevron: { fontSize: 20, color: COLORS.border, fontFamily: FONTS.regular },

  // Logged meals
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  emptySub: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  logCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  logPeriod: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xs,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: SPACING.sm,
  },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  logItemName: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary },
  logItemCal: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  logTotal: { borderTopWidth: 0.5, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  logTotalText: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, textAlign: 'right' },
});
