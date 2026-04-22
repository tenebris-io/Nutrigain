import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Image,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { Button, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'high-protein'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useApp();

  const [calorieGoal,  setCalorieGoal]  = useState(String(user.calorieGoal  || 2000));
  const [proteinGoal,  setProteinGoal]  = useState(String(user.proteinGoal  || 150));
  const [carbGoal,     setCarbGoal]     = useState(String(user.carbGoal     || 250));
  const [fatGoal,      setFatGoal]      = useState(String(user.fatGoal      || 65));
  const [totalSwipes,  setTotalSwipes]  = useState(String(user.totalSwipes  || 0));
  const [swipesLeft,   setSwipesLeft]   = useState(String(user.swipesRemaining || 0));
  const [notifMeals,   setNotifMeals]   = useState(user.notifMeals   !== false);
  const [notifSwipes,  setNotifSwipes]  = useState(user.notifSwipes  !== false);

  const toggleDiet = (d) => {
    setUser((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(d)
        ? prev.dietaryRestrictions.filter((x) => x !== d)
        : [...prev.dietaryRestrictions, d],
    }));
  };

  const saveGoals = () => {
    setUser((prev) => ({
      ...prev,
      calorieGoal:     parseInt(calorieGoal)  || 2000,
      proteinGoal:     parseInt(proteinGoal)  || 150,
      carbGoal:        parseInt(carbGoal)     || 250,
      fatGoal:         parseInt(fatGoal)      || 65,
      totalSwipes:     parseInt(totalSwipes)  || 0,
      swipesRemaining: parseInt(swipesLeft)   || 0,
      notifMeals,
      notifSwipes,
    }));
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.mastheadRule} />
        <Text style={styles.mastheadTitle}>Profile</Text>
        <View style={styles.mastheadRuleBottom} />
      </View>

      {/* ── Byline card ──────────────────────────────────────────── */}
      <View style={styles.bylineCard}>
        <Image source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')} style={styles.bylineLogo} resizeMode="contain" />
        <View style={styles.bylineInfo}>
          <Text style={styles.bylineName}>{user.name || 'Student'}</Text>
          <Text style={styles.bylineMeta}>{user.major || 'Undeclared'} · {user.year || 'Freshman'}</Text>
          <Text style={styles.bylineMeta}>{user.mealPlan || 'No meal plan'} · {user.streak || 0}-day streak 🔥</Text>
        </View>
      </View>

      {/* ── Dietary ──────────────────────────────────────────────── */}
      <SectionHeader title="Dietary Restrictions" />
      <View style={styles.section}>
        <View style={styles.dietGrid}>
          {DIETARY_OPTIONS.map((d) => {
            const active = user.dietaryRestrictions?.includes(d);
            return (
              <TouchableOpacity key={d} onPress={() => toggleDiet(d)} style={[styles.dietChip, active && styles.dietChipActive]}>
                <Text style={[styles.dietChipText, active && styles.dietChipTextActive]}>{d.toUpperCase()}</Text>
                {active && <Text style={styles.dietCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Nutrition goals ──────────────────────────────────────── */}
      <SectionHeader title="Nutrition Goals" />
      <View style={styles.section}>
        {[
          ['DAILY CALORIES', calorieGoal, setCalorieGoal],
          ['PROTEIN (g)',    proteinGoal, setProteinGoal],
          ['CARBS (g)',      carbGoal,    setCarbGoal],
          ['FAT (g)',        fatGoal,     setFatGoal],
        ].map(([label, val, setter]) => (
          <View key={label} style={styles.inputRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={val} onChangeText={setter} />
          </View>
        ))}
      </View>

      {/* ── Meal swipes ──────────────────────────────────────────── */}
      <SectionHeader title="Meal Swipes" />
      <View style={styles.section}>
        {[
          ['WEEKLY TOTAL', totalSwipes, setTotalSwipes],
          ['REMAINING',    swipesLeft,  setSwipesLeft],
        ].map(([label, val, setter]) => (
          <View key={label} style={styles.inputRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={val} onChangeText={setter} />
          </View>
        ))}
      </View>

      {/* ── Notifications ────────────────────────────────────────── */}
      <SectionHeader title="Notifications" />
      <View style={styles.section}>
        {[
          ['Meal timing alerts', notifMeals, setNotifMeals],
          ['Low swipe warnings', notifSwipes, setNotifSwipes],
        ].map(([label, val, setter]) => (
          <View key={label} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Switch
              value={val}
              onValueChange={setter}
              trackColor={{ false: COLORS.creamDark, true: COLORS.primaryDeep }}
              thumbColor={COLORS.cream}
            />
          </View>
        ))}
      </View>

      {/* ── Schedule ─────────────────────────────────────────────── */}
      <SectionHeader title="Class Schedule" />
      <View style={styles.section}>
        <TouchableOpacity style={styles.scheduleLink} onPress={() => navigation.navigate('Schedule')}>
          <Text style={styles.scheduleLinkText}>Manage Schedule →</Text>
        </TouchableOpacity>
      </View>

      {/* ── About ────────────────────────────────────────────────── */}
      <SectionHeader title="About" />
      <View style={styles.section}>
        <Text style={styles.aboutText}>
          Graze — Campus dining, naturally. AI-powered nutrition tracking for Ohio State students.
        </Text>
        <Text style={styles.aboutMeta}>Powered by Claude · Nutrislice data</Text>
      </View>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <Button label="Save Changes" onPress={saveGoals} />
        <TouchableOpacity onPress={confirmLogout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>
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
  backBtn:            { marginBottom: SPACING.md },
  backText:           { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.primaryDeep, letterSpacing: 0.4, textDecorationLine: 'underline' },
  mastheadRule:       { height: 1, backgroundColor: COLORS.rule, marginBottom: SPACING.sm },
  mastheadTitle:      { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl + 8, color: COLORS.primaryDeep, letterSpacing: -1 },
  mastheadRuleBottom: { height: 2, backgroundColor: COLORS.amber, marginTop: SPACING.md },

  bylineCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 3, borderTopColor: COLORS.ink,
    borderBottomWidth: 1, borderBottomColor: COLORS.rule,
  },
  bylineLogo:     { width: 48, height: 48 },
  bylineInfo:     { flex: 1 },
  bylineName:     { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.lg, color: COLORS.ink, letterSpacing: -0.3 },
  bylineMeta:     { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight, marginTop: 3 },

  section: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.rule,
    borderBottomWidth: 1, borderBottomColor: COLORS.rule,
    paddingHorizontal: SPACING.lg,
  },

  dietGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingVertical: SPACING.lg },
  dietChip:           { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.rule, flexDirection: 'row', gap: SPACING.xs },
  dietChipActive:     { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  dietChipText:       { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.6 },
  dietChipTextActive: { color: COLORS.cream },
  dietCheck:          { ...FONTS.medium, fontSize: 10, color: COLORS.cream },

  inputRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  inputLabel:  { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.8 },
  input: {
    width: 100, textAlign: 'right',
    borderBottomWidth: 1.5, borderBottomColor: COLORS.ink,
    paddingVertical: SPACING.xs,
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink,
  },

  toggleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  toggleLabel: { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkMid },

  scheduleLink:     { paddingVertical: SPACING.md },
  scheduleLinkText: { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.primaryDeep, letterSpacing: 0.4, textDecorationLine: 'underline' },

  aboutText: { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkMid, lineHeight: 22, paddingVertical: SPACING.lg, fontStyle: 'italic' },
  aboutMeta: { ...FONTS.medium, fontSize: 10, color: COLORS.inkFaint, letterSpacing: 0.6, paddingBottom: SPACING.lg },

  actions:     { marginHorizontal: SPACING.lg, marginTop: SPACING.xl, gap: SPACING.md },
  signOutBtn:  { alignItems: 'center', paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.rule },
  signOutText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 1.2 },
});
