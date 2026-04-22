import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DIETARY_OPTIONS = [
  { id: 'vegan',       label: 'Vegan',       desc: 'No animal products' },
  { id: 'vegetarian',  label: 'Vegetarian',  desc: 'No meat or fish' },
  { id: 'gluten-free', label: 'Gluten-Free', desc: 'No wheat, barley, or rye' },
  { id: 'dairy-free',  label: 'Dairy-Free',  desc: 'No milk or cheese' },
  { id: 'nut-free',    label: 'Nut-Free',    desc: 'No tree nuts or peanuts' },
  { id: 'high-protein',label: 'High-Protein',desc: 'Protein-focused meals' },
];

export default function OnboardingScreen() {
  const { setUser, setOnboardingComplete } = useApp();
  const [step, setStep]               = useState(0);
  const [name, setName]               = useState('');
  const [major, setMajor]             = useState('');
  const [year, setYear]               = useState('');
  const [mealPlan, setMealPlan]       = useState('Scarlet 14');
  const [selected, setSelected]       = useState([]);
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
    // Step 0: Welcome
    <View style={styles.slide} key="welcome">
      <View style={styles.mastheadBlock}>
        <View style={styles.mastheadTop}>
          <Text style={styles.mastheadMeta}>THE OHIO STATE UNIVERSITY</Text>
          <Text style={styles.mastheadMeta}>Campus Dining</Text>
        </View>
        <View style={styles.mastheadRule} />
        <View style={styles.mastheadNameRow}>
          <Image source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')} style={styles.mastheadLogo} resizeMode="contain" />
          <Text style={styles.mastheadTitle}>Graze</Text>
        </View>
        <Text style={styles.mastheadDeck}>Campus dining, naturally.</Text>
        <View style={styles.mastheadAccent} />
      </View>

      <View style={styles.featureList}>
        {[
          ['Real-time dining hall status', 'See wait times & crowding live'],
          ['Smart nutrition tracking',     'Log meals and hit your goals'],
          ['AI meal recommendations',      'Powered by Claude'],
          ['Schedule-aware alerts',        'Notifications tuned to your classes'],
        ].map(([title, desc]) => (
          <View key={title} style={styles.featureRow}>
            <View style={styles.featureAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button label="Get Started" onPress={() => setStep(1)} style={{ marginTop: SPACING.xxl }} />
    </View>,

    // Step 1: Profile
    <View style={styles.slide} key="profile">
      <Text style={styles.kicker}>Step 1 of 3</Text>
      <View style={styles.accentLine} />
      <Text style={styles.stepHeadline}>Tell us about you.</Text>
      <Text style={styles.stepDeck}>We'll personalize your experience based on your profile.</Text>

      <View style={styles.form}>
        {[
          ['FIRST NAME', name, setName, 'e.g. Alex', false],
          ['MAJOR',      major, setMajor, 'e.g. Public Health', false],
        ].map(([label, val, setter, ph]) => (
          <View key={label} style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput style={styles.input} placeholder={ph} placeholderTextColor={COLORS.inkFaint} value={val} onChangeText={setter} />
          </View>
        ))}

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>YEAR</Text>
          <View style={styles.chipRow}>
            {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((y) => (
              <TouchableOpacity key={y} onPress={() => setYear(y)} style={[styles.selectChip, year === y && styles.selectChipActive]}>
                <Text style={[styles.selectChipText, year === y && styles.selectChipTextActive]}>{y.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>MEAL PLAN</Text>
          <View style={styles.chipRow}>
            {['Grey 10', 'Scarlet 14', 'Buckeye Unlimited'].map((plan) => (
              <TouchableOpacity key={plan} onPress={() => setMealPlan(plan)} style={[styles.selectChip, mealPlan === plan && styles.selectChipActive]}>
                <Text style={[styles.selectChipText, mealPlan === plan && styles.selectChipTextActive]}>{plan.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.navRow}>
        <Button label="Back" variant="secondary" onPress={() => setStep(0)} style={{ flex: 1 }} />
        <Button label="Next" onPress={() => setStep(2)} style={{ flex: 2 }} />
      </View>
    </View>,

    // Step 2: Dietary
    <View style={styles.slide} key="diet">
      <Text style={styles.kicker}>Step 2 of 3</Text>
      <View style={styles.accentLine} />
      <Text style={styles.stepHeadline}>Dietary needs?</Text>
      <Text style={styles.stepDeck}>Select all that apply. We'll pre-filter your menus automatically.</Text>

      <View style={styles.dietGrid}>
        {DIETARY_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.id} onPress={() => toggleDiet(opt.id)} style={[styles.dietCard, selected.includes(opt.id) && styles.dietCardActive]}>
            {selected.includes(opt.id) && <View style={styles.dietCardCheck}><Text style={styles.dietCardCheckText}>✓</Text></View>}
            <Text style={[styles.dietLabel, selected.includes(opt.id) && styles.dietLabelActive]}>{opt.label}</Text>
            <Text style={styles.dietDesc}>{opt.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navRow}>
        <Button label="Back" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
        <Button label="Next" onPress={() => setStep(3)} style={{ flex: 2 }} />
      </View>
    </View>,

    // Step 3: Goals
    <View style={styles.slide} key="goals">
      <Text style={styles.kicker}>Step 3 of 3</Text>
      <View style={styles.accentLine} />
      <Text style={styles.stepHeadline}>Set your goals.</Text>
      <Text style={styles.stepDeck}>You can always update these later in your profile.</Text>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DAILY CALORIE GOAL</Text>
          <TextInput style={styles.input} placeholder="2000" placeholderTextColor={COLORS.inkFaint} keyboardType="numeric" value={calorieGoal} onChangeText={setCalorieGoal} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>QUICK PRESETS</Text>
          <View style={styles.chipRow}>
            {[{ label: 'Weight Loss', cal: '1600' }, { label: 'Maintenance', cal: '2000' }, { label: 'Gain Muscle', cal: '2400' }].map((p) => (
              <TouchableOpacity key={p.label} onPress={() => setCalorieGoal(p.cal)} style={[styles.selectChip, calorieGoal === p.cal && styles.selectChipActive]}>
                <Text style={[styles.selectChipText, calorieGoal === p.cal && styles.selectChipTextActive]}>{p.label.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.navRow}>
        <Button label="Back" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
        <Button label="Get Started" onPress={finish} style={{ flex: 2 }} />
      </View>
    </View>,
  ];

  return (
    <View style={styles.container}>
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
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll:    { flexGrow: 1, padding: SPACING.lg },

  progressWrap:  { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.md, backgroundColor: COLORS.cream },
  progressTrack: { height: 2, backgroundColor: COLORS.creamDark },
  progressFill:  { height: '100%', backgroundColor: COLORS.primaryDeep },

  slide: { flex: 1, paddingTop: SPACING.xl },

  mastheadBlock:   { borderBottomWidth: 3, borderBottomColor: COLORS.ink, paddingBottom: SPACING.md, marginBottom: SPACING.xxl },
  mastheadTop:     { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.rule, marginBottom: SPACING.sm },
  mastheadMeta:    { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadRule:    { height: 0, marginBottom: SPACING.xs },
  mastheadNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  mastheadLogo:    { width: 52, height: 52 },
  mastheadTitle:   { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.display, color: COLORS.primaryDeep, letterSpacing: -1.5 },
  mastheadDeck:    { fontFamily: 'SourceSerif4_300Light', fontSize: SIZES.md, color: COLORS.inkMid, fontStyle: 'italic', marginTop: SPACING.xs, marginBottom: SPACING.md },
  mastheadAccent:  { height: 2, backgroundColor: COLORS.amber },

  featureList:  { gap: SPACING.lg },
  featureRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  featureAccent:{ width: 2, height: '100%', minHeight: 36, backgroundColor: COLORS.amber },
  featureTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.sm, color: COLORS.ink, letterSpacing: -0.2 },
  featureDesc:  { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.inkLight, marginTop: 2, fontStyle: 'italic' },

  kicker:       { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.amberDark, letterSpacing: 1.4 },
  accentLine:   { width: 32, height: 2, backgroundColor: COLORS.amber, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  stepHeadline: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.xxl, color: COLORS.ink, letterSpacing: -0.8, marginBottom: SPACING.xs },
  stepDeck:     { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, lineHeight: 22, marginBottom: SPACING.xl, fontStyle: 'italic' },

  form:       { gap: SPACING.xl },
  fieldGroup: { gap: SPACING.sm },
  fieldLabel: { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.8 },
  input: {
    height: 44, backgroundColor: 'transparent',
    borderBottomWidth: 1.5, borderBottomColor: COLORS.ink,
    fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.md, color: COLORS.ink,
  },
  chipRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  selectChip:         { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.rule },
  selectChipActive:   { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  selectChipText:     { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.6 },
  selectChipTextActive: { color: COLORS.cream },

  dietGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  dietCard:         { width: (width - SPACING.lg * 2 - SPACING.sm) / 2, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 2, borderTopColor: COLORS.rule },
  dietCardActive:   { borderTopColor: COLORS.primaryDeep, backgroundColor: COLORS.primaryLight },
  dietCardCheck:    { position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 18, height: 18, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  dietCardCheckText:{ ...FONTS.medium, fontSize: 10, color: COLORS.cream },
  dietLabel:        { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.sm, color: COLORS.ink, marginBottom: 3 },
  dietLabelActive:  { color: COLORS.primaryDeep },
  dietDesc:         { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.inkLight, fontStyle: 'italic' },

  navRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl, paddingBottom: SPACING.xl },
});
