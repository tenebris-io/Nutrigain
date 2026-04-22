import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { Badge, Button, DietaryChip, MacroBar, CrowdingDot } from '../components/ui';
import { useApp } from '../context/AppContext';

const DIETARY_COLORS = {
  vegan: 'success', 'gluten-free': 'secondary', vegetarian: 'success',
  'high-protein': 'primary', 'dairy-free': 'warning',
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
  const items = allHallItems.filter((item) => period === 'all' || item.mealPeriod === period);

  const stationGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const key = item.category || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [items]);

  const isCollapsed  = (name) => collapsedStations[name] !== false;
  const toggleStation = (name) => setCollapsedStations((prev) => ({ ...prev, [name]: prev[name] === false }));
  const handlePeriodChange = (value) => { setPeriod(value); setCollapsedStations({}); };
  const handleSelectItem   = (item)  => { setSelected(item); setServings(1); };

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

  const statusColor = { green: COLORS.green, yellow: COLORS.warning, red: COLORS.error }[hall.status] || COLORS.inkLight;
  const statusLabel = { green: 'Open · Low wait', yellow: 'Busy · 10–15 min', red: 'Crowded · 20+ min' }[hall.status] || 'Status unknown';

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBody}>
          <Text style={styles.hallName}>{hall.name}</Text>
          <View style={styles.statusRow}>
            <CrowdingDot status={hall.status} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {/* ── Capacity ───────────────────────────────────────────── */}
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

      {/* ── Dietary filters ──────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {['vegan', 'gluten-free', 'vegetarian', 'high-protein'].map((f) => (
          <DietaryChip key={f} label={f} active={activeFilters.includes(f)} onPress={() => toggleFilter(f)} />
        ))}
      </ScrollView>

      {/* ── Meal period tabs ─────────────────────────────────────── */}
      <View style={styles.periodTabs}>
        {mealTabs.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => handlePeriodChange(t.value)}
            style={[styles.tab, period === t.value && styles.tabActive]}
          >
            <Text style={[styles.tabText, period === t.value && styles.tabTextActive]}>{t.label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Menu ─────────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
        {stationGroups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items match your filters</Text>
            <Text style={styles.emptySub}>Try adjusting your dietary filters</Text>
          </View>
        ) : (
          stationGroups.map(([station, stationItems]) => {
            const collapsed = isCollapsed(station);
            return (
              <View key={station}>
                <TouchableOpacity style={styles.stationRow} onPress={() => toggleStation(station)} activeOpacity={0.7}>
                  <Text style={styles.stationText}>{station.toUpperCase()}</Text>
                  <Text style={styles.stationChevron}>{collapsed ? '+' : '−'}</Text>
                </TouchableOpacity>

                {!collapsed && stationItems.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.menuCard} onPress={() => handleSelectItem(item)} activeOpacity={0.82}>
                    <View style={styles.menuTop}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <View style={styles.menuCalWrap}>
                        <Text style={styles.menuCalNum}>{item.calories}</Text>
                        <Text style={styles.menuCalLabel}>kcal</Text>
                      </View>
                    </View>
                    {item.description ? <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text> : null}
                    <View style={styles.menuMacros}>
                      <Text style={styles.macroChip}>P: {item.protein}g</Text>
                      <Text style={styles.macroChip}>C: {item.carbs}g</Text>
                      <Text style={styles.macroChip}>F: {item.fat}g</Text>
                      {item.sodium > 0 && <Text style={styles.macroChip}>Na: {item.sodium}mg</Text>}
                    </View>
                    {item.dietary.length > 0 && (
                      <View style={styles.dietaryRow}>
                        {item.dietary.map((d) => <Badge key={d} label={d} color={DIETARY_COLORS[d] || 'primary'} />)}
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

      {/* ── Detail modal ─────────────────────────────────────────── */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selected && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalKicker}>NUTRITION DETAILS</Text>
                <Text style={styles.modalTitle}>{selected.name}</Text>
                {selected.description && <Text style={styles.modalDesc}>{selected.description}</Text>}

                <View style={styles.servingRow}>
                  <Text style={styles.servingLabel}>SERVINGS</Text>
                  <View style={styles.servingControl}>
                    <TouchableOpacity style={styles.servingBtn} onPress={() => setServings((s) => Math.max(1, s - 1))}>
                      <Text style={styles.servingBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.servingCount}>{servings}</Text>
                    <TouchableOpacity style={styles.servingBtn} onPress={() => setServings((s) => Math.min(10, s + 1))}>
                      <Text style={styles.servingBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalCalRow}>
                  {[
                    ['Calories', Math.round(selected.calories * servings), ''],
                    ['Protein',  Math.round(selected.protein  * servings), 'g'],
                    ['Carbs',    Math.round(selected.carbs    * servings), 'g'],
                    ['Fat',      Math.round(selected.fat      * servings), 'g'],
                  ].map(([l, v, u]) => (
                    <View key={l} style={styles.modalCalBox}>
                      <Text style={styles.modalCalNum}>{v}{u}</Text>
                      <Text style={styles.modalCalLabel}>{l.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginBottom: SPACING.lg }}>
                  <MacroBar label="Protein" current={Math.round(selected.protein * servings)} goal={40} color={COLORS.primaryDeep} />
                  <MacroBar label="Carbs"   current={Math.round(selected.carbs   * servings)} goal={80} color={COLORS.inkMid} />
                  <MacroBar label="Fat"     current={Math.round(selected.fat     * servings)} goal={30} color={COLORS.amber} />
                </View>

                {selected.allergens.length > 0 && (
                  <View style={styles.allergenRow}>
                    <Text style={styles.allergenLabel}>⚠ Contains: </Text>
                    <Text style={styles.allergenList}>{selected.allergens.join(', ')}</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button label="Cancel"  variant="secondary" onPress={() => setSelected(null)} style={{ flex: 1 }} />
                  <Button label={servings > 1 ? `Log ${servings}×` : 'Log Meal'} onPress={handleLog} style={{ flex: 2 }} />
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
  container: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  backBtn:    { marginBottom: SPACING.sm },
  backText:   { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.primaryDeep, letterSpacing: 0.4, textDecorationLine: 'underline' },
  headerBody: {},
  hallName:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.xl, color: COLORS.ink, letterSpacing: -0.5 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 4 },
  statusText: { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },

  capacitySection: { backgroundColor: COLORS.white, padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  capacityRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  capacityLabel:   { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.6 },
  capacityPct:     { ...FONTS.medium, fontSize: SIZES.xs, letterSpacing: 0.4 },
  capacityBar:     { height: 3, backgroundColor: COLORS.creamDark, marginBottom: SPACING.md },
  capacityFill:    { height: '100%' },
  capacityDetails: { flexDirection: 'row', gap: SPACING.xl },
  capacityInfo:    { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },

  filterScroll: {},
  filterRow:    { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.rule },

  periodTabs:    { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.rule },
  tab:           { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  tabActive:     { borderBottomWidth: 2, borderBottomColor: COLORS.primaryDeep },
  tabText:       { ...FONTS.medium, fontSize: 9, color: COLORS.inkFaint, letterSpacing: 0.8 },
  tabTextActive: { color: COLORS.primaryDeep, ...FONTS.medium },

  menuContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  stationRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.rule, marginTop: SPACING.lg },
  stationText: { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 1.2 },
  stationChevron: { ...FONTS.medium, fontSize: SIZES.md, color: COLORS.inkLight },

  menuCard:    { backgroundColor: COLORS.white, padding: SPACING.lg, marginBottom: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.rule },
  menuTop:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  menuName:    { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, flex: 1, marginRight: SPACING.md, letterSpacing: -0.2 },
  menuCalWrap: { alignItems: 'flex-end' },
  menuCalNum:  { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xl, color: COLORS.primaryDeep, letterSpacing: -0.5 },
  menuCalLabel:{ ...FONTS.medium, fontSize: 9, color: COLORS.inkLight },
  menuDesc:    { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.inkLight, marginBottom: SPACING.sm, lineHeight: 18, fontStyle: 'italic' },
  menuMacros:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.xs },
  macroChip:   { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, backgroundColor: COLORS.creamDark, paddingHorizontal: SPACING.xs, paddingVertical: 2, letterSpacing: 0.3 },
  dietaryRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },

  empty:     { alignItems: 'center', paddingTop: SPACING.huge },
  emptyText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink },
  emptySub:  { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, marginTop: SPACING.xs, fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,26,20,0.5)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: COLORS.cream, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxxl, borderTopWidth: 3, borderTopColor: COLORS.ink },
  modalHandle:  { width: 40, height: 3, backgroundColor: COLORS.rule, alignSelf: 'center', marginBottom: SPACING.xl },
  modalKicker:  { ...FONTS.medium, fontSize: 9, color: COLORS.amberDark, letterSpacing: 1.4, marginBottom: SPACING.xs },
  modalTitle:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.xl, color: COLORS.ink, letterSpacing: -0.5, marginBottom: SPACING.xs },
  modalDesc:    { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, marginBottom: SPACING.lg, lineHeight: 20, fontStyle: 'italic' },

  servingRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.rule, paddingVertical: SPACING.md, marginBottom: SPACING.xl },
  servingLabel:   { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.inkLight, letterSpacing: 0.8 },
  servingControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  servingBtn:     { width: 30, height: 30, borderWidth: 1, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  servingBtnText: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.ink },
  servingCount:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.lg, color: COLORS.ink, minWidth: 24, textAlign: 'center' },

  modalCalRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  modalCalBox:   { alignItems: 'center', flex: 1 },
  modalCalNum:   { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xl, color: COLORS.ink, letterSpacing: -0.5 },
  modalCalLabel: { ...FONTS.medium, fontSize: 9, color: COLORS.inkLight, letterSpacing: 0.8, marginTop: 2 },

  allergenRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.amberWash },
  allergenLabel: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.amberDark },
  allergenList:  { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.inkMid },

  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
});
