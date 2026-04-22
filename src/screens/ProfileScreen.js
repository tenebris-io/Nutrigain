import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, Button, Badge, Divider } from '../components/ui';
import { useApp } from '../context/AppContext';

const DIETARY_OPTIONS = ['vegan', 'gluten-free', 'vegetarian', 'dairy-free', 'nut-free', 'high-protein'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser, classes } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:             user.name,
    major:            user.major,
    year:             user.year,
    calorieGoal:      String(user.calorieGoal ?? 2000),
    proteinGoal:      String(user.proteinGoal ?? 90),
    carbGoal:         String(user.carbGoal    ?? 250),
    fatGoal:          String(user.fatGoal     ?? 70),
    swipesRemaining:  String(user.swipesRemaining ?? 0),
  });
  const [restrictions, setRestrictions] = useState([...user.dietaryRestrictions]);
  const [notifications, setNotifications] = useState(true);
  const [smartAlerts, setSmartAlerts] = useState(true);

  const toggleRestriction = (r) =>
    setRestrictions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const save = () => {
    setUser((prev) => ({
      ...prev,
      name:             form.name,
      major:            form.major,
      year:             form.year,
      calorieGoal:      parseInt(form.calorieGoal)     || prev.calorieGoal,
      proteinGoal:      parseInt(form.proteinGoal)     || prev.proteinGoal,
      carbGoal:         parseInt(form.carbGoal)        || prev.carbGoal,
      fatGoal:          parseInt(form.fatGoal)         || prev.fatGoal,
      swipesRemaining:  Math.max(0, parseInt(form.swipesRemaining) || 0),
      dietaryRestrictions: restrictions,
    }));
    setEditing(false);
  };

  const calPct = Math.round((user.currentCalories / user.calorieGoal) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || 'G')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{user.name || 'Your Name'}</Text>
        <Text style={styles.heroSub}>{user.year} · {user.major}</Text>
        {user.dietaryRestrictions.length > 0 && (
          <View style={styles.heroBadges}>
            {user.dietaryRestrictions.slice(0, 3).map((r) => (
              <Badge key={r} label={r} color="primary" />
            ))}
          </View>
        )}
      </View>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{user.streak}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{user.swipesRemaining}</Text>
          <Text style={styles.statLabel}>Swipes Left</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{calPct}%</Text>
          <Text style={styles.statLabel}>Goal Today</Text>
        </View>
      </View>

      {/* ── Meal plan ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MEAL PLAN</Text>
        <View style={styles.card}>
          <View style={styles.mealPlanRow}>
            <Text style={styles.mealPlanTitle}>{user.mealPlan}</Text>
            <View style={[styles.swipePill, {
              backgroundColor: user.swipesRemaining <= 3 ? COLORS.redLight : COLORS.primaryLight,
            }]}>
              <Text style={[styles.swipePillText, {
                color: user.swipesRemaining <= 3 ? COLORS.error : COLORS.primary,
              }]}>
                {user.swipesRemaining} swipes
              </Text>
            </View>
          </View>
          <View style={styles.swipeBarTrack}>
            <View style={[styles.swipeFill, {
              width: `${(user.swipesRemaining / user.totalSwipes) * 100}%`,
              backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.primary,
            }]} />
          </View>
          <Text style={styles.swipeSub}>{user.swipesRemaining} of {user.totalSwipes} remaining this week</Text>
        </View>
      </View>

      {/* ── Profile details ───────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>PROFILE</Text>
          <TouchableOpacity onPress={() => editing ? save() : setEditing(true)}>
            <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {editing ? (
            <>
              {[
                { label: 'Name',                   key: 'name',            keyboard: 'default' },
                { label: 'Major',                  key: 'major',           keyboard: 'default' },
                { label: 'Year',                   key: 'year',            keyboard: 'default' },
                { label: 'Daily Calorie Goal',     key: 'calorieGoal',     keyboard: 'numeric' },
                { label: 'Daily Protein Goal (g)', key: 'proteinGoal',     keyboard: 'numeric' },
                { label: 'Daily Carb Goal (g)',    key: 'carbGoal',        keyboard: 'numeric' },
                { label: 'Daily Fat Goal (g)',     key: 'fatGoal',         keyboard: 'numeric' },
                { label: 'Swipes Remaining',       key: 'swipesRemaining', keyboard: 'numeric' },
              ].map(({ label, key, keyboard }, i, arr) => (
                <React.Fragment key={key}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>{label}</Text>
                    <TextInput
                      style={styles.formInput}
                      value={form[key]}
                      keyboardType={keyboard}
                      onChangeText={(v) => setForm({ ...form, [key]: v })}
                    />
                  </View>
                  {i < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              {[
                ['Name',           user.name  || '—'],
                ['Major',          user.major || '—'],
                ['Year',           user.year  || '—'],
                ['Calorie Goal',   `${user.calorieGoal} kcal/day`],
                ['Protein Goal',   `${user.proteinGoal}g/day`],
                ['Carb Goal',      `${user.carbGoal}g/day`],
                ['Fat Goal',       `${user.fatGoal}g/day`],
                ['Swipes Left',    `${user.swipesRemaining} / ${user.totalSwipes}`],
              ].map(([label, value], i, arr) => (
                <React.Fragment key={label}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                  {i < arr.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </>
          )}
        </View>
      </View>

      {/* ── Dietary restrictions ─────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DIETARY RESTRICTIONS</Text>
        <Text style={styles.sectionSub}>Auto-filters your menus across all dining halls.</Text>
        <View style={styles.dietGrid}>
          {DIETARY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => toggleRestriction(opt)}
              style={[styles.dietChip, restrictions.includes(opt) && styles.dietChipActive]}
            >
              <Text style={[styles.dietChipText, restrictions.includes(opt) && styles.dietChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          label="Save restrictions"
          onPress={() => setUser((p) => ({ ...p, dietaryRestrictions: restrictions }))}
          style={{ marginTop: SPACING.lg }}
        />
      </View>

      {/* ── Class Schedule ───────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CLASS SCHEDULE</Text>
        <TouchableOpacity
          style={[styles.card, styles.scheduleRow]}
          onPress={() => navigation.navigate('Schedule')}
          activeOpacity={0.8}
        >
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTitle}>Manage Schedule</Text>
            <Text style={styles.scheduleSub}>
              {classes.length === 0
                ? 'No classes added — tap to set up'
                : `${classes.length} class${classes.length !== 1 ? 'es' : ''} scheduled`}
            </Text>
          </View>
          <Text style={styles.scheduleChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Notifications ────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Smart Alerts</Text>
              <Text style={styles.settingDesc}>Notify when a nearby hall has low wait</Text>
            </View>
            <Switch
              value={smartAlerts}
              onValueChange={setSmartAlerts}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={COLORS.baseLight}
            />
          </View>
          <Divider />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Swipe Balance Alerts</Text>
              <Text style={styles.settingDesc}>Alert when swipes are running low</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.inputBg, true: COLORS.primary }}
              thumbColor={COLORS.baseLight}
            />
          </View>
        </View>
      </View>

      {/* ── About ────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={[styles.card, styles.aboutCard]}>
          <Text style={styles.aboutLogo}>Graze</Text>
          <Text style={styles.aboutTagline}>Your Campus Dining Companion</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0 · OSU Pilot</Text>
          <Text style={styles.aboutTeam}>Made with ❤️ by Rishi, Varsha, Landry, Sujay</Text>
          <Text style={styles.aboutSchool}>The Ohio State University · Spring 2026</Text>
        </View>
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.base },
  content: { paddingBottom: SPACING.xxxl },

  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryDeep,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(245,166,35,0.25)',
    borderWidth: 2.5,
    borderColor: 'rgba(245,166,35,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { ...FONTS.bold, fontSize: SIZES.xxl, color: COLORS.amberLight },
  heroName: { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.baseLight, letterSpacing: -0.3 },
  heroSub: { ...FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2, marginBottom: SPACING.sm },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.base,
    marginHorizontal: SPACING.lg,
    marginTop: -1,
    borderRadius: RADIUS.lg,
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statDivider: { width: 1, backgroundColor: 'rgba(163,170,155,0.30)', marginVertical: SPACING.sm },
  statNum: { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.amber, letterSpacing: -0.5 },
  statLabel: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  section: { padding: SPACING.lg, paddingBottom: 0 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  sectionSub: {
    ...FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: -4,
  },
  editBtn: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },

  card: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },

  mealPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  mealPlanTitle: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePill: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  swipePillText: { ...FONTS.bold, fontSize: SIZES.xs },
  swipeBarTrack: {
    height: 7, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.xs,
    borderTopWidth: 0.5, borderLeftWidth: 0.5,
    borderTopColor: 'rgba(163,170,155,0.50)', borderLeftColor: 'rgba(163,170,155,0.50)',
  },
  swipeFill: { height: '100%', borderRadius: RADIUS.full },
  swipeSub: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  formGroup: { marginBottom: SPACING.xs },
  formLabel: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 4 },
  formInput: {
    height: 44,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)', borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1, borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)', borderRightColor: 'rgba(255,255,255,0.65)',
    ...FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  infoLabel: { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  infoValue: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },

  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dietChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, ...SHADOWS.raised_sm,
    backgroundColor: COLORS.base,
  },
  dietChipActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#1e4d2b',
    shadowOpacity: 0.40,
    borderTopColor: 'rgba(120,200,140,0.35)',
    borderLeftColor: 'rgba(120,200,140,0.35)',
  },
  dietChipText: { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  dietChipTextActive: { color: COLORS.baseLight },

  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  settingInfo: { flex: 1 },
  settingLabel: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  settingDesc: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  scheduleRow:    { flexDirection: 'row', alignItems: 'center' },
  scheduleInfo:   { flex: 1 },
  scheduleTitle:  { ...FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  scheduleSub:    { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  scheduleChevron: { fontSize: 22, color: COLORS.chevron },

  aboutCard: { alignItems: 'center', gap: 4 },
  aboutLogo: { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary },
  aboutTagline: { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  aboutVersion: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  aboutTeam: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  aboutSchool: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
});
