import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'Vegan', desc: 'No animal products' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish' },
  { id: 'gluten-free', label: 'Gluten-Free', desc: 'No wheat, barley, or rye' },
  { id: 'dairy-free', label: 'Dairy-Free', desc: 'No milk or cheese' },
  { id: 'nut-free', label: 'Nut-Free', desc: 'No tree nuts or peanuts' },
  { id: 'high-protein', label: 'High-Protein', desc: 'Protein-focused meals' },
];

export default function OnboardingScreen() {
  const { setUser, setOnboardingComplete } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [mealPlan, setMealPlan] = useState('Scarlet 14');
  const [selected, setSelected] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState('2000');

  const toggleDiet = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const finish = () => {
    setUser((prev) => ({
      ...prev,
      name: name || 'Student',
      major: major || 'Undeclared',
      year: year || 'Freshman',
      mealPlan,
      dietaryRestrictions: selected,
      calorieGoal: parseInt(calorieGoal) || 2000,
    }));
    setOnboardingComplete(true);
  };

  const steps = [
    // ── Step 0: Welcome ──────────────────────────────────────────────
    <View style={styles.slide} key="welcome">
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeLogo}>
          <Text style={styles.welcomeLogoText}>N</Text>
        </View>
        <Text style={styles.welcomeSchool}>THE OHIO STATE UNIVERSITY</Text>
      </View>
      <Text style={styles.welcomeHeadline}>Welcome to{'\n'}Nutrigain.</Text>
      <Text style={styles.welcomeSub}>
        Your AI-powered campus dining companion. Make every meal count — without the guesswork.
      </Text>
      <View style={styles.featureList}>
        {[
          ['Real-time dining hall status', 'See wait times & crowding live'],
          ['Smart nutrition tracking', 'Log meals and hit your goals'],
          ['AI meal recommendations', 'Powered by Claude'],
          ['Schedule-aware alerts', 'Notifications tuned to your classes'],
        ].map(([title, desc]) => (
          <View style={styles.featureRow} key={title}>
            <View style={styles.featureDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button label="Get Started" onPress={() => setStep(1)} style={{ marginTop: SPACING.xxxl }} />
    </View>,

    // ── Step 1: Profile ──────────────────────────────────────────────
    <View style={styles.slide} key="profile">
      <Text style={styles.stepHeadline}>Tell us about you.</Text>
      <Text style={styles.stepSub}>We'll personalize your experience based on your profile.</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            placeholderTextColor={COLORS.border}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>MAJOR</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Public Health"
            placeholderTextColor={COLORS.border}
            value={major}
            onChangeText={setMajor}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>YEAR</Text>
          <View style={styles.chipRow}>
            {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setYear(y)}
                style={[styles.selectChip, year === y && styles.selectChipActive]}
              >
                <Text style={[styles.selectChipText, year === y && styles.selectChipTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>MEAL PLAN</Text>
          <View style={styles.chipRow}>
            {['Grey 10', 'Scarlet 14', 'Buckeye Unlimited'].map((plan) => (
              <TouchableOpacity
                key={plan}
                onPress={() => setMealPlan(plan)}
                style={[styles.selectChip, mealPlan === plan && styles.selectChipActive]}
              >
                <Text style={[styles.selectChipText, mealPlan === plan && styles.selectChipTextActive]}>{plan}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.navRow}>
        <Button label="Back" variant="ghost" onPress={() => setStep(0)} style={{ flex: 1 }} />
        <Button label="Next" onPress={() => setStep(2)} style={{ flex: 2 }} />
      </View>
    </View>,

    // ── Step 2: Dietary ──────────────────────────────────────────────
    <View style={styles.slide} key="diet">
      <Text style={styles.stepHeadline}>Dietary needs?</Text>
      <Text style={styles.stepSub}>Select all that apply. We'll pre-filter your menus automatically.</Text>
      <View style={styles.dietGrid}>
        {DIETARY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => toggleDiet(opt.id)}
            style={[styles.dietCard, selected.includes(opt.id) && styles.dietCardActive]}
          >
            <Text style={[styles.dietLabel, selected.includes(opt.id) && styles.dietLabelActive]}>
              {opt.label}
            </Text>
            <Text style={styles.dietDesc}>{opt.desc}</Text>
            {selected.includes(opt.id) && (
              <View style={styles.dietCheck}><Text style={styles.dietCheckText}>✓</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.navRow}>
        <Button label="Back" variant="ghost" onPress={() => setStep(1)} style={{ flex: 1 }} />
        <Button label="Next" onPress={() => setStep(3)} style={{ flex: 2 }} />
      </View>
    </View>,

    // ── Step 3: Goals ────────────────────────────────────────────────
    <View style={styles.slide} key="goals">
      <Text style={styles.stepHeadline}>Set your goals.</Text>
      <Text style={styles.stepSub}>You can always update these later in your profile.</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DAILY CALORIE GOAL</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            placeholderTextColor={COLORS.border}
            keyboardType="numeric"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>QUICK PRESETS</Text>
          <View style={styles.chipRow}>
            {[
              { label: 'Weight Loss', cal: '1600' },
              { label: 'Maintenance', cal: '2000' },
              { label: 'Gain Muscle', cal: '2400' },
            ].map((p) => (
              <TouchableOpacity
                key={p.label}
                onPress={() => setCalorieGoal(p.cal)}
                style={[styles.selectChip, calorieGoal === p.cal && styles.selectChipActive]}
              >
                <Text style={[styles.selectChipText, calorieGoal === p.cal && styles.selectChipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.navRow}>
        <Button label="Back" variant="ghost" onPress={() => setStep(2)} style={{ flex: 1 }} />
        <Button label="Get Started" onPress={finish} style={{ flex: 2 }} />
      </View>
    </View>,
  ];

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      {step > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {steps[step]}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.lg },

  // Progress bar
  progressWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },

  slide: { flex: 1, paddingTop: SPACING.xl },

  // Welcome
  welcomeHeader: { alignItems: 'center', marginBottom: SPACING.xxl },
  welcomeLogo: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  welcomeLogoText: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.surface },
  welcomeSchool: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.8,
  },
  welcomeHeadline: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.textPrimary,
    letterSpacing: -1.2,
    marginBottom: SPACING.lg,
  },
  welcomeSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  featureList: { gap: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    flexShrink: 0,
  },
  featureTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  featureDesc: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 1 },

  // Step pages
  stepHeadline: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxl,
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
    marginBottom: SPACING.xs,
  },
  stepSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  form: { gap: SPACING.xl },
  inputGroup: { gap: SPACING.sm },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...SHADOWS.subtle,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  selectChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectChipText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  selectChipTextActive: { color: COLORS.surface },

  // Dietary grid
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  dietCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  dietCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  dietLabel: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 3 },
  dietLabelActive: { color: COLORS.primary },
  dietDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  dietCheck: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietCheckText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.surface },

  navRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl, paddingBottom: SPACING.xl },
});
