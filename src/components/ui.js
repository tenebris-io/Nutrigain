import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

// ── Button ──────────────────────────────────────────────────────────
// Editorial style: outline border (no fills), uppercase DM Sans label
export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading, style }) {
  const isSecondary = variant === 'secondary';
  const isGhost     = variant === 'ghost';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.70}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isGhost     && styles.buttonGhost,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={[
        styles.buttonLabel,
        isSecondary && styles.buttonLabelSecondary,
        isGhost     && styles.buttonLabelGhost,
        size === 'sm' && styles.buttonLabelSm,
      ]}>
        {loading ? '...' : label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

// ── Card ─────────────────────────────────────────────────────────────
// Editorial: white surface, top rule in ink (heavy), thin rule bottom
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Badge ────────────────────────────────────────────────────────────
// Editorial: thin border, no fill — tag style
export function Badge({ label, color = 'primary' }) {
  const colorMap = {
    primary:   COLORS.primaryDeep,
    secondary: COLORS.amberDark,
    success:   COLORS.primaryDeep,
    warning:   COLORS.amberDark,
    error:     COLORS.error,
    green:     COLORS.primaryDeep,
    yellow:    COLORS.amberDark,
    red:       COLORS.error,
  };
  const c = colorMap[color] || colorMap.primary;
  return (
    <View style={[styles.badge, { borderColor: c }]}>
      <Text style={[styles.badgeText, { color: c }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ── MacroBar ─────────────────────────────────────────────────────────
export function MacroBar({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const overGoal = current > goal;
  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroBarHeader}>
        <Text style={styles.macroBarLabel}>{label.toUpperCase()}</Text>
        <Text style={[styles.macroBarValue, overGoal && { color: COLORS.error }]}>
          {current} / {goal}
        </Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View style={[
          styles.macroBarFill,
          { width: `${pct}%`, backgroundColor: overGoal ? COLORS.error : color },
        ]} />
      </View>
    </View>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────
// Editorial: amber 2px accent line above, ALL CAPS DM Sans label
export function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionAccentLine} />
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action.toUpperCase()}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── CrowdingDot ───────────────────────────────────────────────────────
export function CrowdingDot({ status }) {
  if (!status) return null;
  const colorMap = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.red };
  return <View style={[styles.dot, { backgroundColor: colorMap[status] || COLORS.inkLight }]} />;
}

// ── DietaryChip ──────────────────────────────────────────────────────
// Editorial tag style: border-only, no fill inactive; filled green active
export function DietaryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.70}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

// ── Divider ───────────────────────────────────────────────────────────
export function Divider({ heavy }) {
  return <View style={[styles.divider, heavy && styles.dividerHeavy]} />;
}

const styles = StyleSheet.create({
  // ── Button ──
  button: {
    height: 46,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryDeep,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.ink,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.rule,
  },
  buttonDisabled: { opacity: 0.40 },
  buttonLabel: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.cream,
    letterSpacing: 0.10 * SIZES.xs,
  },
  buttonLabelSm:        { fontSize: 10 },
  buttonLabelSecondary: { color: COLORS.ink },
  buttonLabelGhost:     { color: COLORS.inkLight },

  // ── Card ──
  // White surface, heavy top rule, thin bottom rule
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 3,
    borderTopColor: COLORS.ink,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  badgeText: {
    ...FONTS.medium,
    fontSize: 9,
    letterSpacing: 0.8,
  },

  // ── MacroBar ──
  macroBarContainer: { marginBottom: SPACING.md },
  macroBarHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  macroBarLabel:     { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.6 },
  macroBarValue:     { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkMid },
  macroBarTrack: {
    height: 3,
    backgroundColor: COLORS.creamDark,
    borderBottomWidth: 0,
  },
  macroBarFill: { height: '100%' },

  // ── SectionHeader ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  sectionLeft:      { flex: 1 },
  sectionAccentLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.amber,
    marginBottom: SPACING.xs,
  },
  sectionTitleRow: {},
  sectionTitle: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.inkLight,
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.inkLight,
    marginTop: 1,
  },
  sectionAction: {
    ...FONTS.medium,
    fontSize: 10,
    color: COLORS.primaryDeep,
    letterSpacing: 0.8,
    textDecorationLine: 'underline',
  },

  // ── CrowdingDot ──
  dot: { width: 8, height: 8, borderRadius: 4 },

  // ── DietaryChip ──
  chip: {
    height: 30,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  chipText:       { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.6 },
  chipTextActive: { color: COLORS.cream },

  // ── Divider ──
  divider:      { height: 1, backgroundColor: COLORS.rule, marginVertical: SPACING.lg },
  dividerHeavy: { height: 3, backgroundColor: COLORS.ink },
});
