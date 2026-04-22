// Graze — Editorial / Magazine Design System
// Warm cream newsprint base, Playfair Display headlines, sharp corners, ink hierarchy

export const COLORS = {
  // ── Paper & ink ───────────────────────────────────────────────
  cream:        '#f5f0e8',   // primary background — warm newsprint
  creamDark:    '#e8e2d6',   // section fills, subtle dividers
  white:        '#ffffff',
  ink:          '#1a1a14',   // primary text — near-black, warm
  inkMid:       '#3c3c30',   // body copy
  inkLight:     '#7a7a68',   // captions, bylines, metadata
  inkFaint:     '#b8b4a4',   // rules, hairlines, placeholders
  rule:         '#d0cab8',   // column rules, horizontal dividers

  // ── Brand greens ──────────────────────────────────────────────
  primary:      '#2e7d3e',   // interactive accents, links
  primaryDeep:  '#1e4d2b',   // masthead, headers, primary brand
  primarySoft:  '#4a9e5c',   // tags, inline highlights
  primaryLight: '#e8f2ea',   // tinted feature backgrounds (green-wash)
  primaryMuted: '#8ab898',   // disabled, muted

  // ── Brand amber ───────────────────────────────────────────────
  amber:        '#f5a623',   // accent rules, drop caps, kicker lines
  amberDark:    '#c4821a',   // kicker text, pressed
  amberLight:   '#fcd07a',   // light tint accents
  amberWash:    '#fef6e4',   // warm panel tint

  // ── Semantic ──────────────────────────────────────────────────
  success:      '#2e7d3e',
  warning:      '#f5a623',
  error:        '#c0392b',

  // ── Dining status ─────────────────────────────────────────────
  green:        '#34C759',
  yellow:       '#FF9500',
  red:          '#FF3B30',
  greenLight:   '#e8f2ea',
  yellowLight:  '#fef6e4',
  redLight:     '#fce8e6',

  // Legacy aliases for components
  base:          '#f5f0e8',
  background:    '#f5f0e8',
  surface:       '#ffffff',
  inputBg:       '#ece7df',
  baseDark:      '#e8e2d6',
  baseLight:     '#ffffff',
  textPrimary:   '#1a1a14',
  textBody:      '#3c3c30',
  textSecondary: '#7a7a68',
  sectionLabel:  '#7a7a68',
  textPlaceholder: '#b8b4a4',
  border:        '#d0cab8',
  secondary:     '#f5a623',
  secondaryLight:'#fef6e4',
  warningLight:  '#fef6e4',
  errorLight:    '#fce8e6',
  successLight:  '#e8f2ea',
};

// Playfair Display (headlines/display) + Source Serif 4 (editorial/body) + DM Sans (UI labels)
export const FONTS = {
  // DM Sans — UI: labels, buttons, tags, metadata
  regular:  { fontFamily: 'DMSans_400Regular' },
  medium:   { fontFamily: 'DMSans_500Medium' },
  // Playfair Display — headlines, masthead, pull quotes
  semiBold: { fontFamily: 'PlayfairDisplay_700Bold' },
  bold:     { fontFamily: 'PlayfairDisplay_900Black' },
  // Source Serif 4 — body copy, deck, captions
  serif:    { fontFamily: 'SourceSerif4_400Regular' },
  serifLight: { fontFamily: 'SourceSerif4_300Light' },
  serifItalic: { fontFamily: 'SourceSerif4_400Regular_Italic' },
};

export const SIZES = {
  xs:      11,
  sm:      13,
  md:      16,
  lg:      20,
  xl:      24,
  xxl:     30,
  xxxl:    36,
  display: 52,
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

// Editorial: all sharp corners — no rounded radius
export const RADIUS = {
  sm:   0,
  md:   0,
  lg:   0,
  xl:   0,
  full: 0,
};

// Editorial: no shadows — hierarchy from typography + rules only
export const SHADOWS = {
  subtle:   {},
  medium:   {},
  raised_sm:{},
  inset:    {},
  inset_sm: {},
};
