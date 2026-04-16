import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Badge, Button, DietaryChip, MacroBar, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';

const MEAL_PERIODS = ['All', 'Breakfast', 'Lunch', 'Dinner'];

const DIETARY_COLORS = {
  vegan:          'success',
  'gluten-free':  'secondary',
  vegetarian:     'success',
  'high-protein': 'primary',
  'dairy-free':   'warning',
};

export default function DiningDetailScreen({ route, navigation }) {
  const { hallId } = route.params;
  const { diningHalls, getFilteredMenuItems, activeFilters, toggleFilter, logMeal } = useApp();
  const hall = diningHalls.find((h) => h.id === hallId);
  const [period, setPeriod] = useState('All');
  const [selected, setSelected] = useState(null);

  if (!hall) return null;

  const allHallItems = getFilteredMenuItems(hallId);
  const items = allHallItems.filter(
    (item) => period === 'All' || item.mealPeriod === period.toLowerCase()
  );

  // True when the hall simply doesn't serve this meal (not a filter issue)
  const mealNotServed =
    period !== 'All' &&
    !hall.currentMeals?.includes(period.toLowerCase());

  // Group items by station (category) for live scraped data
  const stationGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const key = item.category || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [items]);

  const handleLog = (item) => {
    logMeal(item, hall.name);
    setSelected(null);
    Alert.alert('Logged!', `${item.name} added to today's meals.`, [{ text: 'OK' }]);
  };

  const statusColor = { green: COLORS.green, yellow: COLORS.warning, red: COLORS.error }[hall.status] || COLORS.textSecondary;
  const statusLabel = { green: 'Open · Low wait', yellow: 'Busy · 10–15 min', red: 'Crowded · 20+ min' }[hall.status] || 'Status unknown';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.hallName}>{hall.name}</Text>
          <View style={styles.statusRow}>
            <CrowdingDot status={hall.status} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {/* Capacity bar */}
      <View style={styles.capacitySection}>
        <View style={styles.capacityRow}>
          <Text style={styles.capacityLabel}>Current capacity</Text>
          <Text style={[styles.capacityPct, { color: statusColor }]}>{hall.capacity}%</Text>
        </View>
        <View style={styles.capacityBar}>
          <View style={[styles.capacityFill, { width: `${hall.capacity}%`, backgroundColor: statusColor }]} />
        </View>
        <View style={styles.capacityDetails}>
          <Text style={styles.capacityInfo}>⏱ {hall.waitTime}</Text>
          <Text style={styles.capacityInfo}>🕐 {hall.hours}</Text>
          <Text style={styles.capacityInfo}>📍 {hall.distance}</Text>
        </View>
      </View>

      {/* Dietary filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {['vegan', 'gluten-free', 'vegetarian', 'high-protein'].map((f) => (
          <DietaryChip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
      </ScrollView>

      {/* Meal period tabs */}
      <View style={styles.periodTabs}>
        {MEAL_PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.tab, period === p && styles.tabActive]}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu items grouped by station */}
      <ScrollView contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
        {stationGroups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{mealNotServed ? '🕐' : '🥗'}</Text>
            <Text style={styles.emptyText}>
              {mealNotServed
                ? `${period} not served here`
                : 'No items match your filters'}
            </Text>
            <Text style={styles.emptySub}>
              {mealNotServed
                ? 'Check the hours above for available meal periods'
                : 'Try adjusting your dietary filters'}
            </Text>
          </View>
        ) : (
          stationGroups.map(([station, stationItems]) => (
            <View key={station}>
              <Text style={styles.stationHeader}>{station}</Text>
              {stationItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCard}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.88}
                >
                  <View style={styles.menuTop}>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      {item.mealPeriod ? (
                        <Text style={styles.menuCategory}>{item.mealPeriod}</Text>
                      ) : null}
                    </View>
                    <View style={styles.menuCalorie}>
                      <Text style={styles.menuCalNum}>{item.calories}</Text>
                      <Text style={styles.menuCalLabel}>kcal</Text>
                    </View>
                  </View>
                  {item.description ? (
                    <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  <View style={styles.menuMacros}>
                    <Text style={styles.macroChip}>P: {item.protein}g</Text>
                    <Text style={styles.macroChip}>C: {item.carbs}g</Text>
                    <Text style={styles.macroChip}>F: {item.fat}g</Text>
                    {item.sodium > 0 ? (
                      <Text style={styles.macroChip}>Na: {item.sodium}mg</Text>
                    ) : null}
                  </View>
                  {item.dietary.length > 0 && (
                    <View style={styles.dietaryRow}>
                      {item.dietary.map((d) => (
                        <Badge key={d} label={d} color={DIETARY_COLORS[d] || 'primary'} />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Item detail modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selected && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{selected.name}</Text>
                {selected.description ? (
                  <Text style={styles.modalDesc}>{selected.description}</Text>
                ) : null}

                {/* Primary macros */}
                <View style={styles.modalCalRow}>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{selected.calories}</Text>
                    <Text style={styles.modalCalLabel}>Calories</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{selected.protein}g</Text>
                    <Text style={styles.modalCalLabel}>Protein</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{selected.carbs}g</Text>
                    <Text style={styles.modalCalLabel}>Carbs</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{selected.fat}g</Text>
                    <Text style={styles.modalCalLabel}>Fat</Text>
                  </View>
                </View>

                {/* Secondary stats (sodium + fiber) */}
                {(selected.sodium > 0 || selected.fiber > 0) && (
                  <View style={[styles.modalCalRow, styles.modalSecondaryRow]}>
                    {selected.sodium > 0 && (
                      <View style={styles.modalCalBox}>
                        <Text style={styles.modalSecondaryNum}>{selected.sodium}mg</Text>
                        <Text style={styles.modalCalLabel}>Sodium</Text>
                      </View>
                    )}
                    {selected.fiber > 0 && (
                      <View style={styles.modalCalBox}>
                        <Text style={styles.modalSecondaryNum}>{selected.fiber}g</Text>
                        <Text style={styles.modalCalLabel}>Fiber</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={{ marginBottom: SPACING.lg }}>
                  <MacroBar label="Protein" current={selected.protein} goal={40} color={COLORS.primary} />
                  <MacroBar label="Carbs"   current={selected.carbs}   goal={80} color={COLORS.secondary} />
                  <MacroBar label="Fat"     current={selected.fat}     goal={30} color={COLORS.yellow} />
                  {selected.fiber > 0 && (
                    <MacroBar label="Fiber" current={selected.fiber} goal={15} color={COLORS.success} />
                  )}
                </View>

                {selected.allergens.length > 0 && (
                  <View style={styles.allergenRow}>
                    <Text style={styles.allergenLabel}>⚠️ Contains: </Text>
                    <Text style={styles.allergenList}>{selected.allergens.join(', ')}</Text>
                  </View>
                )}

                {selected.dietary.length > 0 && (
                  <View style={styles.dietaryRow}>
                    {selected.dietary.map((d) => (
                      <Badge key={d} label={d} color={DIETARY_COLORS[d] || 'primary'} />
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button label="Cancel" variant="secondary" onPress={() => setSelected(null)} style={{ flex: 1 }} />
                  <Button label="Log this meal +" onPress={() => handleLog(selected)} style={{ flex: 2 }} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon:   { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.surface },
  headerMeta: { flex: 1 },
  hallName:   { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.surface, letterSpacing: -0.5 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  statusText: { fontFamily: FONTS.semiBold, fontSize: SIZES.xs, color: 'rgba(255,255,255,0.85)' },

  capacitySection:  { backgroundColor: COLORS.surface, padding: SPACING.lg, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  capacityRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  capacityLabel:    { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  capacityPct:      { fontFamily: FONTS.bold, fontSize: SIZES.sm },
  capacityBar:      { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  capacityFill:     { height: '100%', borderRadius: RADIUS.full },
  capacityDetails:  { flexDirection: 'row', gap: SPACING.xl },
  capacityInfo:     { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  filterScroll: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    height: 52,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    flexDirection: 'row',
  },

  periodTabs: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  tab:         { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText:     { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  tabTextActive: { fontFamily: FONTS.bold, color: COLORS.primary },

  menuContent: { padding: SPACING.xl },

  stationHeader: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },

  menuCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.xl, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  menuTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  menuInfo:     { flex: 1, marginRight: SPACING.md },
  menuName:     { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, letterSpacing: -0.3 },
  menuCategory: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  menuCalorie:  { alignItems: 'flex-end' },
  menuCalNum:   { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary, letterSpacing: -0.5 },
  menuCalLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  menuDesc:     { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
  menuMacros:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  macroChip:    {
    fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary,
    backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderRadius: RADIUS.full,
  },
  dietaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },

  empty:      { alignItems: 'center', paddingTop: SPACING.huge },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText:  { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  emptySub:   { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:   {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
    padding: SPACING.xl, paddingTop: SPACING.md,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: COLORS.border,
    borderRadius: RADIUS.full, alignSelf: 'center', marginBottom: SPACING.xl,
  },
  modalTitle:  { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, marginBottom: SPACING.sm, letterSpacing: -0.5 },
  modalDesc:   { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 20 },

  modalCalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  modalSecondaryRow: { marginTop: -SPACING.lg, marginBottom: SPACING.lg },
  modalCalBox: { alignItems: 'center', flex: 1 },
  modalCalNum: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, letterSpacing: -0.5 },
  modalSecondaryNum: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textSecondary, letterSpacing: -0.3 },
  modalCalLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  allergenRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  allergenLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.error },
  allergenList: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },

  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
});
