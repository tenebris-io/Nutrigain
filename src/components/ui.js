import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

// ── Button ──────────────────────────────────────────────────────────
export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading, style }) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.button,
        size === 'sm' && styles.buttonSm,
        isSecondary && styles.buttonSecondary,
        isGhost && styles.buttonGhost,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary || isGhost ? COLORS.primary : COLORS.surface} size="small" />
      ) : (
        <Text style={[
          styles.buttonLabel,
          isSecondary && styles.buttonLabelSecondary,
          isGhost && styles.buttonLabelGhost,
          size === 'sm' && styles.buttonLabelSm,
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── Card ─────────────────────────────────────────────────────────────
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Badge ────────────────────────────────────────────────────────────
export function Badge({ label, color = 'primary' }) {
  const bgMap = {
    primary: COLORS.primaryLight,
    secondary: COLORS.primaryLight,
    success: COLORS.successLight,
    warning: COLORS.warningLight,
    error: COLORS.errorLight,
    green: COLORS.greenLight,
    yellow: COLORS.yellowLight,
    red: COLORS.redLight,
  };
  const textMap = {
    primary: COLORS.primary,
    secondary: COLORS.primary,
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    green: COLORS.green,
    yellow: COLORS.yellow,
    red: COLORS.red,
  };
  return (
    <View style={[styles.badge, { backgroundColor: bgMap[color] || bgMap.primary }]}>
      <Text style={[styles.badgeText, { color: textMap[color] || textMap.primary }]}>{label}</Text>
    </View>
  );
}

// ── MacroBar ─────────────────────────────────────────────────────────
export function MacroBar({ label, current, goal, color }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroBarHeader}>
        <Text style={styles.macroBarLabel}>{label}</Text>
        <Text style={styles.macroBarValue}>{current}g / {goal}g</Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── SectionHeader — OSU style: ALL CAPS gray label + optional red action ──
export function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── CrowdingDot ───────────────────────────────────────────────────────
export function CrowdingDot({ status }) {
  if (!status) return null;
  const colorMap = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.red };
  return <View style={[styles.dot, { backgroundColor: colorMap[status] || COLORS.textSecondary }]} />;
}

// ── DietaryChip ──────────────────────────────────────────────────────
export function DietaryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Divider ───────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    height: 36,
    paddingHorizontal: SPACING.lg,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.surface,
    letterSpacing: -0.2,
  },
  buttonLabelSm: {
    fontSize: SIZES.sm,
  },
  buttonLabelSecondary: {
    color: COLORS.primary,
  },
  buttonLabelGhost: {
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    letterSpacing: 0.2,
  },
  macroBarContainer: {
    marginBottom: SPACING.md,
  },
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  macroBarLabel: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  macroBarValue: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
  },
  macroBarTrack: {
    height: 7,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  // OSU-style section header: small uppercase gray label
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.sectionLabel,
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  sectionAction: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: RADIUS.full,
  },
  chip: {
    height: 34,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.surface,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
});
