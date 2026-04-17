import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { DietaryChip, CrowdingDot, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';

const FILTERS = ['vegan', 'gluten-free', 'vegetarian', 'high-protein', 'dairy-free'];
const STATUS_LABEL = { green: 'Open', yellow: 'Busy', red: 'Crowded' };
const STATUS_COLOR = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.red };
const STATUS_BG = { green: COLORS.greenLight, yellow: COLORS.yellowLight, red: COLORS.redLight };

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
        <Text style={styles.subtitle}>Real-time availability across OSU campus</Text>
      </View>

      {/* ── Search bar (OSU-style) ────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dining halls..."
          placeholderTextColor={COLORS.textSecondary}
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

      {/* ── Section header ────────────────────────────────────────── */}
      <SectionHeader title={`${filtered.length} locations`} />

      {/* ── Hall cards ────────────────────────────────────────────── */}
      <View style={styles.hallList}>
        {filtered.map((hall, i) => (
          <TouchableOpacity
            key={hall.id}
            style={[styles.hallCard, i < filtered.length - 1 && styles.hallCardBorder]}
            onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
            activeOpacity={0.7}
          >
            {/* Hall top row */}
            <View style={styles.hallTop}>
              <View style={[styles.hallIconWrap, { backgroundColor: STATUS_BG[hall.status] }]}>
                <Text style={styles.hallIcon}>🍽️</Text>
              </View>
              <View style={styles.hallMeta}>
                <Text style={styles.hallName}>{hall.name}</Text>
                <Text style={styles.hallLocation}>{hall.location} · {hall.distance}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: STATUS_BG[hall.status] }]}>
                <CrowdingDot status={hall.status} />
                <Text style={[styles.statusText, { color: STATUS_COLOR[hall.status] }]}>
                  {STATUS_LABEL[hall.status]}
                </Text>
              </View>
            </View>

            {/* Capacity bar */}
            <View style={styles.capacityRow}>
              <View style={styles.capacityBar}>
                <View style={[styles.capacityFill, {
                  width: `${hall.capacity}%`,
                  backgroundColor: STATUS_COLOR[hall.status],
                }]} />
              </View>
              <Text style={styles.capacityText}>{hall.capacity}%</Text>
            </View>

            {/* Details + CTA */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>⏱ {hall.waitTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>🕐 {hall.hours}</Text>
              </View>
              <Text style={styles.viewMenu}>View Menu ›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Crowding legend */}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {},

  pageHeader: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xxxl,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  searchIcon: { fontSize: 18, color: COLORS.textSecondary },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },

  filterScroll: { marginTop: SPACING.md },
  filterRow: { paddingHorizontal: SPACING.lg, paddingRight: SPACING.xl },

  // OSU-style grouped card list
  hallList: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  hallCard: {
    padding: SPACING.lg,
  },
  hallCardBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  hallTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  hallIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hallIcon: { fontSize: 22 },
  hallMeta: { flex: 1 },
  hallName: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallLocation: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: { fontFamily: FONTS.bold, fontSize: SIZES.xs },

  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  capacityBar: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  capacityFill: { height: '100%', borderRadius: RADIUS.full },
  capacityText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    width: 32,
    textAlign: 'right',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  viewMenu: {
    marginLeft: 'auto',
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },

  legend: {
    flexDirection: 'row',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
});
