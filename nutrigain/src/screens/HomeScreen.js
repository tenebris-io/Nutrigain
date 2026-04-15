import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, Badge, MacroBar, SectionHeader, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const ALERTS = [
  { id: 1, icon: '🔔', text: 'You have 20 min before class — Baker has low wait & GF options!', type: 'info' },
  { id: 2, icon: '⚠️', text: 'Swipe balance running low: 8 swipes remain for the week.', type: 'warning' },
];

export default function HomeScreen({ navigation }) {
  const { user, diningHalls, loggedMeals } = useApp();
  const calPct = Math.min((user.currentCalories / user.calorieGoal) * 100, 100);
  const proteinPct = Math.min((user.currentProtein / user.proteinGoal) * 100, 100);
  const carbPct = Math.min((user.currentCarbs / user.carbGoal) * 100, 100);
  const remaining = user.calorieGoal - user.currentCalories;

  const openHalls = diningHalls.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getTimeOfDay()},</Text>
          <Text style={styles.name}>{user.name} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || 'S')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Streak Banner */}
      <View style={styles.streakBanner}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakLabel}>Logging streak</Text>
          <Text style={styles.streakCount}>{user.streak} days in a row</Text>
        </View>
        <Badge label="Keep it up!" color="primary" />
      </View>

      {/* Calorie Ring */}
      <Card style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <View style={styles.ringWrap}>
            <RingChart pct={calPct} />
          </View>
          <View style={styles.calorieStats}>
            <Text style={styles.calorieEaten}>{user.currentCalories}</Text>
            <Text style={styles.calorieLabel}>kcal eaten</Text>
            <View style={styles.calorieDivider} />
            <Text style={styles.calorieRemaining}>{remaining > 0 ? remaining : 0}</Text>
            <Text style={styles.calorieLabel}>remaining</Text>
          </View>
        </View>
        <View style={styles.macros}>
          <MacroBar label="Protein" current={user.currentProtein} goal={user.proteinGoal} color={COLORS.primary} />
          <MacroBar label="Carbs" current={user.currentCarbs} goal={user.carbGoal} color={COLORS.secondary} />
          <MacroBar label="Fat" current={user.currentFat} goal={user.fatGoal} color={COLORS.yellow} />
        </View>
      </Card>

      {/* Smart Alerts */}
      <SectionHeader title="Smart Alerts" action="See all" onAction={() => {}} />
      {ALERTS.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, alert.type === 'warning' && styles.alertWarning]}>
          <Text style={styles.alertIcon}>{alert.icon}</Text>
          <Text style={styles.alertText}>{alert.text}</Text>
        </View>
      ))}

      {/* Nearby Dining */}
      <SectionHeader title="Nearby Dining" action="View all" onAction={() => navigation.navigate('DiningTab')} />
      {openHalls.map((hall) => (
        <TouchableOpacity
          key={hall.id}
          style={styles.hallRow}
          onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
          activeOpacity={0.85}
        >
          <View style={styles.hallLeft}>
            <View style={styles.hallIconWrap}>
              <Text style={styles.hallIcon}>🍽️</Text>
            </View>
            <View>
              <Text style={styles.hallName}>{hall.name}</Text>
              <Text style={styles.hallSub}>{hall.distance} · {hall.waitTime}</Text>
            </View>
          </View>
          <View style={styles.hallRight}>
            <CrowdingDot status={hall.status} />
            <Text style={[styles.hallStatus, { color: hall.status === 'green' ? COLORS.success : hall.status === 'yellow' ? COLORS.yellow : COLORS.error }]}>
              {hall.status === 'green' ? 'Open' : hall.status === 'yellow' ? 'Busy' : 'Crowded'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Today's Logged Meals */}
      <SectionHeader title="Today's Meals" action="Log meal" onAction={() => navigation.navigate('DiningTab')} />
      {loggedMeals.length === 0 ? (
        <View style={styles.emptyMeals}>
          <Text style={styles.emptyEmoji}>🥗</Text>
          <Text style={styles.emptyText}>No meals logged yet today</Text>
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

// ── Simple ring chart ──────────────────────────────────────────────────
function RingChart({ pct }) {
  const size = 90;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = circ - (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: COLORS.border,
      }} />
      {/* Progress ring approximation */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke,
        borderTopColor: COLORS.primary,
        borderRightColor: pct > 25 ? COLORS.primary : COLORS.border,
        borderBottomColor: pct > 50 ? COLORS.primary : COLORS.border,
        borderLeftColor: pct > 75 ? COLORS.primary : COLORS.border,
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={styles.ringPct}>{Math.round(pct)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingTop: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  greeting: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary },
  name: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, letterSpacing: -0.5 },
  avatar: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.surface },
  streakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.xl, ...SHADOWS.subtle,
  },
  streakEmoji: { fontSize: 28 },
  streakLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  streakCount: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.primary },
  calorieCard: { marginBottom: SPACING.xl },
  calorieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl, gap: SPACING.xl },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.primary },
  calorieStats: { flex: 1 },
  calorieEaten: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.textPrimary, letterSpacing: -1 },
  calorieLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  calorieDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  calorieRemaining: { fontFamily: FONTS.semiBold, fontSize: SIZES.lg, color: COLORS.primary, letterSpacing: -0.5 },
  macros: {},
  alertCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.secondaryLight, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  alertWarning: { backgroundColor: COLORS.warningLight },
  alertIcon: { fontSize: 20 },
  alertText: { flex: 1, fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textPrimary, lineHeight: 20 },
  hallRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  hallLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  hallIconWrap: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  hallIcon: { fontSize: 22 },
  hallName: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  hallRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  hallStatus: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm },
  emptyMeals: { alignItems: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  emptySub: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  logCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  logPeriod: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.primary, marginBottom: SPACING.sm },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  logItemName: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary },
  logItemCal: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  logTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  logTotalText: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, textAlign: 'right' },
});
