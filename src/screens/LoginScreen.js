import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (!ok) setError('Invalid username or password.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead */}
        <View style={styles.masthead}>
          <View style={styles.mastheadTop}>
            <Text style={styles.mastheadDate}>THE OHIO STATE UNIVERSITY</Text>
            <Text style={styles.mastheadIssue}>Campus Dining</Text>
          </View>
          <View style={styles.mastheadLogo}>
            <Image
              source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <Text style={styles.mastheadTitle}>Graze</Text>
          </View>
          <Text style={styles.mastheadTagline}>Campus dining, naturally.</Text>
          <View style={styles.mastheadRule} />
        </View>

        {/* Sign-in form */}
        <View style={styles.formSection}>
          <Text style={styles.kicker}>Sign In</Text>
          <View style={styles.accentLine} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. max.1282"
              placeholderTextColor={COLORS.inkFaint}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.inkFaint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.75}
          >
            {loading
              ? <ActivityIndicator color={COLORS.cream} size="small" />
              : <Text style={styles.loginBtnText}>SIGN IN</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Tester account: <Text style={styles.hintBold}>max.1282</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.cream },
  container: { flexGrow: 1, paddingBottom: SPACING.xxxl },

  masthead: {
    backgroundColor: COLORS.cream,
    paddingTop: SPACING.xxxl + SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  mastheadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    marginBottom: SPACING.md,
  },
  mastheadDate:   { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadIssue:  { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadLogo:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoImg:        { width: 52, height: 52 },
  mastheadTitle:  { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.display, color: COLORS.primaryDeep, letterSpacing: -1 },
  mastheadTagline:{ ...FONTS.serifLight, fontSize: SIZES.md, color: COLORS.inkMid, fontStyle: 'italic', marginTop: SPACING.xs },
  mastheadRule:   { height: 2, backgroundColor: COLORS.amber, marginTop: SPACING.md },

  formSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  kicker: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.amberDark, letterSpacing: 1.4, textTransform: 'uppercase' },
  accentLine: { width: 32, height: 2, backgroundColor: COLORS.amber, marginTop: SPACING.xs, marginBottom: SPACING.xl },

  fieldGroup:  { marginBottom: SPACING.xl },
  fieldLabel:  { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.8, marginBottom: SPACING.sm },
  input: {
    height: 46,
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.ink,
    paddingHorizontal: 0,
    ...FONTS.serif,
    fontSize: SIZES.md,
    color: COLORS.ink,
  },

  error: { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.error, marginBottom: SPACING.md, fontStyle: 'italic' },

  loginBtn: {
    height: 46,
    backgroundColor: COLORS.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryDeep,
  },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.cream, letterSpacing: 1.2 },

  hint:     { textAlign: 'center', ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight, marginTop: SPACING.xxl, fontStyle: 'italic' },
  hintBold: { ...FONTS.medium, color: COLORS.ink, fontStyle: 'normal' },
});
