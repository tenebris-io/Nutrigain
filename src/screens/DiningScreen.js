import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { DietaryChip, CrowdingDot, SectionHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { isHallOpen, todayLabel } from '../utils/diningUtils';

const FILTERS = ['vegan', 'gluten-free', 'vegetarian', 'high-protein', 'dairy-free'];

const STATUS_LABEL = { green: 'Open', yellow: 'Busy', red: 'Crowded', closed: 'Closed' };
const STATUS_COLOR = { green: COLORS.green, yellow: COLORS.yellow, red: COLORS.red, closed: COLORS.inkFaint };

export default function DiningScreen({ navigation }) {
  const { diningHalls, activeFilters, toggleFilter } = useApp();
  const [search, setSearch] = useState('');

  const filtered = diningHalls.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTop}>
          <Text style={styles.mastheadDate}>{todayLabel()}</Text>
          <Text style={styles.mastheadTag}>Campus Dining</Text>
        </View>
        <View style={styles.mastheadRule} />
        <Text style={styles.mastheadTitle}>Dining</Text>
        <Text style={styles.mastheadDeck}>Real-time availability & wait times.</Text>
        <View style={styles.mastheadRuleBottom} />
      </View>

      {/* ── Search ───────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dining halls..."
          placeholderTextColor={COLORS.inkFaint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Dietary filters ──────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <DietaryChip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
      </ScrollView>

      {/* ── Hall list ─────────────────────────────────────────────── */}
      <SectionHeader title={`${filtered.length} Locations`} />
      <View style={styles.hallList}>
        {filtered.map((hall, i) => {
          const open          = isHallOpen(hall.hours);
          const displayStatus = open === false ? 'closed' : hall.status;
          return (
            <TouchableOpacity
              key={hall.id}
              style={[styles.hallCard, i < filtered.length - 1 && styles.hallCardBorder]}
              onPress={() => navigation.navigate('DiningDetail', { hallId: hall.id })}
              activeOpacity={0.75}
            >
              <View style={styles.hallTop}>
                <View style={styles.hallMeta}>
                  <View style={styles.hallNameRow}>
                    <CrowdingDot status={displayStatus === 'closed' ? null : displayStatus} />
                    <Text style={styles.hallName}>{hall.name}</Text>
                  </View>
                  <Text style={styles.hallLocation}>{hall.location} · {hall.distance}</Text>
                </View>
                <View style={styles.statusWrap}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[displayStatus] }]}>
                    {STATUS_LABEL[displayStatus]}
                  </Text>
                </View>
              </View>

              <View style={styles.capacityRow}>
                <View style={styles.capacityBar}>
                  <View style={[styles.capacityFill, { width: `${hall.capacity}%`, backgroundColor: STATUS_COLOR[hall.status] }]} />
                </View>
                <Text style={styles.capacityText}>{hall.capacity}%</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailText}>⏱ {hall.waitTime}</Text>
                <Text style={styles.detailText}>🕐 {hall.hours}</Text>
                <Text style={styles.viewMenu}>View Menu →</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        {['green', 'yellow', 'red'].map((s) => (
          <View key={s} style={styles.legendItem}>
            <CrowdingDot status={s} />
            <Text style={styles.legendText}>{s === 'green' ? '< 30% full' : s === 'yellow' ? '30–70%' : '70%+ full'}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content:   {},

  masthead: {
    backgroundColor: COLORS.cream,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  mastheadTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  mastheadDate:      { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8 },
  mastheadTag:       { ...FONTS.medium, fontSize: 9, color: COLORS.amberDark, letterSpacing: 0.8 },
  mastheadRule:      { height: 1, backgroundColor: COLORS.rule, marginBottom: SPACING.sm },
  mastheadTitle:     { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl + 8, color: COLORS.primaryDeep, letterSpacing: -1 },
  mastheadDeck:      { fontFamily: 'SourceSerif4_300Light', fontSize: SIZES.sm, color: COLORS.inkMid, fontStyle: 'italic', marginTop: SPACING.xs, marginBottom: SPACING.md },
  mastheadRuleBottom:{ height: 2, backgroundColor: COLORS.amber },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    borderBottomWidth: 1.5, borderBottomColor: COLORS.ink,
    paddingBottom: SPACING.xs,
  },
  searchIcon:  { fontSize: 18, color: COLORS.inkLight },
  searchInput: { flex: 1, fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.md, color: COLORS.ink, height: 36 },

  filterScroll: { marginTop: SPACING.md },
  filterRow:    { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, alignItems: 'center' },

  hallList: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 3,
    borderTopColor: COLORS.ink,
  },
  hallCard:       { padding: SPACING.lg },
  hallCardBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.rule },

  hallTop:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.md },
  hallMeta:    { flex: 1 },
  hallNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 3 },
  hallName:    { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, letterSpacing: -0.3 },
  hallLocation:{ ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },
  statusWrap:  { paddingLeft: SPACING.md },
  statusText:  { ...FONTS.medium, fontSize: SIZES.xs, letterSpacing: 0.6 },

  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  capacityBar: { flex: 1, height: 3, backgroundColor: COLORS.creamDark },
  capacityFill:{ height: '100%' },
  capacityText:{ ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, width: 32, textAlign: 'right' },

  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  detailText:  { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },
  viewMenu:    { marginLeft: 'auto', ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.primaryDeep, letterSpacing: 0.4, textDecorationLine: 'underline' },

  legend:     { flexDirection: 'row', gap: SPACING.xl, paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendText: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },
});
