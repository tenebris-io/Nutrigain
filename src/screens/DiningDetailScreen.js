import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { Badge, Button, DietaryChip, MacroBar, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';

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

  const [period, setPeriod]                       = useState('all');
  const [selected, setSelected]                   = useState(null);
  const [servings, setServings]                   = useState(1);
  const [collapsedStations, setCollapsedStations] = useState({});

  if (!hall) return null;

  const mealTabs = useMemo(() => {
    const served    = hall.currentMeals || [];
    const hasDinner = served.includes('dinner');
    const tabs      = [{ label: 'All', value: 'all' }];
    if (served.includes('breakfast')) tabs.push({ label: 'Breakfast', value: 'breakfast' });
    if (served.includes('lunch'))     tabs.push({ label: hasDinner ? 'Lunch' : 'Lunch/Dinner', value: 'lunch' });
    if (hasDinner)                    tabs.push({ label: 'Dinner', value: 'dinner' });
    return tabs;
  }, [hall.currentMeals]);

  const allHallItems = getFilteredMenuItems(hallId);
  const items = allHallItems.filter(
    (item) => period === 'all' || item.mealPeriod === period
  );

  const stationGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const key = item.category || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [items]);

  const isCollapsed = (name) => collapsedStations[name] !== false;

  const toggleStation = (name) => {
    setCollapsedStations((prev) => ({ ...prev, [name]: prev[name] === false }));
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    setCollapsedStations({});
  };

  const handleSelectItem = (item) => {
    setSelected(item);
    setServings(1);
  };

  const handleLog = () => {
    const adjusted = {
      ...selected,
      calories: Math.round(selected.calories * servings),
      protein:  Math.round(selected.protein  * servings),
      carbs:    Math.round(selected.carbs    * servings),
      fat:      Math.round(selected.fat      * servings),
    };
    logMeal(adjusted, hall.name);
    setSelected(null);
    setServings(1);
    const label = servings > 1 ? `${servings}x ${selected.name}` : selected.name;
    Alert.alert('Logged!', `${label} added to today's meals.`, [{ text: 'OK' }]);
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
        {mealTabs.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => handlePeriodChange(t.value)}
            style={[styles.tab, period === t.value && styles.tabActive]}
          >
            <Text style={[styles.tabText, period === t.value && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu items grouped by collapsible station */}
      <ScrollView contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
        {stationGroups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🥗</Text>
            <Text style={styles.emptyText}>No items match your filters</Text>
            <Text style={styles.emptySub}>Try adjusting your dietary filters</Text>
          </View>
        ) : (
          stationGroups.map(([station, stationItems]) => {
            const collapsed = isCollapsed(station);
            return (
              <View key={station}>
                <TouchableOpacity
                  style={styles.stationHeaderRow}
                  onPress={() => toggleStation(station)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stationHeaderText}>{station.toUpperCase()}</Text>
                  <Text style={styles.stationChevron}>{collapsed ? '+' : '−'}</Text>
                </TouchableOpacity>

                {!collapsed && stationItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuCard}
                    onPress={() => handleSelectItem(item)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.menuTop}>
                      <View style={styles.menuInfo}>
                        <Text style={styles.menuName}>{item.name}</Text>
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
            );
          })
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

                {/* Servings selector */}
                <View style={styles.servingRow}>
                  <Text style={styles.servingLabel}>Servings</Text>
                  <View style={styles.servingControl}>
                    <TouchableOpacity
                      style={styles.servingBtn}
                      onPress={() => setServings((s) => Math.max(1, s - 1))}
                    >
                      <Text style={styles.servingBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.servingCount}>{servings}</Text>
                    <TouchableOpacity
                      style={styles.servingBtn}
                      onPress={() => setServings((s) => Math.min(10, s + 1))}
                    >
                      <Text style={styles.servingBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Nutrition scaled to servings */}
                <View style={styles.modalCalRow}>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{Math.round(selected.calories * servings)}</Text>
                    <Text style={styles.modalCalLabel}>Calories</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{Math.round(selected.protein * servings)}g</Text>
                    <Text style={styles.modalCalLabel}>Protein</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{Math.round(selected.carbs * servings)}g</Text>
                    <Text style={styles.modalCalLabel}>Carbs</Text>
                  </View>
                  <View style={styles.modalCalBox}>
                    <Text style={styles.modalCalNum}>{Math.round(selected.fat * servings)}g</Text>
                    <Text style={styles.modalCalLabel}>Fat</Text>
                  </View>
                </View>

                {(selected.sodium > 0 || selected.fiber > 0) && (
                  <View style={[styles.modalCalRow, styles.modalSecondaryRow]}>
                    {selected.sodium > 0 && (
                      <View style={styles.modalCalBox}>
                        <Text style={styles.modalSecondaryNum}>{Math.round(selected.sodium * servings)}mg</Text>
                        <Text style={styles.modalCalLabel}>Sodium</Text>
                      </View>
                    )}
                    {selected.fiber > 0 && (
                      <View style={styles.modalCalBox}>
                        <Text style={styles.modalSecondaryNum}>{Math.round(selected.fiber * servings)}g</Text>
                        <Text style={styles.modalCalLabel}>Fiber</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={{ marginBottom: SPACING.lg }}>
                  <MacroBar label="Protein" current={Math.round(selected.protein * servings)} goal={40} color={COLORS.primary} />
                  <MacroBar label="Carbs"   current={Math.round(selected.carbs   * servings)} goal={80} color={COLORS.primarySoft} />
                  <MacroBar label="Fat"     current={Math.round(selected.fat     * servings)} goal={30} color={COLORS.amber} />
                  {selected.fiber > 0 && (
                    <MacroBar label="Fiber" current={Math.round(selected.fiber * servings)} goal={15} color={COLORS.primaryMuted} />
                  )}
                </View>

                {selected.allergens.length > 0 && (
                  <View style={styles.allergenRow}>
                    <Text style={styles.allergenLabel}>⚠️ Contains: </Text>
                    <Text style={styles.allergenList}>{selected.allergens.join(', ')}</Text>
                  </View>
                )}

                {selected.dietary.length > 0 && (
                  <View style={[styles.dietaryRow, { marginBottom: SPACING.sm }]}>
                    {selected.dietary.map((d) => (
                      <Badge key={d} label={d} color={DIETARY_COLORS[d] || 'primary'} />
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button label="Cancel" variant="secondary" onPress={() => setSelected(null)} style={{ flex: 1 }} />
                  <Button
                    label={servings > 1 ? `Log ${servings}x +` : 'Log this meal +'}
                    onPress={handleLog}
                    style={{ flex: 2 }}
                  />
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
  container: { flex: 1, backgroundColor: COLORS.base },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primaryDeep,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon:   { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.amberLight },
  headerMeta: { flex: 1 },
  hallName:   { ...FONTS.bold, fontSize: SIZES.lg, color: COLORS.amberLight, letterSpacing: -0.5 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  statusText: { ...FONTS.semiBold, fontSize: SIZES.xs, color: 'rgba(255,255,255,0.85)' },

  capacitySection: {
    backgroundColor: COLORS.base,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOWS.subtle,
  },
  capacityRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  capacityLabel:   { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  capacityPct:     { ...FONTS.bold, fontSize: SIZES.sm },
  capacityBar:     {
    height: 8, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.50)', borderLeftColor: 'rgba(163,170,155,0.50)',
  },
  capacityFill:    { height: '100%', borderRadius: RADIUS.full },
  capacityDetails: { flexDirection: 'row', gap: SPACING.xl },
  capacityInfo:    { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  filterScroll: { marginTop: SPACING.md },
  filterRow:    { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center' },

  periodTabs:    {
    flexDirection: 'row',
    backgroundColor: COLORS.base,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.xl,
    ...SHADOWS.subtle,
    overflow: 'hidden',
  },
  tab:           { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive:     { backgroundColor: COLORS.primaryDeep },
  tabText:       { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  tabTextActive: { ...FONTS.bold, color: COLORS.amberLight },

  menuContent: { padding: SPACING.lg },

  stationHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: SPACING.lg, marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(163,170,155,0.40)',
  },
  stationHeaderText: { ...FONTS.bold, fontSize: SIZES.xs, color: COLORS.sectionLabel, letterSpacing: 0.8 },
  stationChevron:    { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.sectionLabel, lineHeight: 18 },

  menuCard:     {
    backgroundColor: COLORS.base, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.subtle,
  },
  menuTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  menuInfo:     { flex: 1, marginRight: SPACING.md },
  menuName:     { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, letterSpacing: -0.3 },
  menuCalorie:  { alignItems: 'flex-end' },
  menuCalNum:   { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.amber, letterSpacing: -0.5 },
  menuCalLabel: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  menuDesc:     { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
  menuMacros:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  macroChip:    {
    ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.textSecondary,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  dietaryRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },

  empty:      { alignItems: 'center', paddingTop: SPACING.huge },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText:  { ...FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  emptySub:   { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:   {
    backgroundColor: COLORS.base,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl, paddingTop: SPACING.md,
  },
  modalHandle:  {
    width: 40, height: 4, backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full, alignSelf: 'center', marginBottom: SPACING.xl,
  },
  modalTitle:   { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, marginBottom: SPACING.sm, letterSpacing: -0.5 },
  modalDesc:    { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 20 },

  servingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)', borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1, borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)', borderRightColor: 'rgba(255,255,255,0.65)',
  },
  servingLabel:   { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  servingControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  servingBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.raised_sm,
  },
  servingBtnText: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.baseLight, lineHeight: 20 },
  servingCount:   { ...FONTS.bold, fontSize: SIZES.lg, color: COLORS.textPrimary, minWidth: 24, textAlign: 'center' },

  modalCalRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  modalSecondaryRow: { marginTop: -SPACING.lg, marginBottom: SPACING.lg },
  modalCalBox:       { alignItems: 'center', flex: 1 },
  modalCalNum:       { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary, letterSpacing: -0.5 },
  modalSecondaryNum: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textSecondary, letterSpacing: -0.3 },
  modalCalLabel:     { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },

  allergenRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  allergenLabel: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.error },
  allergenList:  { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },

  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
});
