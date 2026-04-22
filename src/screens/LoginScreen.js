import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>G</Text>
          </View>
          <Text style={styles.school}>THE OHIO STATE UNIVERSITY</Text>
          <Text style={styles.appName}>Graze</Text>
          <Text style={styles.tagline}>Campus dining, naturally.</Text>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. max.1282"
              placeholderTextColor={COLORS.textPlaceholder}
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
              placeholderTextColor={COLORS.textPlaceholder}
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
            activeOpacity={0.82}
          >
            {loading
              ? <ActivityIndicator color={COLORS.primaryDeep} size="small" />
              : <Text style={styles.loginBtnText}>Sign In</Text>
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
  flex: { flex: 1, backgroundColor: COLORS.base },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl * 1.5,
    paddingBottom: SPACING.xxxl,
  },

  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
    shadowColor: '#1e4d2b',
    shadowOpacity: 0.45,
    borderTopColor: 'rgba(120,200,140,0.30)',
    borderLeftColor: 'rgba(120,200,140,0.30)',
  },
  logoText: { ...FONTS.bold, fontSize: 38, color: COLORS.amberLight },
  school: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  appName: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    ...FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  card: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.subtle,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xl,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },

  fieldGroup: { marginBottom: SPACING.lg },
  fieldLabel: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)',
    borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)',
    borderRightColor: 'rgba(255,255,255,0.65)',
    ...FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },

  error: {
    ...FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },

  loginBtn: {
    height: 52,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.subtle,
    shadowColor: '#a06414',
    shadowOpacity: 0.45,
    borderTopColor: 'rgba(255,230,140,0.60)',
    borderLeftColor: 'rgba(255,230,140,0.60)',
  },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnText: {
    ...FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.primaryDeep,
    letterSpacing: 0.3,
  },

  hint: {
    textAlign: 'center',
    ...FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
  hintBold: { ...FONTS.semiBold, color: COLORS.textPrimary },
});
