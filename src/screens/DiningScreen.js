import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { DietaryChip, CrowdingDot, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { isHallOpen, todayLabel } from '../utils/diningUtils';

const FILTERS = ['vegan', 'gluten-free', 'vegetarian', 'high-protein', 'dairy-free'];
const STATUS_LABEL = { green: 'Open', yellow: 'Busy', red: 'Crowded', closed: 'Closed' };
const STATUS_COLOR = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.red, closed: COLORS.textSecondary };
const STATUS_BG    = { green: COLORS.greenLight, yellow: COLORS.yellowLight, red: COLORS.redLight, closed: COLORS.inputBg };

export default function DiningScreen({ navigation }) {
  const { diningHalls, activeFilters, toggleFilter } = useApp();
  const [search, setSearch] = useState('');

  const filtered = diningHalls.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.title}>Dining</Text>
        <Text style={styles.subtitle}>Real-time availability · {todayLabel()}</Text>
      </View>

      {/* ── Search bar ───────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dining halls..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Dietary filters ───────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <DietaryChip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
      </ScrollView>

      {/* ── Hall list ─────────────────────────────────────────────── */}
      <SectionHeader title={`${filtered.length} locations`} />
      <View style={styles.hallList}>
        {filtered.map((hall, i) => {
          const open = isHallOpen(hall.hours);
          const displayStatus = open === false ? 'closed' : hall.status;
          return (
            <TouchableOpacity
              key={hall.id}
              style={[styles.hallCard, i < filtered.length - 1 && styles.hallCardBorder]}
              onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
              activeOpacity={0.7}
            >
              <View style={styles.hallTop}>
                <View style={[styles.hallIconWrap, { backgroundColor: STATUS_BG[displayStatus] }]}>
                  <Text style={styles.hallIcon}>🍽️</Text>
                </View>
                <View style={styles.hallMeta}>
                  <Text style={styles.hallName}>{hall.name}</Text>
                  <Text style={styles.hallLocation}>{hall.location} · {hall.distance}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_BG[displayStatus] }]}>
                  <CrowdingDot status={displayStatus === 'closed' ? null : displayStatus} />
                  <Text style={[styles.statusText, { color: STATUS_COLOR[displayStatus] }]}>
                    {STATUS_LABEL[displayStatus]}
                  </Text>
                </View>
              </View>

              <View style={styles.capacityRow}>
                <View style={styles.capacityBar}>
                  <View style={[styles.capacityFill, {
                    width: `${hall.capacity}%`,
                    backgroundColor: STATUS_COLOR[hall.status],
                  }]} />
                </View>
                <Text style={styles.capacityText}>{hall.capacity}%</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailText}>⏱ {hall.waitTime}</Text>
                <Text style={styles.detailText}>🕐 {hall.hours}</Text>
                <Text style={styles.viewMenu}>View Menu ›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {['green', 'yellow', 'red'].map((s) => (
          <View key={s} style={styles.legendItem}>
            <CrowdingDot status={s} />
            <Text style={styles.legendText}>
              {s === 'green' ? '< 30% full' : s === 'yellow' ? '30–70%' : '70%+ full'}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.base },
  content: {},

  pageHeader: {
    backgroundColor: COLORS.primaryDeep,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.amberLight,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)',
    borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)',
    borderRightColor: 'rgba(255,255,255,0.65)',
  },
  searchIcon: { fontSize: 18, color: COLORS.textSecondary },
  searchInput: {
    flex: 1,
    ...FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },

  filterScroll: { marginTop: SPACING.md },
  filterRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, alignItems: 'center' },

  hallList: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  hallCard: { padding: SPACING.lg },
  hallCardBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(163,170,155,0.25)' },

  hallTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  hallIconWrap: {
    width: 46, height: 46, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  hallIcon:     { fontSize: 22 },
  hallMeta:     { flex: 1 },
  hallName:     { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallLocation: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  statusText: { ...FONTS.bold, fontSize: SIZES.xs },

  capacityRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md,
  },
  capacityBar: {
    flex: 1, height: 6, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full, overflow: 'hidden',
    borderTopWidth: 0.5, borderLeftWidth: 0.5,
    borderTopColor: 'rgba(163,170,155,0.50)', borderLeftColor: 'rgba(163,170,155,0.50)',
  },
  capacityFill: { height: '100%', borderRadius: RADIUS.full },
  capacityText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, width: 32, textAlign: 'right' },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  detailText: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  viewMenu: {
    marginLeft: 'auto', ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary,
  },

  legend: { flexDirection: 'row', gap: SPACING.xl, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendText: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
});
