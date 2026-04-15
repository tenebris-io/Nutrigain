import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, Button, Badge, Divider } from '../components/ui';
import { useApp } from '../context/AppContext';

const DIETARY_OPTIONS = ['vegan', 'gluten-free', 'vegetarian', 'dairy-free', 'nut-free', 'high-protein'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    major: user.major,
    year: user.year,
    calorieGoal: user.calorieGoal.toString(),
    proteinGoal: user.proteinGoal.toString(),
  });
  const [restrictions, setRestrictions] = useState([...user.dietaryRestrictions]);
  const [notifications, setNotifications] = useState(true);
  const [smartAlerts, setSmartAlerts] = useState(true);

  const toggleRestriction = (r) =>
    setRestrictions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const save = () => {
    setUser((prev) => ({
      ...prev,
      name: form.name,
      major: form.major,
      year: form.year,
      calorieGoal: parseInt(form.calorieGoal) || prev.calorieGoal,
      proteinGoal: parseInt(form.proteinGoal) || prev.proteinGoal,
      dietaryRestrictions: restrictions,
    }));
    setEditing(false);
  };

  const calPct = Math.round((user.currentCalories / user.calorieGoal) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || 'S')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{user.name}</Text>
        <Text style={styles.heroSub}>{user.year} · {user.major}</Text>
        <View style={styles.heroBadges}>
          {user.dietaryRestrictions.slice(0, 3).map((r) => (
            <Badge key={r} label={r} color="primary" />
          ))}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.streak}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.swipesRemaining}</Text>
          <Text style={styles.statLabel}>Swipes Left</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{calPct}%</Text>
          <Text style={styles.statLabel}>Goal Today</Text>
        </View>
      </View>

      {/* Meal plan card */}
      <Card style={styles.mealPlanCard}>
        <View style={styles.mealPlanRow}>
          <Text style={styles.mealPlanTitle}>🍽️ {user.mealPlan}</Text>
          <View style={styles.swipePillWrap}>
            <View style={[styles.swipePill, { backgroundColor: user.swipesRemaining <= 3 ? COLORS.redLight : COLORS.greenLight }]}>
              <Text style={[styles.swipePillText, { color: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success }]}>
                {user.swipesRemaining} swipes
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.swipeBar}>
          <View style={[styles.swipeFill, {
            width: `${(user.swipesRemaining / user.totalSwipes) * 100}%`,
            backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success,
          }]} />
        </View>
        <Text style={styles.swipeSub}>{user.swipesRemaining} of {user.totalSwipes} remaining this week</Text>
      </Card>

      {/* Profile details */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity onPress={() => editing ? save() : setEditing(true)}>
            <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <Card>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput style={styles.formInput} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            </View>
            <Divider />
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Major</Text>
              <TextInput style={styles.formInput} value={form.major} onChangeText={(v) => setForm({ ...form, major: v })} />
            </View>
            <Divider />
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Year</Text>
              <TextInput style={styles.formInput} value={form.year} onChangeText={(v) => setForm({ ...form, year: v })} />
            </View>
            <Divider />
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Daily Calorie Goal</Text>
              <TextInput style={styles.formInput} value={form.calorieGoal} keyboardType="numeric" onChangeText={(v) => setForm({ ...form, calorieGoal: v })} />
            </View>
            <Divider />
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Daily Protein Goal (g)</Text>
              <TextInput style={styles.formInput} value={form.proteinGoal} keyboardType="numeric" onChangeText={(v) => setForm({ ...form, proteinGoal: v })} />
            </View>
          </Card>
        ) : (
          <Card>
            {[
              ['Name', user.name],
              ['Major', user.major],
              ['Year', user.year],
              ['Calorie Goal', `${user.calorieGoal} kcal/day`],
              ['Protein Goal', `${user.proteinGoal}g/day`],
            ].map(([label, value], i, arr) => (
              <React.Fragment key={label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
                {i < arr.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        )}
      </View>

      {/* Dietary restrictions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <Text style={styles.sectionSub}>These auto-filter your menus across all dining halls.</Text>
        <View style={styles.dietGrid}>
          {DIETARY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => editing || setRestrictions((prev) =>
                prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
              )}
              style={[styles.dietChip, restrictions.includes(opt) && styles.dietChipActive]}
            >
              <Text style={[styles.dietChipText, restrictions.includes(opt) && styles.dietChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!editing && (
          <Button label="Save restrictions" onPress={() => setUser((p) => ({ ...p, dietaryRestrictions: restrictions }))} style={{ marginTop: SPACING.lg }} />
        )}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Smart Alerts</Text>
              <Text style={styles.settingDesc}>Get notified when a nearby hall opens or has low wait</Text>
            </View>
            <Switch
              value={smartAlerts}
              onValueChange={setSmartAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.surface}
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
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.surface}
            />
          </View>
        </Card>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Card style={styles.aboutCard}>
          <Text style={styles.aboutLogo}>🥦 Nutrigain</Text>
          <Text style={styles.aboutTagline}>Your Executive AI Dietician Partner</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0 · OSU Pilot</Text>
          <Text style={styles.aboutTeam}>Made with ❤️ by Rishi, Varsha, Landry, Sujay</Text>
          <Text style={styles.aboutSchool}>The Ohio State University · Spring 2026</Text>
        </Card>
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxxl },
  hero: {
    alignItems: 'center', backgroundColor: COLORS.surface,
    paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md, ...SHADOWS.medium,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.surface },
  heroName: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, letterSpacing: -0.5 },
  heroSub: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statBox: { flex: 1, alignItems: 'center', padding: SPACING.lg },
  statNum: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: -0.5 },
  statLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  mealPlanCard: { margin: SPACING.xl, marginBottom: 0 },
  mealPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  mealPlanTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePillWrap: {},
  swipePill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  swipePillText: { fontFamily: FONTS.bold, fontSize: SIZES.xs },
  swipeBar: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.sm },
  swipeFill: { height: '100%', borderRadius: RADIUS.full },
  swipeSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  section: { padding: SPACING.xl, paddingBottom: 0 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.sm },
  sectionSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  editBtn: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },
  formGroup: { marginBottom: SPACING.xs },
  formLabel: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 4 },
  formInput: {
    height: 40, backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border,
    fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  infoLabel: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  infoValue: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dietChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  dietChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dietChipText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  dietChipTextActive: { color: COLORS.surface },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  settingInfo: { flex: 1 },
  settingLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  settingDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  aboutCard: { alignItems: 'center' },
  aboutLogo: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, marginBottom: SPACING.xs },
  aboutTagline: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  aboutVersion: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary },
  aboutTeam: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.sm },
  aboutSchool: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
});
