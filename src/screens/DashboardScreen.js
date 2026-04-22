import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { SectionHeader, MacroBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { lastNDays, todayISO, todayLabel } from '../utils/diningUtils';

const BAR_MAX_H = 90;

export default function DashboardScreen() {
  const { user, weeklyData } = useApp();
  const [macroView, setMacroView] = useState('calories');

  const chartDays = useMemo(() => {
    const today = todayISO();
    return lastNDays(7).map(({ dateStr, dayAbbr }) => {
      const isToday = dateStr === today;
      const data = isToday
        ? { calories: user.currentCalories || 0, protein: user.currentProtein || 0, carbs: user.currentCarbs || 0, fat: user.currentFat || 0 }
        : (weeklyData[dateStr] || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      return { day: dayAbbr, isToday, goal: user.calorieGoal, proteinGoal: user.proteinGoal, ...data };
    });
  }, [weeklyData, user.currentCalories, user.currentProtein, user.calorieGoal, user.proteinGoal]);

  const daysLogged = chartDays.filter((d) => d.calories > 0).length;
  const weekTotal  = chartDays.reduce((s, d) => s + d.calories, 0);
  const weekAvg    = daysLogged > 0 ? Math.round(weekTotal / daysLogged) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTop}>
          <Text style={styles.mastheadDate}>{todayLabel()}</Text>
          <Text style={styles.mastheadTag}>Weekly Report</Text>
        </View>
        <View style={styles.mastheadRule} />
        <Text style={styles.mastheadTitle}>Progress</Text>
        <Text style={styles.mastheadDeck}>Nutrition overview · Last 7 days</Text>
        <View style={styles.mastheadRuleBottom} />
      </View>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <SectionHeader title="This Week" />
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{user.streak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
        <View style={styles.statRule} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{daysLogged}</Text>
          <Text style={styles.statLabel}>DAYS LOGGED</Text>
        </View>
        <View style={styles.statRule} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{weekAvg > 0 ? weekAvg : '—'}</Text>
          <Text style={styles.statLabel}>AVG KCAL</Text>
        </View>
      </View>

      {/* ── Bar chart ────────────────────────────────────────────── */}
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
                  {v === 'calories' ? 'CAL' : 'PRO'}
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
                    <View style={[styles.barFill, { height: `${pct}%`, backgroundColor: overGoal ? COLORS.error : COLORS.primaryDeep }]} />
                  )}
                </View>
                <Text style={[styles.barDay, day.isToday && styles.barDayToday]}>{day.day}</Text>
                {val > 0 && (
                  <Text style={styles.barVal}>
                    {macroView === 'calories' ? (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`) : `${val}g`}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={[styles.legendSwatch, { backgroundColor: COLORS.primaryDeep }]} />
          <Text style={styles.legendText}>Within goal</Text>
          <View style={[styles.legendSwatch, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Over goal</Text>
        </View>
      </View>

      {/* ── Today's macros ───────────────────────────────────────── */}
      <SectionHeader title="Today's Macros" />
      <View style={styles.macroCard}>
        <MacroBar label="Calories" current={user.currentCalories} goal={user.calorieGoal} color={COLORS.primaryDeep} />
        <MacroBar label="Protein"  current={user.currentProtein}  goal={user.proteinGoal}  color={COLORS.primaryDeep} />
        <MacroBar label="Carbs"    current={user.currentCarbs}    goal={user.carbGoal}     color={COLORS.inkMid} />
        <MacroBar label="Fat"      current={user.currentFat}      goal={user.fatGoal}      color={COLORS.amber} />
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
            <View style={styles.swipeBarTrack}>
              <View style={[styles.swipeFill, {
                width: `${Math.min((user.swipesRemaining / user.totalSwipes) * 100, 100)}%`,
                backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.primaryDeep,
              }]} />
            </View>
            {user.swipesRemaining <= 4 && (
              <Text style={styles.swipeAlert}>Running low — budget carefully through the weekend.</Text>
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
  container: { flex: 1, backgroundColor: COLORS.cream },
  content:   {},

  masthead: {
    backgroundColor: COLORS.cream,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  mastheadTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  mastheadDate:       { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadTag:        { ...FONTS.medium, fontSize: 9, color: COLORS.amberDark, letterSpacing: 0.8 },
  mastheadRule:       { height: 1, backgroundColor: COLORS.rule, marginBottom: SPACING.sm },
  mastheadTitle:      { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl + 8, color: COLORS.primaryDeep, letterSpacing: -1 },
  mastheadDeck:       { fontFamily: 'SourceSerif4_300Light', fontSize: SIZES.sm, color: COLORS.inkMid, fontStyle: 'italic', marginTop: SPACING.xs, marginBottom: SPACING.md },
  mastheadRuleBottom: { height: 2, backgroundColor: COLORS.amber },

  statsRow:  { flexDirection: 'row', marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 3, borderTopColor: COLORS.ink },
  statItem:  { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statRule:  { width: 1, backgroundColor: COLORS.rule, marginVertical: SPACING.sm },
  statNum:   { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxl, color: COLORS.primaryDeep, letterSpacing: -0.5 },
  statLabel: { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8, marginTop: 3 },

  chartCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.rule },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  chartTitle:       { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.8 },
  chartToggle:      { flexDirection: 'row', gap: 2 },
  toggleBtn:        { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.rule },
  toggleBtnActive:  { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  toggleText:       { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.6 },
  toggleTextActive: { color: COLORS.cream },

  bars:    { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 36, gap: 4 },
  barWrap: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '85%', height: BAR_MAX_H,
    backgroundColor: COLORS.creamDark,
    justifyContent: 'flex-end',
    borderTopWidth: 1, borderTopColor: COLORS.rule,
  },
  barTrackToday: { borderTopWidth: 2, borderTopColor: COLORS.amber },
  barFill:       { width: '100%' },
  barDay:        { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, marginTop: 4, letterSpacing: 0.4 },
  barDayToday:   { color: COLORS.amberDark, ...FONTS.medium },
  barVal:        { ...FONTS.regular, fontSize: 9, color: COLORS.inkLight },

  chartLegend:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.md },
  legendSwatch: { width: 10, height: 2 },
  legendText:   { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight, marginRight: SPACING.md },

  macroCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.rule },

  swipeCard:    { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.rule },
  swipeHeader:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  swipeTitle:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink },
  swipePlan:    { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.4 },
  swipeNumRow:  { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  swipeNum:     { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl, color: COLORS.ink, letterSpacing: -1 },
  swipeOf:      { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight },
  swipeBarTrack:{ height: 3, backgroundColor: COLORS.creamDark, marginBottom: SPACING.md },
  swipeFill:    { height: '100%' },
  swipeAlert:   { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.amberDark, fontStyle: 'italic' },
  swipeEmpty:   { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, marginTop: SPACING.xs, fontStyle: 'italic' },
});
