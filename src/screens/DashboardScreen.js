import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { SectionHeader, MacroBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { lastNDays, todayISO, todayLabel } from '../utils/diningUtils';

const BAR_MAX_H = 90;

export default function DashboardScreen() {
  const { user, weeklyData } = useApp();
  const [macroView, setMacroView] = useState('calories');

  // ── Build last-7-days chart data ─────────────────────────────────────────
  const chartDays = useMemo(() => {
    const today = todayISO();
    return lastNDays(7).map(({ dateStr, dayAbbr }) => {
      const isToday = dateStr === today;
      const data = isToday
        ? {
            calories: user.currentCalories || 0,
            protein:  user.currentProtein  || 0,
            carbs:    user.currentCarbs    || 0,
            fat:      user.currentFat      || 0,
          }
        : (weeklyData[dateStr] || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      return { day: dayAbbr, isToday, goal: user.calorieGoal, proteinGoal: user.proteinGoal, ...data };
    });
  }, [weeklyData, user.currentCalories, user.currentProtein, user.calorieGoal, user.proteinGoal]);

  const daysLogged = chartDays.filter((d) => d.calories > 0).length;
  const weekTotal  = chartDays.reduce((s, d) => s + d.calories, 0);
  const weekAvg    = daysLogged > 0 ? Math.round(weekTotal / daysLogged) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>{todayLabel()} · Weekly nutrition overview</Text>
      </View>

      {/* ── Week stats ───────────────────────────────────────────── */}
      <SectionHeader title="This Week" />
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{user.streak}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{daysLogged}</Text>
          <Text style={styles.statLabel}>Days Logged</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{weekAvg > 0 ? weekAvg : '—'}</Text>
          <Text style={styles.statLabel}>Avg kcal/day</Text>
        </View>
      </View>

      {/* ── Weekly bar chart ─────────────────────────────────────── */}
      <SectionHeader title="Calorie History" />
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Last 7 Days</Text>
          <View style={styles.chartToggle}>
            {['calories', 'protein'].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => setMacroView(v)}
                style={[styles.toggleBtn, macroView === v && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, macroView === v && styles.toggleTextActive]}>
                  {v === 'calories' ? 'Cal' : 'Pro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bars}>
          {chartDays.map((day) => {
            const val      = macroView === 'calories' ? day.calories : day.protein;
            const goal     = macroView === 'calories' ? day.goal : day.proteinGoal;
            const pct      = val === 0 ? 0 : Math.min((val / goal) * 100, 100);
            const overGoal = val > goal;
            return (
              <View key={day.day + day.isToday} style={styles.barWrap}>
                <View style={[styles.barTrack, day.isToday && styles.barTrackToday]}>
                  {val > 0 && (
                    <View style={[
                      styles.barFill,
                      { height: `${pct}%`, backgroundColor: overGoal ? COLORS.error : COLORS.primary },
                    ]} />
                  )}
                </View>
                <Text style={[styles.barDay, day.isToday && styles.barDayToday]}>{day.day}</Text>
                {val > 0 && (
                  <Text style={styles.barVal}>
                    {macroView === 'calories'
                      ? val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`
                      : `${val}g`}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Within goal</Text>
          <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Over goal</Text>
          <View style={[styles.legendDot, { backgroundColor: COLORS.border, marginLeft: SPACING.sm }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>

      {/* ── Today's macros ───────────────────────────────────────── */}
      <SectionHeader title="Today's Macros" />
      <View style={styles.macroCard}>
        <MacroBar label="Calories" current={user.currentCalories} goal={user.calorieGoal} color={COLORS.primary} />
        <MacroBar label="Protein"  current={user.currentProtein}  goal={user.proteinGoal}  color={COLORS.success} />
        <MacroBar label="Carbs"    current={user.currentCarbs}    goal={user.carbGoal}     color={COLORS.warning} />
        <MacroBar label="Fat"      current={user.currentFat}      goal={user.fatGoal}      color={COLORS.yellow} />
      </View>

      {/* ── Swipe tracker ────────────────────────────────────────── */}
      <SectionHeader title="Meal Swipes" />
      <View style={styles.swipeCard}>
        <View style={styles.swipeHeader}>
          <Text style={styles.swipeTitle}>Swipe Balance</Text>
          <Text style={styles.swipePlan}>{user.mealPlan}</Text>
        </View>
        {user.totalSwipes > 0 ? (
          <>
            <View style={styles.swipeNumRow}>
              <Text style={styles.swipeNum}>{user.swipesRemaining}</Text>
              <Text style={styles.swipeOf}> / {user.totalSwipes} remaining</Text>
            </View>
            <View style={styles.swipeBar}>
              <View style={[styles.swipeFill, {
                width: `${Math.min((user.swipesRemaining / user.totalSwipes) * 100, 100)}%`,
                backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success,
              }]} />
            </View>
            {user.swipesRemaining <= 4 && (
              <View style={styles.swipeAlert}>
                <Text style={styles.swipeAlertText}>Running low — budget carefully through the weekend.</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.swipeEmpty}>Update your swipe balance in Profile.</Text>
        )}
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {},

  pageHeader: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  title:    { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary, letterSpacing: -1 },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  statItem:    { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statDivider: { width: 0.5, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  statNum:     { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: -0.5 },
  statLabel:   { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
  },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  chartTitle:       { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  chartToggle:      { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.full, padding: 2 },
  toggleBtn:        { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  toggleBtnActive:  { backgroundColor: COLORS.primary },
  toggleText:       { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.surface },

  bars:          { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 36, gap: 4 },
  barWrap:       { flex: 1, alignItems: 'center' },
  barTrack:      {
    width: '85%', height: BAR_MAX_H,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm, overflow: 'hidden', justifyContent: 'flex-end',
  },
  barTrackToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  barFill:       { width: '100%', borderRadius: RADIUS.sm },
  barDay:        { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textSecondary, marginTop: 4 },
  barDayToday:   { color: COLORS.primary, fontFamily: FONTS.bold },
  barVal:        { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.textSecondary },

  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.md },
  legendDot:   { width: 8, height: 8, borderRadius: RADIUS.full },
  legendText:  { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginRight: SPACING.md },

  macroCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginHorizontal: SPACING.lg, ...SHADOWS.subtle,
  },

  swipeCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginHorizontal: SPACING.lg, ...SHADOWS.subtle,
  },
  swipeHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  swipeTitle:     { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePlan:      { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  swipeNumRow:    { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  swipeNum:       { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary, letterSpacing: -1 },
  swipeOf:        { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  swipeBar:       { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  swipeFill:      { height: '100%', borderRadius: RADIUS.full },
  swipeAlert:     { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.sm, padding: SPACING.md },
  swipeAlertText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.warning },
  swipeEmpty:     { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
});
