// Graze — Neumorphic Design System
// Warm clay base with forest-green & amber accent palette

export const COLORS = {
  // ── Base surface ("the clay") ─────────────────────────────
  base:          '#e4e8e0',
  baseDark:      '#ccd0c8',
  baseLight:     '#f4f7f1',
  background:    '#e4e8e0',   // alias — page background
  surface:       '#e4e8e0',   // alias — card surfaces (neumorphic: match background)
  inputBg:       '#d5d9d1',   // slightly darker for inset/input fields

  // ── Brand greens ──────────────────────────────────────────
  primary:       '#2e7d3e',   // green-mid — interactive, links, active states
  primaryDeep:   '#1e4d2b',   // logo dark green — hero headers, icons
  primarySoft:   '#4a9e5c',   // hover/tag accents
  primaryMuted:  '#8ab898',   // disabled, placeholders
  primaryLight:  '#d4e8d8',   // green tag fills, light badges

  // ── Brand amber ───────────────────────────────────────────
  amber:         '#f5a623',   // primary CTA accent
  amberDark:     '#c4821a',   // pressed CTA
  amberLight:    '#fcd07a',   // badge fills, highlights

  // ── Text ──────────────────────────────────────────────────
  textPrimary:   '#1e4d2b',   // headings — deep forest green
  textBody:      '#3d5c46',   // paragraph text
  textSecondary: '#7a9a82',   // labels, captions
  sectionLabel:  '#7a9a82',   // ALL CAPS section headers
  textPlaceholder: '#a8c0ae', // input placeholders

  // ── Semantic ──────────────────────────────────────────────
  success:       '#2e7d3e',
  warning:       '#f5a623',
  error:         '#c0392b',

  // ── Dining status ─────────────────────────────────────────
  green:         '#34C759',
  yellow:        '#FF9500',
  red:           '#FF3B30',
  greenLight:    '#d4e8d8',
  yellowLight:   '#fef3d0',
  redLight:      '#fce8e6',

  // ── Misc ──────────────────────────────────────────────────
  border:        '#ccd0c8',   // subtle separator
  chevron:       '#8ab898',   // muted green chevrons
  link:          '#2e7d3e',   // in-text links

  // Legacy aliases
  secondary:      '#f5a623',
  secondaryLight: '#fef3d0',
  warningLight:   '#fef3d0',
  errorLight:     '#fce8e6',
  successLight:   '#d4e8d8',
  yellowLight2:   '#fef3d0',
  redLight2:      '#fce8e6',
};

// Nunito (display/headings/buttons) + DM Sans (body/labels)
// Usage: spread into styles — ...FONTS.bold
export const FONTS = {
  regular:  { fontFamily: 'DMSans_400Regular' },
  medium:   { fontFamily: 'DMSans_500Medium' },
  semiBold: { fontFamily: 'Nunito_600SemiBold' },
  bold:     { fontFamily: 'Nunito_700Bold' },
};

export const SIZES = {
  xs:      11,
  sm:      13,
  md:      16,
  lg:      20,
  xl:      24,
  xxl:     30,
  xxxl:    34,
  display: 48,
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 44,
  huge: 64,
};

export const RADIUS = {
  sm:   14,
  md:   20,   // Graze: larger rounded corners
  lg:   28,
  xl:   40,
  full: 9999,
};

// ── Neumorphic shadow system ──────────────────────────────────
// React Native only supports one shadow direction per view.
// RAISED: dark shadow bottom-right + white highlight border top-left.
// INSET (pressed/active): flip — use inputBg background, dark border top-left,
//   white border bottom-right. No outward shadow (elevation 0).
export const SHADOWS = {
  // Raised — standard card / button
  subtle: {
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.60,
    shadowRadius: 12,
    elevation: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.80)',
    borderLeftColor: 'rgba(255,255,255,0.80)',
  },
  // Raised — small (chips, avatars)
  raised_sm: {
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.50,
    shadowRadius: 6,
    elevation: 3,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.75)',
    borderLeftColor: 'rgba(255,255,255,0.75)',
  },
  // Raised — medium hover uplift
  medium: {
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 7,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.85)',
    borderLeftColor: 'rgba(255,255,255,0.85)',
  },
  // Inset — active / pressed / focused (use COLORS.inputBg as bg)
  inset: {
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(163,170,155,0.70)',
    borderLeftColor: 'rgba(163,170,155,0.70)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.80)',
    borderRightColor: 'rgba(255,255,255,0.80)',
  },
  // Inset — small (nav pills, small chips)
  inset_sm: {
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.65)',
    borderLeftColor: 'rgba(163,170,155,0.65)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.75)',
    borderRightColor: 'rgba(255,255,255,0.75)',
  },
};
