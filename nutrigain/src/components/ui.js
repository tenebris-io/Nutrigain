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
      activeOpacity={0.85}
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
        <Text style={[styles.buttonLabel, isSecondary && styles.buttonLabelSecondary, isGhost && styles.buttonLabelGhost, size === 'sm' && styles.buttonLabelSm]}>
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
    secondary: COLORS.secondaryLight,
    success: COLORS.successLight,
    warning: COLORS.warningLight,
    error: COLORS.errorLight,
    green: COLORS.greenLight,
    yellow: COLORS.yellowLight,
    red: COLORS.redLight,
  };
  const textMap = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
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

// ── SectionHeader ─────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    height: 48,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    height: 36,
    paddingHorizontal: SPACING.lg,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.surface,
    letterSpacing: -0.3,
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
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
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
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  sectionAction: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
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
