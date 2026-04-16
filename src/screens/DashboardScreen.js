import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, SectionHeader, MacroBar } from '../components/ui';
import { WEEKLY_NUTRITION } from '../data/mockData';
import { useApp } from '../context/AppContext';

const BAR_MAX_H = 90;

const INSIGHTS = [
  { title: 'Protein on track', desc: 'You hit your protein goal 4 out of 6 days this week.', color: COLORS.primary },
  { title: 'Veggie win', desc: 'Your vegan choices this week totaled 3 complete meals.', color: COLORS.success },
  { title: 'Calorie deficit', desc: 'Wednesday was low — try a full breakfast at Baker next time.', color: COLORS.warning },
];

const RECOMMENDATIONS = [
  { title: 'Salmon with Quinoa', hall: 'Scott House', cal: 520, protein: 42, tag: 'High protein · GF' },
  { title: 'Vegan Lentil Soup', hall: 'Baker Hall', cal: 210, protein: 12, tag: 'Vegan · GF' },
  { title: 'GF Protein Pancakes', hall: 'Traditions', cal: 310, protein: 24, tag: 'GF · High protein' },
];

export default function DashboardScreen() {
  const { user } = useApp();
  const [macroView, setMacroView] = useState('calories');

  const weekTotal = WEEKLY_NUTRITION.reduce((s, d) => s + d.calories, 0);
  const weekAvg = Math.round(weekTotal / 6);
  const daysLogged = WEEKLY_NUTRITION.filter((d) => d.calories > 0).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Weekly nutrition overview</Text>
      </View>

      {/* ── AT A GLANCE stats (OSU-style 3-up row) ───────────────── */}
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
          <Text style={styles.statNum}>{weekAvg}</Text>
          <Text style={styles.statLabel}>Avg kcal/day</Text>
        </View>
      </View>

      {/* ── Weekly bar chart ─────────────────────────────────────── */}
      <SectionHeader title="Calorie History" />
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>This Week</Text>
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
          {WEEKLY_NUTRITION.map((day) => {
            const val = macroView === 'calories' ? day.calories : day.protein;
            const goal = macroView === 'calories' ? day.goal : 90;
            const pct = val === 0 ? 0 : Math.min((val / goal) * 100, 100);
            const overGoal = val > goal;
            return (
              <View key={day.day} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  {val > 0 && (
                    <View style={[
                      styles.barFill,
                      { height: `${pct}%`, backgroundColor: overGoal ? COLORS.error : COLORS.primary },
                    ]} />
                  )}
                </View>
                <Text style={styles.barDay}>{day.day}</Text>
                {val > 0 && (
                  <Text style={styles.barVal}>
                    {macroView === 'calories' ? `${Math.round(val / 100) / 10}k` : `${val}g`}
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
        </View>
      </View>

      {/* ── Today's macros ───────────────────────────────────────── */}
      <SectionHeader title="Today's Macros" />
      <View style={styles.macroCard}>
        <MacroBar label="Calories" current={user.currentCalories} goal={user.calorieGoal} color={COLORS.primary} />
        <MacroBar label="Protein" current={user.currentProtein} goal={user.proteinGoal} color={COLORS.success} />
        <MacroBar label="Carbs" current={user.currentCarbs} goal={user.carbGoal} color={COLORS.warning} />
        <MacroBar label="Fat" current={user.currentFat} goal={user.fatGoal} color={COLORS.yellow} />
      </View>

      {/* ── Swipe tracker ────────────────────────────────────────── */}
      <SectionHeader title="Meal Swipes" />
      <View style={styles.swipeCard}>
        <View style={styles.swipeHeader}>
          <Text style={styles.swipeTitle}>Swipe Balance</Text>
          <Text style={styles.swipePlan}>{user.mealPlan}</Text>
        </View>
        <View style={styles.swipeNumRow}>
          <Text style={styles.swipeNum}>{user.swipesRemaining}</Text>
          <Text style={styles.swipeOf}> / {user.totalSwipes} remaining</Text>
        </View>
        <View style={styles.swipeBar}>
          <View style={[styles.swipeFill, {
            width: `${(user.swipesRemaining / user.totalSwipes) * 100}%`,
            backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success,
          }]} />
        </View>
        {user.swipesRemaining <= 4 && (
          <View style={styles.swipeAlert}>
            <Text style={styles.swipeAlertText}>⚠️ Running low — budget carefully through the weekend.</Text>
          </View>
        )}
      </View>

      {/* ── AI Insights ──────────────────────────────────────────── */}
      <SectionHeader title="Insights" />
      <View style={styles.insightList}>
        {INSIGHTS.map((insight, i) => (
          <View key={i} style={[
            styles.insightCard,
            i < INSIGHTS.length - 1 && styles.insightCardBorder,
            { borderLeftColor: insight.color },
          ]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc}>{insight.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Recommended For You ──────────────────────────────────── */}
      <SectionHeader title="Recommended For You" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
        {RECOMMENDATIONS.map((rec, i) => (
          <View key={i} style={styles.recCard}>
            <Text style={styles.recName}>{rec.title}</Text>
            <Text style={styles.recHall}>{rec.hall}</Text>
            <View style={styles.recMacros}>
              <Text style={styles.recMacroItem}>{rec.cal} kcal</Text>
              <Text style={styles.recMacroItem}>{rec.protein}g protein</Text>
            </View>
            <View style={styles.recTag}>
              <Text style={styles.recTagText}>{rec.tag}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

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
  title: { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary, letterSpacing: -1 },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  // Stats row
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statDivider: { width: 0.5, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  statNum: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: -0.5 },
  statLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  // Chart
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.surface },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 36, gap: 4 },
  barWrap: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '85%',
    height: BAR_MAX_H,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: RADIUS.sm },
  barDay: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textSecondary, marginTop: 4 },
  barVal: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.textSecondary },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.md },
  legendDot: { width: 8, height: 8, borderRadius: RADIUS.full },
  legendText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginRight: SPACING.md },

  // Macros
  macroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
  },

  // Swipe tracker
  swipeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.subtle,
  },
  swipeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  swipeTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePlan: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  swipeNumRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  swipeNum: { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary, letterSpacing: -1 },
  swipeOf: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  swipeBar: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  swipeFill: { height: '100%', borderRadius: RADIUS.full },
  swipeAlert: { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.sm, padding: SPACING.md },
  swipeAlertText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.warning },

  // Insights — grouped card list
  insightList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  insightCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderLeftWidth: 3,
  },
  insightCardBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  insightTitle: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 2 },
  insightDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, lineHeight: 18 },

  // Recommendations
  recScroll: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.sm },
  recCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  recName: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 2, letterSpacing: -0.3 },
  recHall: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  recMacros: { gap: 2, marginBottom: SPACING.sm },
  recMacroItem: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textPrimary },
  recTag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  recTagText: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.primary },
});
