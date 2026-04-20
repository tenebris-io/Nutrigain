import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { MacroBar, SectionHeader, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';
import { isHallOpen, todayLabel, fmt12, timeToMinutes } from '../utils/diningUtils';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function buildAlerts(classes, diningHalls, user) {
  const now        = new Date();
  const today      = DAY_NAMES[now.getDay()];
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const openHalls = (diningHalls || [])
    .filter((h) => isHallOpen(h.hours))
    .sort((a, b) => a.capacity - b.capacity);
  const bestHall = openHalls[0];

  const todayClasses = (classes || [])
    .filter((c) => c.days.includes(today))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const alerts = [];

  // ── Upcoming class alert ──────────────────────────────────────────────────
  const nextClass = todayClasses.find((c) => timeToMinutes(c.startTime) > currentMin);
  if (nextClass) {
    const minsUntil = timeToMinutes(nextClass.startTime) - currentMin;
    if (minsUntil <= 90) {
      const hallTip = bestHall
        ? ` — ${bestHall.name} has ${bestHall.status === 'green' ? 'low wait' : 'moderate wait'} now`
        : '';
      alerts.push({
        id:   'next-class',
        text: `${nextClass.name} starts in ${minsUntil} min${hallTip}.`,
        type: minsUntil <= 30 ? 'warning' : 'info',
      });
    }
  }

  // ── Free gap between classes ──────────────────────────────────────────────
  const prevClass = [...todayClasses].reverse().find(
    (c) => timeToMinutes(c.endTime) <= currentMin
  );
  if (prevClass && nextClass) {
    const gap = timeToMinutes(nextClass.startTime) - currentMin;
    if (gap >= 45 && gap <= 180 && bestHall) {
      alerts.push({
        id:   'free-gap',
        text: `Free window before ${nextClass.name} at ${fmt12(nextClass.startTime)} — ${bestHall.name} has ${bestHall.status === 'green' ? 'low wait' : 'moderate wait'}. Good time to eat!`,
        type: 'info',
      });
    }
  }

  // ── No meals logged by mid-day ────────────────────────────────────────────
  if (now.getHours() >= 12 && user.currentCalories === 0) {
    alerts.push({
      id:   'no-meals',
      text: "You haven't logged a meal yet today. Head to Dining to get started!",
      type: 'warning',
    });
  }

  // ── Low swipes ────────────────────────────────────────────────────────────
  if (user.swipesRemaining > 0 && user.swipesRemaining <= 4) {
    alerts.push({
      id:   'swipes',
      text: `Swipe balance running low: ${user.swipesRemaining} swipe${user.swipesRemaining !== 1 ? 's' : ''} remaining this week.`,
      type: 'warning',
    });
  }

  // ── Prompt to add schedule if none set ────────────────────────────────────
  if (classes.length === 0) {
    alerts.push({
      id:   'add-schedule',
      text: 'Add your class schedule to get personalized meal timing alerts.',
      type: 'info',
    });
  }

  return alerts;
}

export default function HomeScreen({ navigation }) {
  const { user, diningHalls, loggedMeals, removeMealItem, classes } = useApp();

  const calPct    = Math.min(((user.currentCalories || 0) / (user.calorieGoal || 2000)) * 100, 100);
  const remaining = Math.max((user.calorieGoal || 2000) - (user.currentCalories || 0), 0);

  const sortedHalls = useMemo(() =>
    [...diningHalls].sort((a, b) => {
      const aOpen = isHallOpen(a.hours);
      const bOpen = isHallOpen(b.hours);
      if (aOpen && !bOpen) return -1;
      if (!aOpen && bOpen) return 1;
      return 0;
    }),
    [diningHalls]
  );

  const alerts = useMemo(() => buildAlerts(classes, diningHalls, user), [classes, diningHalls, user]);

  const nearbyHalls = sortedHalls.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroAppName}>Nutrigain</Text>
            <Text style={styles.heroGreeting}>{getGreeting()}, {(user.name || 'there').split(' ')[0]}</Text>
            <Text style={styles.heroDate}>{todayLabel()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{((user.name || 'S')[0] || 'S').toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakPillText}>🔥 {user.streak || 0}-day logging streak</Text>
        </View>
      </View>

      {/* ── AT A GLANCE ──────────────────────────────────────────── */}
      <SectionHeader title="At a Glance" />
      <View style={styles.glanceRow}>
        <View style={[styles.glanceCard, styles.glanceCardWide]}>
          <Text style={styles.glanceLabel}>Calories Today</Text>
          <Text style={styles.glanceNum}>{user.currentCalories || 0}</Text>
          <Text style={styles.glanceSub}>{remaining} remaining of {user.calorieGoal || 2000}</Text>
          <View style={styles.glanceBar}>
            <View style={[styles.glanceBarFill, {
              width: `${calPct}%`,
              backgroundColor: calPct > 100 ? COLORS.error : COLORS.primary,
            }]} />
          </View>
        </View>
        <View style={styles.glanceCard}>
          <Text style={styles.glanceLabel}>Swipes</Text>
          <Text style={styles.glanceNum}>{user.swipesRemaining ?? 0}</Text>
          <Text style={styles.glanceSub}>remaining</Text>
        </View>
      </View>

      {/* Macros row */}
      <View style={styles.macroRow}>
        {[
          { label: 'Protein', cur: user.currentProtein || 0, goal: user.proteinGoal || 90,  color: COLORS.primary },
          { label: 'Carbs',   cur: user.currentCarbs   || 0, goal: user.carbGoal    || 250, color: COLORS.warning },
          { label: 'Fat',     cur: user.currentFat     || 0, goal: user.fatGoal     || 70,  color: '#FF9500' },
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

      {/* ── SMART ALERTS ─────────────────────────────────────────── */}
      <SectionHeader
        title="Smart Alerts"
        action="Schedule"
        onAction={() => navigation.navigate('Schedule')}
      />
      {alerts.length === 0 ? (
        <View style={styles.alertCard}>
          <Text style={styles.alertText}>All clear — enjoy your meal!</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, alert.type === 'warning' && styles.alertWarning]}>
            <View style={[styles.alertDot, {
              backgroundColor: alert.type === 'warning' ? COLORS.warning : COLORS.primary,
            }]} />
            <Text style={styles.alertText}>{alert.text}</Text>
          </View>
        ))
      )}

      {/* ── NEARBY DINING ────────────────────────────────────────── */}
      <SectionHeader title="Nearby Dining" action="View all" onAction={() => navigation.navigate('DiningTab')} />
      <View style={styles.hallList}>
        {nearbyHalls.map((hall, i) => {
          const open = isHallOpen(hall.hours);
          const dotBg = open === false ? COLORS.border
            : hall.status === 'green' ? COLORS.greenLight
            : hall.status === 'yellow' ? COLORS.yellowLight
            : COLORS.redLight;
          return (
            <TouchableOpacity
              key={hall.id}
              style={[styles.hallRow, i < nearbyHalls.length - 1 && styles.hallRowBorder]}
              onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
              activeOpacity={0.7}
            >
              <View style={[styles.hallDotWrap, { backgroundColor: dotBg }]}>
                {open === false
                  ? <View style={styles.closedDot} />
                  : <CrowdingDot status={hall.status} />}
              </View>
              <View style={styles.hallMeta}>
                <Text style={styles.hallName}>{hall.name}</Text>
                <Text style={styles.hallSub}>{hall.distance} · {open === false ? 'Closed' : hall.waitTime}</Text>
              </View>
              {open === false && <Text style={styles.closedLabel}>Closed</Text>}
              <Text style={styles.hallChevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── TODAY'S MEALS ────────────────────────────────────────── */}
      <SectionHeader title="Today's Meals" action="Log meal" onAction={() => navigation.navigate('DiningTab')} />
      {loggedMeals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No meals logged yet today</Text>
          <Text style={styles.emptySub}>Browse dining halls to get started</Text>
        </View>
      ) : (
        loggedMeals.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <Text style={styles.logPeriod}>
              {log.mealPeriod.charAt(0).toUpperCase() + log.mealPeriod.slice(1)}
            </Text>
            {log.items.map((item, idx) => (
              <View key={idx} style={styles.logItem}>
                <View style={styles.logItemLeft}>
                  <Text style={styles.logItemName}>{item.name}</Text>
                  <Text style={styles.logItemCal}>{item.calories} kcal</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMealItem(log.id, idx)}
                  style={styles.logItemRemove}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.logItemRemoveText}>✕</Text>
                </TouchableOpacity>
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
  content:   {},

  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  heroAppName: { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.surface, letterSpacing: -1 },
  heroGreeting: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroDate:     { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  avatar: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText:  { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.surface },
  streakPill:  {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  streakPillText: { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: COLORS.surface },

  glanceRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  glanceCard:     { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg, ...SHADOWS.subtle },
  glanceCardWide: { flex: 2 },
  glanceLabel:    { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.4 },
  glanceNum:      { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, letterSpacing: -0.5 },
  glanceSub:      { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2, marginBottom: SPACING.sm },
  glanceBar:      { height: 5, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  glanceBarFill:  { height: '100%', borderRadius: RADIUS.full },

  macroRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs },
  macroMini: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, padding: SPACING.md, ...SHADOWS.subtle },
  macroMiniLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  macroMiniBar:   { height: 4, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 4 },
  macroMiniFill:  { height: '100%', borderRadius: RADIUS.full },
  macroMiniVal:   { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary },

  alertCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm, borderRadius: RADIUS.md, padding: SPACING.lg, ...SHADOWS.subtle,
  },
  alertWarning: { borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  alertDot:     { width: 8, height: 8, borderRadius: RADIUS.full, marginTop: 5, flexShrink: 0 },
  alertText:    { flex: 1, fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary, lineHeight: 20 },

  hallList: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg, overflow: 'hidden', ...SHADOWS.subtle,
  },
  hallRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.md },
  hallRowBorder: { borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  hallDotWrap:   { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  hallMeta:      { flex: 1 },
  hallName:      { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallSub:       { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  hallChevron:   { fontSize: 20, color: COLORS.border, fontFamily: FONTS.regular },
  closedDot:     { width: 9, height: 9, borderRadius: RADIUS.full, backgroundColor: COLORS.textSecondary },
  closedLabel:   { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },

  emptyCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, marginHorizontal: SPACING.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOWS.subtle },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  emptySub:   { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },

  logCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.subtle,
  },
  logPeriod: { fontFamily: FONTS.bold, fontSize: SIZES.xs, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: SPACING.sm },
  logItem:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  logItemLeft: { flex: 1 },
  logItemName: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary },
  logItemCal:  { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  logItemRemove:     { paddingLeft: SPACING.md },
  logItemRemoveText: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  logTotal:     { borderTopWidth: 0.5, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  logTotalText: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, textAlign: 'right' },
});
