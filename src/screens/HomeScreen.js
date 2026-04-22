import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
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

  const nextClass = todayClasses.find((c) => timeToMinutes(c.startTime) > currentMin);
  if (nextClass) {
    const minsUntil = timeToMinutes(nextClass.startTime) - currentMin;
    if (minsUntil <= 90) {
      const hallTip = bestHall ? ` — ${bestHall.name} has ${bestHall.status === 'green' ? 'low wait' : 'moderate wait'} now` : '';
      alerts.push({ id: 'next-class', text: `${nextClass.name} starts in ${minsUntil} min${hallTip}.`, type: minsUntil <= 30 ? 'warning' : 'info' });
    }
  }

  const prevClass = [...todayClasses].reverse().find((c) => timeToMinutes(c.endTime) <= currentMin);
  if (prevClass && nextClass) {
    const gap = timeToMinutes(nextClass.startTime) - currentMin;
    if (gap >= 45 && gap <= 180 && bestHall) {
      alerts.push({ id: 'free-gap', text: `Free window before ${nextClass.name} at ${fmt12(nextClass.startTime)} — ${bestHall.name} has ${bestHall.status === 'green' ? 'low wait' : 'moderate wait'}. Good time to eat!`, type: 'info' });
    }
  }

  if (now.getHours() >= 12 && user.currentCalories === 0) {
    alerts.push({ id: 'no-meals', text: "You haven't logged a meal yet today. Head to Dining to get started!", type: 'warning' });
  }

  if (user.swipesRemaining > 0 && user.swipesRemaining <= 4) {
    alerts.push({ id: 'swipes', text: `Swipe balance running low: ${user.swipesRemaining} swipe${user.swipesRemaining !== 1 ? 's' : ''} remaining this week.`, type: 'warning' });
  }

  if (classes.length === 0) {
    alerts.push({ id: 'add-schedule', text: 'Add your class schedule to get personalized meal timing alerts.', type: 'info' });
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

  const alerts      = useMemo(() => buildAlerts(classes, diningHalls, user), [classes, diningHalls, user]);
  const nearbyHalls = sortedHalls.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTop}>
          <Text style={styles.mastheadDate}>{todayLabel()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{((user.name || 'G')[0] || 'G').toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mastheadRule} />
        <View style={styles.mastheadNameRow}>
          <Image
            source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')}
            style={styles.mastheadLogo}
            resizeMode="contain"
          />
          <Text style={styles.mastheadTitle}>Graze</Text>
        </View>
        <Text style={styles.mastheadDeck}>
          {getGreeting()}, {(user.name || 'there').split(' ')[0]}. {user.streak > 0 ? `${user.streak}-day streak.` : 'Start your streak today.'}
        </Text>
        <View style={styles.mastheadRuleBottom} />
      </View>

      {/* ── Alerts ───────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          {alerts.map((a) => (
            <View key={a.id} style={[styles.alert, a.type === 'warning' && styles.alertWarning]}>
              <View style={[styles.alertAccent, { backgroundColor: a.type === 'warning' ? COLORS.amber : COLORS.primaryDeep }]} />
              <Text style={styles.alertText}>{a.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Calories ─────────────────────────────────────────────── */}
      <SectionHeader title="Today's Intake" />
      <View style={styles.calorieBlock}>
        <View style={styles.calorieNumbers}>
          <View>
            <Text style={styles.calNum}>{user.currentCalories || 0}</Text>
            <Text style={styles.calLabel}>CALORIES EATEN</Text>
          </View>
          <View style={styles.calDivider} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.calNum}>{remaining}</Text>
            <Text style={styles.calLabel}>REMAINING</Text>
          </View>
        </View>
        <View style={styles.calBarTrack}>
          <View style={[styles.calBarFill, { width: `${calPct}%`, backgroundColor: calPct > 100 ? COLORS.error : COLORS.primaryDeep }]} />
        </View>
        <Text style={styles.calGoal}>Goal: {user.calorieGoal || 2000} kcal</Text>
      </View>

      {/* ── Macros ───────────────────────────────────────────────── */}
      <SectionHeader title="Macronutrients" />
      <View style={styles.macroBlock}>
        <MacroBar label="Protein" current={user.currentProtein || 0} goal={user.proteinGoal || 150} color={COLORS.primaryDeep} />
        <MacroBar label="Carbs"   current={user.currentCarbs   || 0} goal={user.carbGoal    || 250} color={COLORS.inkMid} />
        <MacroBar label="Fat"     current={user.currentFat     || 0} goal={user.fatGoal     || 65}  color={COLORS.amber} />
      </View>

      {/* ── Swipe balance ────────────────────────────────────────── */}
      {user.totalSwipes > 0 && (
        <>
          <SectionHeader title="Swipe Balance" />
          <View style={styles.swipeBlock}>
            <View style={styles.swipeRow}>
              <Text style={styles.swipePlanLabel}>{user.mealPlan}</Text>
              <Text style={[styles.swipeNum, user.swipesRemaining <= 3 && { color: COLORS.error }]}>
                {user.swipesRemaining}
                <Text style={styles.swipeOf}> / {user.totalSwipes}</Text>
              </Text>
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
          </View>
        </>
      )}

      {/* ── Nearby halls ─────────────────────────────────────────── */}
      <SectionHeader title="Nearby Dining" action="See All" onAction={() => navigation.navigate('DiningTab')} />
      <View style={styles.hallList}>
        {nearbyHalls.map((hall, i) => {
          const open          = isHallOpen(hall.hours);
          const displayStatus = open === false ? null : hall.status;
          return (
            <TouchableOpacity
              key={hall.id}
              style={[styles.hallRow, i < nearbyHalls.length - 1 && styles.hallRowBorder]}
              onPress={() => navigation.navigate('DiningTab', { screen: 'DiningDetail', params: { hallId: hall.id } })}
              activeOpacity={0.75}
            >
              <View style={styles.hallLeft}>
                <View style={styles.hallNameRow}>
                  <CrowdingDot status={displayStatus} />
                  <Text style={styles.hallName}>{hall.name}</Text>
                </View>
                <Text style={styles.hallMeta}>{hall.location} · {open ? hall.waitTime : 'Closed'}</Text>
              </View>
              <View style={styles.hallRight}>
                <Text style={styles.hallCapacity}>{hall.capacity}%</Text>
                <Text style={styles.hallCapacityLabel}>capacity</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Logged meals ─────────────────────────────────────────── */}
      {loggedMeals.length > 0 && (
        <>
          <SectionHeader title="Logged Today" />
          <View style={styles.mealList}>
            {loggedMeals.map((meal) => (
              <View key={meal.logId} style={styles.mealRow}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealMeta}>{meal.hallName} · P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</Text>
                </View>
                <View style={styles.mealRight}>
                  <Text style={styles.mealCal}>{meal.calories}</Text>
                  <Text style={styles.mealCalLabel}>kcal</Text>
                </View>
                <TouchableOpacity onPress={() => removeMealItem(meal.logId)} style={styles.mealRemove}>
                  <Text style={styles.mealRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content:   {},

  // ── Masthead ──
  masthead: {
    backgroundColor: COLORS.cream,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  mastheadTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  mastheadDate:    { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadRule:    { height: 1, backgroundColor: COLORS.rule, marginBottom: SPACING.sm },
  mastheadNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  mastheadLogo:    { width: 40, height: 40 },
  mastheadTitle:   { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.display, color: COLORS.primaryDeep, letterSpacing: -1.5 },
  mastheadDeck:    { fontFamily: 'SourceSerif4_300Light', fontSize: SIZES.md, color: COLORS.inkMid, fontStyle: 'italic', lineHeight: 22, marginBottom: SPACING.md },
  mastheadRuleBottom: { height: 2, backgroundColor: COLORS.amber },
  avatarWrap:      { width: 32, height: 32, borderWidth: 1.5, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { ...FONTS.bold, fontSize: SIZES.sm, color: COLORS.primaryDeep },

  // ── Alerts ──
  alertsSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.sm },
  alert:         { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, backgroundColor: COLORS.creamDark, padding: SPACING.md },
  alertWarning:  { backgroundColor: COLORS.amberWash },
  alertAccent:   { width: 3, alignSelf: 'stretch', minHeight: 18 },
  alertText:     { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkMid, flex: 1, lineHeight: 19 },

  // ── Calories ──
  calorieBlock:   { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 3, borderTopColor: COLORS.ink },
  calorieNumbers: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.md },
  calNum:         { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl, color: COLORS.ink, letterSpacing: -1 },
  calLabel:       { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8, marginTop: 2 },
  calDivider:     { width: 1, height: 40, backgroundColor: COLORS.rule },
  calBarTrack:    { height: 4, backgroundColor: COLORS.creamDark, marginBottom: SPACING.sm },
  calBarFill:     { height: '100%' },
  calGoal:        { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.6 },

  // ── Macros ──
  macroBlock: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.rule },

  // ── Swipe ──
  swipeBlock:       { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.rule },
  swipeRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACING.sm },
  swipePlanLabel:   { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.6 },
  swipeNum:         { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.xl, color: COLORS.ink },
  swipeOf:          { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight },
  swipeBarTrack:    { height: 3, backgroundColor: COLORS.creamDark, marginBottom: SPACING.sm },
  swipeFill:        { height: '100%' },
  swipeAlert:       { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.amberDark, fontStyle: 'italic' },

  // ── Hall list ──
  hallList:      { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 3, borderTopColor: COLORS.ink },
  hallRow:       { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hallRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  hallLeft:      { flex: 1 },
  hallNameRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 3 },
  hallName:      { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, letterSpacing: -0.3 },
  hallMeta:      { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },
  hallRight:     { alignItems: 'flex-end' },
  hallCapacity:  { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.lg, color: COLORS.primaryDeep },
  hallCapacityLabel: { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.6 },

  // ── Meals ──
  mealList:       { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.rule },
  mealRow:        { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.rule, gap: SPACING.md },
  mealInfo:       { flex: 1 },
  mealName:       { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.sm, color: COLORS.ink, letterSpacing: -0.2 },
  mealMeta:       { ...FONTS.regular, fontSize: 10, color: COLORS.inkLight, marginTop: 2 },
  mealRight:      { alignItems: 'flex-end' },
  mealCal:        { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.primaryDeep },
  mealCalLabel:   { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight },
  mealRemove:     { padding: SPACING.xs },
  mealRemoveText: { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.inkFaint },
});
