import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { useApp } from '../context/AppContext';
import { fmt12, timeToMinutes } from '../utils/diningUtils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildTime24(hour, min, ampm) {
  let h = parseInt(hour, 10) || 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(parseInt(min, 10) || 0).padStart(2, '0')}`;
}

function ClassCard({ cls, onRemove }) {
  const dayStr = cls.days.join(', ');
  const timeStr = `${fmt12(cls.startTime)} – ${fmt12(cls.endTime)}`;
  return (
    <View style={styles.classCard}>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{cls.name}</Text>
        <Text style={styles.classMeta}>{dayStr}</Text>
        <Text style={styles.classMeta}>{timeStr}</Text>
        {cls.location ? <Text style={styles.classMeta}>{cls.location}</Text> : null}
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function TimeInput({ label, hour, min, ampm, onHour, onMin, onAmpm }) {
  return (
    <View style={styles.timeGroup}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeBox}
          placeholder="9"
          placeholderTextColor={COLORS.textPlaceholder}
          keyboardType="numeric"
          maxLength={2}
          value={hour}
          onChangeText={onHour}
        />
        <Text style={styles.timeColon}>:</Text>
        <TextInput
          style={styles.timeBox}
          placeholder="00"
          placeholderTextColor={COLORS.textPlaceholder}
          keyboardType="numeric"
          maxLength={2}
          value={min}
          onChangeText={onMin}
        />
        <View style={styles.ampmRow}>
          {['AM', 'PM'].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => onAmpm(p)}
              style={[styles.ampmBtn, ampm === p && styles.ampmBtnActive]}
            >
              <Text style={[styles.ampmText, ampm === p && styles.ampmTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ScheduleScreen({ navigation }) {
  const { classes, addClass, removeClass } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const [formName,     setFormName]     = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDays,     setFormDays]     = useState([]);
  const [startHour,    setStartHour]    = useState('');
  const [startMin,     setStartMin]     = useState('00');
  const [startAmPm,    setStartAmPm]    = useState('AM');
  const [endHour,      setEndHour]      = useState('');
  const [endMin,       setEndMin]       = useState('00');
  const [endAmPm,      setEndAmPm]      = useState('AM');
  const [formError,    setFormError]    = useState('');

  const toggleDay = (d) =>
    setFormDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const resetForm = () => {
    setFormName(''); setFormLocation(''); setFormDays([]);
    setStartHour(''); setStartMin('00'); setStartAmPm('AM');
    setEndHour(''); setEndMin('00'); setEndAmPm('AM');
    setFormError('');
  };

  const handleAdd = () => {
    if (!formName.trim())        return setFormError('Enter a class name.');
    if (formDays.length === 0)   return setFormError('Select at least one day.');
    if (!startHour || !endHour)  return setFormError('Enter start and end times.');

    const start = buildTime24(startHour, startMin, startAmPm);
    const end   = buildTime24(endHour, endMin, endAmPm);
    if (timeToMinutes(end) <= timeToMinutes(start)) return setFormError('End time must be after start time.');

    addClass({
      id:        `cls_${Date.now()}`,
      name:      formName.trim(),
      location:  formLocation.trim(),
      days:      formDays,
      startTime: start,
      endTime:   end,
    });
    resetForm();
    setModalVisible(false);
  };

  const sorted = [...classes].sort((a, b) => {
    const dayOrder = (c) => DAYS.indexOf(c.days[0] ?? 'Mon');
    if (dayOrder(a) !== dayOrder(b)) return dayOrder(a) - dayOrder(b);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Schedule</Text>
        <Text style={styles.subtitle}>
          {classes.length === 0 ? 'No classes added yet' : `${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No classes added</Text>
            <Text style={styles.emptySub}>
              Add your class schedule to get personalized meal timing alerts on the home screen.
            </Text>
          </View>
        ) : (
          sorted.map((cls) => (
            <ClassCard key={cls.id} cls={cls} onRemove={() => removeClass(cls.id)} />
          ))
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Add Class</Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>How alerts work</Text>
          <Text style={styles.tipBody}>
            Graze checks your class schedule and sends smart alerts on the home screen — like reminding you to grab a meal 30–90 minutes before class, or flagging a free gap between classes when a dining hall is open nearby.
          </Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Class</Text>
              <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CLASS NAME</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Biology 101"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>LOCATION (optional)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Jennings Hall 120"
                  placeholderTextColor={COLORS.textPlaceholder}
                  value={formLocation}
                  onChangeText={setFormLocation}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DAYS</Text>
                <View style={styles.dayRow}>
                  {DAYS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => toggleDay(d)}
                      style={[styles.dayChip, formDays.includes(d) && styles.dayChipActive]}
                    >
                      <Text style={[styles.dayChipText, formDays.includes(d) && styles.dayChipTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.timePair}>
                <TimeInput
                  label="START TIME"
                  hour={startHour} min={startMin} ampm={startAmPm}
                  onHour={setStartHour} onMin={setStartMin} onAmpm={setStartAmPm}
                />
                <TimeInput
                  label="END TIME"
                  hour={endHour} min={endMin} ampm={endAmPm}
                  onHour={setEndHour} onMin={setEndMin} onAmpm={setEndAmPm}
                />
              </View>

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} activeOpacity={0.85}>
                <Text style={styles.submitBtnText}>Add Class</Text>
              </TouchableOpacity>
              <View style={{ height: SPACING.xl }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.base },
  pageHeader: {
    backgroundColor: COLORS.primaryDeep,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  backBtn:  { marginBottom: SPACING.xs },
  backText: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.amberLight },
  title:    { ...FONTS.bold, fontSize: SIZES.xxxl, color: COLORS.amberLight, letterSpacing: -1 },
  subtitle: { ...FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  emptyCard: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  emptyTitle: { ...FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  emptySub:   { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  classCard: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.subtle,
  },
  classInfo:     { flex: 1 },
  className:     { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: 3 },
  classMeta:     { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 1 },
  removeBtn:     { padding: SPACING.xs, marginLeft: SPACING.md },
  removeBtnText: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textSecondary },

  addBtn: {
    height: 52,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    ...SHADOWS.subtle,
    shadowColor: '#a06414',
    shadowOpacity: 0.45,
    borderTopColor: 'rgba(255,230,140,0.60)',
    borderLeftColor: 'rgba(255,230,140,0.60)',
  },
  addBtnText: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.primaryDeep },

  tipCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tipTitle: { ...FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primaryDeep, marginBottom: SPACING.xs },
  tipBody:  { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.textBody, lineHeight: 18 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: COLORS.base,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.xl,
  },
  modalTitle: { ...FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary },
  modalClose: { ...FONTS.regular, fontSize: SIZES.lg, color: COLORS.textSecondary, padding: SPACING.xs },

  fieldGroup: { marginBottom: SPACING.lg },
  fieldLabel: {
    ...FONTS.medium, fontSize: SIZES.xs,
    color: COLORS.sectionLabel, letterSpacing: 0.5, marginBottom: SPACING.sm,
  },
  fieldInput: {
    height: 50, backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)', borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1, borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)', borderRightColor: 'rgba(255,255,255,0.65)',
    ...FONTS.regular, fontSize: SIZES.md, color: COLORS.textPrimary,
  },

  dayRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dayChip:         {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.base,
    ...SHADOWS.raised_sm,
  },
  dayChipActive:     { backgroundColor: COLORS.primary },
  dayChipText:       { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary },
  dayChipTextActive: { color: COLORS.baseLight },

  timePair:  { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  timeGroup: { flex: 1 },
  timeLabel: {
    ...FONTS.medium, fontSize: SIZES.xs,
    color: COLORS.sectionLabel, letterSpacing: 0.5, marginBottom: SPACING.sm,
  },
  timeRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  timeBox:   {
    width: 40, height: 40, backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)', borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1, borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)', borderRightColor: 'rgba(255,255,255,0.65)',
    textAlign: 'center', ...FONTS.regular,
    fontSize: SIZES.sm, color: COLORS.textPrimary,
  },
  timeColon:     { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  ampmRow:       { flexDirection: 'row', gap: 2 },
  ampmBtn:       {
    paddingHorizontal: 6, paddingVertical: 4,
    borderRadius: RADIUS.md, backgroundColor: COLORS.base,
    ...SHADOWS.raised_sm,
  },
  ampmBtnActive:   { backgroundColor: COLORS.primary },
  ampmText:        { ...FONTS.medium, fontSize: 11, color: COLORS.textSecondary },
  ampmTextActive:  { color: COLORS.baseLight },

  formError: { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.error, marginBottom: SPACING.md },

  submitBtn: {
    height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center',
    justifyContent: 'center', marginTop: SPACING.sm,
    ...SHADOWS.subtle,
    shadowColor: '#a06414',
    shadowOpacity: 0.45,
    borderTopColor: 'rgba(255,230,140,0.60)',
    borderLeftColor: 'rgba(255,230,140,0.60)',
  },
  submitBtnText: { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.primaryDeep },
});
