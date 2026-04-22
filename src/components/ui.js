import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

// ── Button ──────────────────────────────────────────────────────────
export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading, style }) {
  const isSecondary = variant === 'secondary';
  const isGhost     = variant === 'ghost';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.80}
      style={[
        styles.button,
        size === 'sm'  && styles.buttonSm,
        isSecondary    && styles.buttonSecondary,
        isGhost        && styles.buttonGhost,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary || isGhost ? COLORS.primary : COLORS.primaryDeep} size="small" />
      ) : (
        <Text style={[
          styles.buttonLabel,
          isSecondary && styles.buttonLabelSecondary,
          isGhost     && styles.buttonLabelGhost,
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
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Badge ────────────────────────────────────────────────────────────
export function Badge({ label, color = 'primary' }) {
  const bgMap = {
    primary:   COLORS.primaryLight,
    secondary: COLORS.amberLight,
    success:   COLORS.primaryLight,
    warning:   COLORS.amberLight,
    error:     COLORS.redLight,
    green:     COLORS.greenLight,
    yellow:    COLORS.yellowLight,
    red:       COLORS.redLight,
  };
  const textMap = {
    primary:   COLORS.primaryDeep,
    secondary: COLORS.amberDark,
    success:   COLORS.primaryDeep,
    warning:   COLORS.amberDark,
    error:     COLORS.error,
    green:     COLORS.primaryDeep,
    yellow:    COLORS.amberDark,
    red:       COLORS.error,
  };
  return (
    <View style={[styles.badge, { backgroundColor: bgMap[color] || bgMap.primary }]}>
      <Text style={[styles.badgeText, { color: textMap[color] || textMap.primary }]}>{label}</Text>
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
        <Text style={styles.macroBarLabel}>{label}</Text>
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
// Active = neumorphic inset (pressed-in) with green tint.
// Inactive = raised (extruded from clay).
export function DietaryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.chip, active ? styles.chipActive : styles.chipRaised]}
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
  // ── Button ──
  button: {
    height: 52,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    // Amber raised shadow
    shadowColor: '#a06414',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 10,
    elevation: 5,
    // Top-left highlight — lighter amber
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,230,140,0.70)',
    borderLeftColor: 'rgba(255,230,140,0.70)',
    // Bottom-right shadow edge — darker amber
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(160,100,20,0.35)',
    borderRightColor: 'rgba(160,100,20,0.35)',
  },
  buttonSm: {
    height: 38,
    paddingHorizontal: SPACING.lg,
  },
  buttonSecondary: {
    backgroundColor: COLORS.base,
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    borderTopColor: 'rgba(255,255,255,0.80)',
    borderLeftColor: 'rgba(255,255,255,0.80)',
    borderBottomColor: 'rgba(163,170,155,0.25)',
    borderRightColor: 'rgba(163,170,155,0.25)',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonLabel: {
    ...FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.primaryDeep,
    letterSpacing: 0.3,
  },
  buttonLabelSm:        { fontSize: SIZES.sm },
  buttonLabelSecondary: { color: COLORS.primary },
  buttonLabelGhost:     { color: COLORS.primary },

  // ── Card ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.subtle,
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    // Subtle raised shadow per design guide tag spec
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    ...FONTS.semiBold,
    fontSize: SIZES.xs,
    letterSpacing: 0.2,
  },

  // ── MacroBar ──
  macroBarContainer: { marginBottom: SPACING.md },
  macroBarHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  macroBarLabel:     { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  macroBarValue:     { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  macroBarTrack: {
    height: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    // Inset look for the track
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)',
    borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.70)',
    borderRightColor: 'rgba(255,255,255,0.70)',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },

  // ── SectionHeader ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle:    { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.sectionLabel, letterSpacing: 0.8 },
  sectionSubtitle: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  sectionAction:   { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },

  // ── CrowdingDot ──
  dot: { width: 9, height: 9, borderRadius: RADIUS.full },

  // ── DietaryChip ──
  chip: {
    height: 36,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.base,
    marginRight: SPACING.sm,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Inactive = raised
  chipRaised: {
    ...SHADOWS.raised_sm,
  },
  // Active = pressed-in inset with green tint bg
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    // Inset shadow: dark border top-left, light border bottom-right
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(120,160,130,0.60)',
    borderLeftColor: 'rgba(120,160,130,0.60)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(220,250,230,0.80)',
    borderRightColor: 'rgba(220,250,230,0.80)',
  },
  chipText:       { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primaryDeep },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
    opacity: 0.5,
  },
});
