import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Switch,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  { id: 'vegan', label: '🌱 Vegan', desc: 'No animal products' },
  { id: 'vegetarian', label: '🥦 Vegetarian', desc: 'No meat or fish' },
  { id: 'gluten-free', label: '🌾 Gluten-Free', desc: 'No wheat, barley, or rye' },
  { id: 'dairy-free', label: '🥛 Dairy-Free', desc: 'No milk or cheese' },
  { id: 'nut-free', label: '🥜 Nut-Free', desc: 'No tree nuts or peanuts' },
  { id: 'high-protein', label: '💪 High-Protein', desc: 'Protein-focused meals' },
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
      <View style={styles.welcomeEmoji}>
        <Text style={styles.emoji}>🥦</Text>
      </View>
      <Text style={styles.welcomeHeadline}>Welcome to{'\n'}Nutrigain.</Text>
      <Text style={styles.welcomeSub}>
        Your AI-powered campus dining companion. Make every meal count — without the guesswork.
      </Text>
      <View style={styles.featureList}>
        {[
          ['⚡', 'Real-time dining hall status'],
          ['🥗', 'Smart nutrition tracking'],
          ['🤖', 'AI meal recommendations'],
          ['🔔', 'Schedule-aware alerts'],
        ].map(([icon, text]) => (
          <View style={styles.featureRow} key={text}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>
      <Button label="Get Started" onPress={() => setStep(1)} style={{ marginTop: SPACING.xxxl }} />
    </View>,

    // ── Step 1: Profile ──────────────────────────────────────────────
    <View style={styles.slide} key="profile">
      <Text style={styles.stepHeadline}>Tell us about you.</Text>
      <Text style={styles.stepSub}>We'll personalize your experience.</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Max"
            placeholderTextColor={COLORS.border}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Major</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Public Health"
            placeholderTextColor={COLORS.border}
            value={major}
            onChangeText={setMajor}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Year</Text>
          <View style={styles.yearRow}>
            {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setYear(y)}
                style={[styles.yearChip, year === y && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, year === y && styles.yearChipTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Meal Plan</Text>
          <View style={styles.yearRow}>
            {['Grey 10', 'Scarlet 14', 'Buckeye Unlimited'].map((plan) => (
              <TouchableOpacity
                key={plan}
                onPress={() => setMealPlan(plan)}
                style={[styles.yearChip, mealPlan === plan && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, mealPlan === plan && styles.yearChipTextActive]}>{plan}</Text>
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

    // ── Step 2: Dietary Restrictions ─────────────────────────────────
    <View style={styles.slide} key="diet">
      <Text style={styles.stepHeadline}>Dietary needs?</Text>
      <Text style={styles.stepSub}>Select all that apply. We'll pre-filter your menus automatically — no manual setup needed.</Text>
      <View style={styles.dietGrid}>
        {DIETARY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => toggleDiet(opt.id)}
            style={[styles.dietCard, selected.includes(opt.id) && styles.dietCardActive]}
          >
            <Text style={styles.dietEmoji}>{opt.label.split(' ')[0]}</Text>
            <Text style={[styles.dietLabel, selected.includes(opt.id) && styles.dietLabelActive]}>
              {opt.label.split(' ').slice(1).join(' ')}
            </Text>
            <Text style={styles.dietDesc}>{opt.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.navRow}>
        <Button label="Back" variant="ghost" onPress={() => setStep(1)} style={{ flex: 1 }} />
        <Button label="Next" onPress={() => setStep(3)} style={{ flex: 2 }} />
      </View>
    </View>,

    // ── Step 3: Nutrition Goals ────────────────────────────────────
    <View style={styles.slide} key="goals">
      <Text style={styles.stepHeadline}>Set your goals.</Text>
      <Text style={styles.stepSub}>You can always update these later in your profile.</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Calorie Goal</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            placeholderTextColor={COLORS.border}
            keyboardType="numeric"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
          />
        </View>
        <View style={styles.goalPresets}>
          <Text style={styles.inputLabel}>Quick Presets</Text>
          <View style={styles.yearRow}>
            {[
              { label: 'Weight Loss', cal: '1600' },
              { label: 'Maintenance', cal: '2000' },
              { label: 'Gain Muscle', cal: '2400' },
            ].map((p) => (
              <TouchableOpacity
                key={p.label}
                onPress={() => setCalorieGoal(p.cal)}
                style={[styles.yearChip, calorieGoal === p.cal && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, calorieGoal === p.cal && styles.yearChipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.navRow}>
        <Button label="Back" variant="ghost" onPress={() => setStep(2)} style={{ flex: 1 }} />
        <Button label="Let's Go 🚀" onPress={finish} style={{ flex: 2 }} />
      </View>
    </View>,
  ];

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      {step > 0 && (
        <View style={styles.dots}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
          ))}
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
  scroll: { flexGrow: 1, padding: SPACING.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingTop: SPACING.xl, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  slide: { flex: 1, paddingTop: SPACING.xxxl },
  welcomeEmoji: {
    width: 80, height: 80, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: { fontSize: 40 },
  welcomeHeadline: {
    fontFamily: FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.textPrimary,
    letterSpacing: -1.5, marginBottom: SPACING.lg,
  },
  welcomeSub: {
    fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary,
    lineHeight: 24, marginBottom: SPACING.xxxl,
  },
  featureList: { gap: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureIcon: { fontSize: 22, width: 32 },
  featureText: { fontFamily: FONTS.medium, fontSize: SIZES.md, color: COLORS.textPrimary },
  stepHeadline: {
    fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.textPrimary,
    letterSpacing: -0.8, marginBottom: SPACING.sm,
  },
  stepSub: {
    fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary,
    lineHeight: 22, marginBottom: SPACING.xxl,
  },
  form: { gap: SPACING.xl },
  inputGroup: { gap: SPACING.sm },
  inputLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  input: {
    height: 48, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.border,
    fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textPrimary,
  },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  yearChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  yearChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  yearChipText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  yearChipTextActive: { color: COLORS.surface },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  dietCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.subtle,
  },
  dietCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  dietEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  dietLabel: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.textPrimary, marginBottom: 2 },
  dietLabelActive: { color: COLORS.primary },
  dietDesc: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  goalPresets: { gap: SPACING.sm },
  navRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xxl },
});
