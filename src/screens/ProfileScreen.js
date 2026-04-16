import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Animated,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, Button, Badge, Divider } from '../components/ui';
import { useApp } from '../context/AppContext';

const DIETARY_OPTIONS = ['vegan', 'gluten-free', 'vegetarian', 'dairy-free', 'nut-free', 'high-protein'];

export default function ProfileScreen({ navigation }) {
  const { user, setUser, apiKey, setApiKey } = useApp();
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
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { setApiKeyInput(apiKey); }, [apiKey]);

  const showToast = () => {
    toastOpacity.setValue(1);
    Animated.timing(toastOpacity, { toValue: 0, duration: 500, delay: 1500, useNativeDriver: true }).start();
  };

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
    showToast();
  };

  const calPct = Math.round((user.currentCalories / user.calorieGoal) * 100);

  return (
    <View style={{ flex: 1 }}>
    <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
      <Text style={styles.toastText}>Saved!</Text>
    </Animated.View>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || 'S')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{user.name}</Text>
        <Text style={styles.heroSub}>{user.year} · {user.major}</Text>
        {user.dietaryRestrictions.length > 0 && (
          <View style={styles.heroBadges}>
            {user.dietaryRestrictions.slice(0, 3).map((r) => (
              <Badge key={r} label={r} color="primary" />
            ))}
          </View>
        )}
      </View>

      {/* ── Stats row (OSU-style) ─────────────────────────────────── */}
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

      {/* ── Meal plan card ────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MEAL PLAN</Text>
        <View style={styles.card}>
          <View style={styles.mealPlanRow}>
            <Text style={styles.mealPlanTitle}>{user.mealPlan}</Text>
            <View style={[styles.swipePill, {
              backgroundColor: user.swipesRemaining <= 3 ? COLORS.redLight : COLORS.greenLight,
            }]}>
              <Text style={[styles.swipePillText, {
                color: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success,
              }]}>
                {user.swipesRemaining} swipes
              </Text>
            </View>
          </View>
          <View style={styles.swipeBar}>
            <View style={[styles.swipeFill, {
              width: `${(user.swipesRemaining / user.totalSwipes) * 100}%`,
              backgroundColor: user.swipesRemaining <= 3 ? COLORS.error : COLORS.success,
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
                { label: 'Name', key: 'name', keyboard: 'default' },
                { label: 'Major', key: 'major', keyboard: 'default' },
                { label: 'Year', key: 'year', keyboard: 'default' },
                { label: 'Daily Calorie Goal', key: 'calorieGoal', keyboard: 'numeric' },
                { label: 'Daily Protein Goal (g)', key: 'proteinGoal', keyboard: 'numeric' },
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
        </View>
      </View>

      {/* ── AI Settings ──────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AI ASSISTANT</Text>
        <Text style={styles.sectionSub}>Your API key is stored locally on this device and never shared.</Text>
        <View style={styles.card}>
          <Text style={styles.formLabel}>Claude API Key</Text>
          <View style={styles.apiKeyRow}>
            <TextInput
              style={[styles.formInput, styles.apiKeyInput]}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="sk-ant-..."
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!apiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setApiKeyVisible((v) => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{apiKeyVisible ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <Button
            label="Save API Key"
            onPress={() => { setApiKey(apiKeyInput); showToast(); }}
            style={{ marginTop: SPACING.md }}
          />
          {apiKey ? (
            <Text style={styles.apiKeyStatus}>✓ API key configured — chatbot is active</Text>
          ) : (
            <Text style={styles.apiKeyMissing}>No key saved. Get one at console.anthropic.com</Text>
          )}
        </View>
      </View>

      {/* ── About ────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={[styles.card, styles.aboutCard]}>
          <Text style={styles.aboutLogo}>Nutrigain</Text>
          <Text style={styles.aboutTagline}>Your AI Campus Dining Companion</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0 · OSU Pilot</Text>
          <Text style={styles.aboutTeam}>Made with ❤️ by Rishi, Varsha, Landry, Sujay</Text>
          <Text style={styles.aboutSchool}>The Ohio State University · Spring 2026</Text>
        </View>
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxxl },

  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.surface },
  heroName: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.surface, letterSpacing: -0.4 },
  heroSub: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: SPACING.sm },
  heroBadges: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statDivider: { width: 0.5, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  statNum: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: -0.5 },
  statLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  section: { padding: SPACING.lg, paddingBottom: 0 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  sectionSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: -4,
  },
  editBtn: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },

  // Meal plan
  mealPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  mealPlanTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  swipePill: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  swipePillText: { fontFamily: FONTS.bold, fontSize: SIZES.xs },
  swipeBar: { height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.xs },
  swipeFill: { height: '100%', borderRadius: RADIUS.full },
  swipeSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  // Form
  formGroup: { marginBottom: SPACING.xs },
  formLabel: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 4 },
  formInput: {
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  infoLabel: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  infoValue: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },

  // Diet chips
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dietChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dietChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dietChipText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  dietChipTextActive: { color: COLORS.surface },

  // Settings
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  settingInfo: { flex: 1 },
  settingLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  settingDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  // Toast
  toast: {
    position: 'absolute',
    top: SPACING.xxxl + 8,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  toastText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.surface },

  // API key
  apiKeyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  apiKeyInput: { flex: 1 },
  eyeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eyeText: { fontSize: 16 },
  apiKeyStatus: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  apiKeyMissing: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },

  // About
  aboutCard: { alignItems: 'center', gap: 4 },
  aboutLogo: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary },
  aboutTagline: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  aboutVersion: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  aboutTeam: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  aboutSchool: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
});
