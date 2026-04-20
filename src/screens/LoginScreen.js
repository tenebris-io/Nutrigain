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
        {/* OSU header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.school}>THE OHIO STATE UNIVERSITY</Text>
          <Text style={styles.appName}>Nutrigain</Text>
          <Text style={styles.tagline}>Campus dining, tracked.</Text>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. max.1282"
              placeholderTextColor={COLORS.textSecondary}
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
              placeholderTextColor={COLORS.textSecondary}
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
              ? <ActivityIndicator color={COLORS.surface} size="small" />
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
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl * 1.5,
    paddingBottom: SPACING.xxxl,
  },

  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logo: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: { fontFamily: FONTS.bold, fontSize: 36, color: COLORS.surface },
  school: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    ...SHADOWS.subtle,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xl,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xl,
  },

  fieldGroup: { marginBottom: SPACING.lg },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },

  error: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.error || '#BB0000',
    marginBottom: SPACING.md,
  },

  loginBtn: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loginBtnDisabled: { opacity: 0.55 },
  loginBtnText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.surface,
    letterSpacing: -0.2,
  },

  hint: {
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
  hintBold: { fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
});
