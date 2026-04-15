import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, SectionHeader, MacroBar } from '../components/ui';
import { WEEKLY_NUTRITION } from '../data/mockData';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 100;

const INSIGHTS = [
  { icon: '💪', title: 'Protein on track', desc: 'You hit your protein goal 4 out of 6 days this week.', color: COLORS.primary },
  { icon: '🥗', title: 'Veggie win', desc: 'Your vegan choices this week totaled 3 complete meals.', color: COLORS.success },
  { icon: '⚡', title: 'Calorie deficit', desc: 'Wednesday was low — try a full breakfast at Baker next time.', color: COLORS.yellow },
];

const RECOMMENDATIONS = [
  { icon: '🐟', title: 'Salmon with Quinoa', hall: 'Scott House', cal: 520, protein: 42, tag: 'High protein · GF' },
  { icon: '🥗', title: 'Vegan Lentil Soup', hall: 'Baker Hall', cal: 210, protein: 12, tag: 'Vegan · GF' },
  { icon: '🥞', title: 'GF Protein Pancakes', hall: 'Traditions', cal: 310, protein: 24, tag: 'GF · High protein' },
];

export default function DashboardScreen() {
  const { user, loggedMeals } = useApp();
  const [macroView, setMacroView] = useState('calories');

  const weekTotal = WEEKLY_NUTRITION.reduce((s, d) => s + d.calories, 0);
  const weekAvg = Math.round(weekTotal / 6);
  const daysLogged = WEEKLY_NUTRITION.filter((d) => d.calories > 0).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Dashboard</Text>
      <Text style={styles.subtitle}>Weekly nutrition overview</Text>

      {/* Streak card */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakNum}>{user.streak}</Text>
          <Text style={styles.streakLabel}>day streak 🔥</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakMid}>
          <Text style={styles.streakNum}>{daysLogged}</Text>
          <Text style={styles.streakLabel}>days logged</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakRight}>
          <Text style={styles.streakNum}>{weekAvg}</Text>
          <Text style={styles.streakLabel}>avg kcal/day</Text>
        </View>
      </View>

      {/* Weekly bar chart */}
      <Card style={styles.chartCard}>
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
                {val > 0 && <Text style={styles.barVal}>{macroView === 'calories' ? `${Math.round(val / 100) / 10}k` : `${val}g`}</Text>}
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={[styles.legendDotView, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Within goal</Text>
          <View style={[styles.legendDotView, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Over goal</Text>
        </View>
      </Card>

      {/* Today's macros */}
      <Card style={styles.macroCard}>
        <Text style={styles.macroTitle}>Today's Macros</Text>
        <MacroBar label="Calories" current={user.currentCalories} goal={user.calorieGoal} color={COLORS.primary} />
        <MacroBar label="Protein" current={user.currentProtein} goal={user.proteinGoal} color={COLORS.secondary} />
        <MacroBar label="Carbs" current={user.currentCarbs} goal={user.carbGoal} color={COLORS.yellow} />
        <MacroBar label="Fat" current={user.currentFat} goal={user.fatGoal} color={COLORS.success} />
      </Card>

      {/* Swipe tracker */}
      <Card style={styles.swipeCard}>
        <View style={styles.swipeHeader}>
          <Text style={styles.swipeTitle}>🍽️ Meal Swipes</Text>
          <Text style={styles.swipePlan}>{user.mealPlan}</Text>
        </View>
        <View style={styles.swipeRow}>
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
      </Card>

      {/* AI Insights */}
      <SectionHeader title="AI Insights" />
      {INSIGHTS.map((insight, i) => (
        <View key={i} style={[styles.insightCard, { borderLeftColor: insight.color }]}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDesc}>{insight.desc}</Text>
          </View>
        </View>
      ))}

      {/* Recommendations */}
      <SectionHeader title="Recommended For You" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
        {RECOMMENDATIONS.map((rec, i) => (
          <View key={i} style={styles.recCard}>
            <Text style={styles.recIcon}>{rec.icon}</Text>
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
  content: { padding: SPACING.xl, paddingTop: SPACING.xl },
  title: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  streakCard: {
    flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    padding: SPACING.xl, marginBottom: SPACING.xl, ...SHADOWS.medium,
  },
  streakLeft: { flex: 1, alignItems: 'center' },
  streakMid: { flex: 1, alignItems: 'center' },
  streakRight: { flex: 1, alignItems: 'center' },
  streakDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  streakNum: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.surface, letterSpacing: -1 },
  streakLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: 'rgba(255,255,255,0.8)' },
  chartCard: { marginBottom: SPACING.xl },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  chartTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  chartToggle: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.full, padding: 2 },
  toggleBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.surface },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 40, gap: 4 },
  barWrap: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '90%', height: BAR_MAX_H, backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm, overflow: 'hidden', justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: RADIUS.sm },
  barDay: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 4 },
  barVal: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textSecondary },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  legendDotView: { width: 8, height: 8, borderRadius: RADIUS.full },
  legendText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginRight: SPACING.md },
  macroCard: { marginBottom: SPACING.xl },
  macroTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  swipeCard: { marginBottom: SPACING.xl },
  swipeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  swipeTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePlan: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  swipeRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  swipeNum: { fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary, letterSpacing: -1 },
  swipeOf: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  swipeBar: { height: 10, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  swipeFill: { height: '100%', borderRadius: RADIUS.full },
  swipeAlert: { backgroundColor: COLORS.warningLight, borderRadius: RADIUS.sm, padding: SPACING.md },
  swipeAlertText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.warning },
  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderLeftWidth: 3, ...SHADOWS.subtle,
  },
  insightIcon: { fontSize: 22, marginTop: 2 },
  insightTitle: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 2 },
  insightDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, lineHeight: 18 },
  recScroll: { paddingRight: SPACING.xl, gap: SPACING.md, paddingBottom: SPACING.md },
  recCard: {
    width: 160, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.lg, ...SHADOWS.subtle,
  },
  recIcon: { fontSize: 32, marginBottom: SPACING.sm },
  recName: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 2, letterSpacing: -0.3 },
  recHall: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  recMacros: { gap: 2, marginBottom: SPACING.sm },
  recMacroItem: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textPrimary },
  recTag: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  recTagText: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.primary },
});
