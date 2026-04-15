import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { DietaryChip, CrowdingDot, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';

const FILTERS = ['vegan', 'gluten-free', 'vegetarian', 'high-protein', 'dairy-free'];

const STATUS_LABEL = { green: 'Open', yellow: 'Busy', red: 'Crowded' };
const STATUS_COLOR = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.error };
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
      <Text style={styles.title}>Dining Halls</Text>
      <Text style={styles.subtitle}>Real-time availability across OSU campus</Text>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dining halls..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Dietary Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <DietaryChip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
      </ScrollView>

      {/* Crowding Legend */}
      <View style={styles.legend}>
        {['green', 'yellow', 'red'].map((s) => (
          <View key={s} style={styles.legendItem}>
            <CrowdingDot status={s} />
            <Text style={styles.legendText}>
              {s === 'green' ? '< 30% full' : s === 'yellow' ? '30–70% full' : '70%+ full'}
            </Text>
          </View>
        ))}
      </View>

      {/* Hall Cards */}
      <SectionHeader title={`${filtered.length} locations`} />
      {filtered.map((hall) => (
        <TouchableOpacity
          key={hall.id}
          style={styles.hallCard}
          onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
          activeOpacity={0.88}
        >
          {/* Hall header */}
          <View style={styles.hallHeader}>
            <View style={[styles.hallIconWrap, { backgroundColor: STATUS_BG[hall.status] }]}>
              <Text style={styles.hallIcon}>🍽️</Text>
            </View>
            <View style={styles.hallMeta}>
              <Text style={styles.hallName}>{hall.name}</Text>
              <Text style={styles.hallLocation}>{hall.location} · {hall.distance}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[hall.status] }]}>
              <CrowdingDot status={hall.status} />
              <Text style={[styles.statusText, { color: STATUS_COLOR[hall.status] }]}>
                {STATUS_LABEL[hall.status]}
              </Text>
            </View>
          </View>

          {/* Capacity bar */}
          <View style={styles.capacityWrap}>
            <View style={styles.capacityBar}>
              <View style={[styles.capacityFill, {
                width: `${hall.capacity}%`,
                backgroundColor: STATUS_COLOR[hall.status],
              }]} />
            </View>
            <Text style={styles.capacityText}>{hall.capacity}% capacity</Text>
          </View>

          {/* Details row */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>⏱️</Text>
              <Text style={styles.detailText}>{hall.waitTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailText}>{hall.hours}</Text>
            </View>
          </View>

          <View style={styles.viewMenu}>
            <Text style={styles.viewMenuText}>View Menu →</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingTop: SPACING.xl },
  title: { fontFamily: FONTS.bold, fontSize: SIZES.xxl, color: COLORS.textPrimary, letterSpacing: -0.8 },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg,
    height: 48, marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textPrimary },
  filterScroll: { marginBottom: SPACING.lg },
  filterRow: { paddingRight: SPACING.xl },
  legend: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.xl },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  legendText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  hallCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOWS.medium,
  },
  hallHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.md },
  hallIconWrap: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  hallIcon: { fontSize: 24 },
  hallMeta: { flex: 1 },
  hallName: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  hallLocation: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  statusText: { fontFamily: FONTS.bold, fontSize: SIZES.xs },
  capacityWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  capacityBar: {
    flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden',
  },
  capacityFill: { height: '100%', borderRadius: RADIUS.full },
  capacityText: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary, width: 70 },
  detailRow: { flexDirection: 'row', gap: SPACING.xl },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  detailIcon: { fontSize: 14 },
  detailText: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  viewMenu: { marginTop: SPACING.lg, alignItems: 'flex-end' },
  viewMenuText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },
});
