import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
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
  return (
    <View style={styles.classCard}>
      <View style={styles.classInfo}>
        <Text style={styles.className}>{cls.name}</Text>
        <Text style={styles.classMeta}>{cls.days.join(', ')}</Text>
        <Text style={styles.classMeta}>{fmt12(cls.startTime)} – {fmt12(cls.endTime)}</Text>
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
        <TextInput style={styles.timeBox} placeholder="9" placeholderTextColor={COLORS.inkFaint} keyboardType="numeric" maxLength={2} value={hour} onChangeText={onHour} />
        <Text style={styles.timeColon}>:</Text>
        <TextInput style={styles.timeBox} placeholder="00" placeholderTextColor={COLORS.inkFaint} keyboardType="numeric" maxLength={2} value={min} onChangeText={onMin} />
        <View style={styles.ampmRow}>
          {['AM', 'PM'].map((p) => (
            <TouchableOpacity key={p} onPress={() => onAmpm(p)} style={[styles.ampmBtn, ampm === p && styles.ampmBtnActive]}>
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
  const [modalVisible, setModalVisible]   = useState(false);
  const [formName,     setFormName]       = useState('');
  const [formLocation, setFormLocation]   = useState('');
  const [formDays,     setFormDays]       = useState([]);
  const [startHour,    setStartHour]      = useState('');
  const [startMin,     setStartMin]       = useState('00');
  const [startAmPm,    setStartAmPm]      = useState('AM');
  const [endHour,      setEndHour]        = useState('');
  const [endMin,       setEndMin]         = useState('00');
  const [endAmPm,      setEndAmPm]        = useState('AM');
  const [formError,    setFormError]      = useState('');

  const toggleDay = (d) => setFormDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const resetForm = () => {
    setFormName(''); setFormLocation(''); setFormDays([]);
    setStartHour(''); setStartMin('00'); setStartAmPm('AM');
    setEndHour(''); setEndMin('00'); setEndAmPm('AM'); setFormError('');
  };

  const handleAdd = () => {
    if (!formName.trim())       return setFormError('Enter a class name.');
    if (formDays.length === 0)  return setFormError('Select at least one day.');
    if (!startHour || !endHour) return setFormError('Enter start and end times.');
    const start = buildTime24(startHour, startMin, startAmPm);
    const end   = buildTime24(endHour, endMin, endAmPm);
    if (timeToMinutes(end) <= timeToMinutes(start)) return setFormError('End time must be after start time.');
    addClass({ id: `cls_${Date.now()}`, name: formName.trim(), location: formLocation.trim(), days: formDays, startTime: start, endTime: end });
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
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRule} />
        <Text style={styles.title}>My Schedule</Text>
        <Text style={styles.subtitle}>{classes.length === 0 ? 'No classes added yet' : `${classes.length} class${classes.length !== 1 ? 'es' : ''}`}</Text>
        <View style={styles.headerAccent} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No classes added</Text>
            <Text style={styles.emptySub}>Add your class schedule to get personalized meal timing alerts on the home screen.</Text>
          </View>
        ) : (
          sorted.map((cls) => <ClassCard key={cls.id} cls={cls} onRemove={() => removeClass(cls.id)} />)
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.80}>
          <Text style={styles.addBtnText}>+ ADD CLASS</Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Text style={styles.tipKicker}>HOW IT WORKS</Text>
          <View style={styles.tipAccent} />
          <Text style={styles.tipBody}>
            Graze checks your class schedule and sends smart alerts — like reminding you to grab a meal 30–90 minutes before class, or flagging a free gap when a dining hall is open nearby.
          </Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Class</Text>
              <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalAccent} />

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                ['CLASS NAME', formName, setFormName, 'e.g. Biology 101'],
                ['LOCATION (optional)', formLocation, setFormLocation, 'e.g. Jennings Hall 120'],
              ].map(([label, val, setter, ph]) => (
                <View key={label} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput style={styles.fieldInput} placeholder={ph} placeholderTextColor={COLORS.inkFaint} value={val} onChangeText={setter} />
                </View>
              ))}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DAYS</Text>
                <View style={styles.dayRow}>
                  {DAYS.map((d) => (
                    <TouchableOpacity key={d} onPress={() => toggleDay(d)} style={[styles.dayChip, formDays.includes(d) && styles.dayChipActive]}>
                      <Text style={[styles.dayChipText, formDays.includes(d) && styles.dayChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.timePair}>
                <TimeInput label="START TIME" hour={startHour} min={startMin} ampm={startAmPm} onHour={setStartHour} onMin={setStartMin} onAmpm={setStartAmPm} />
                <TimeInput label="END TIME"   hour={endHour}   min={endMin}   ampm={endAmPm}   onHour={setEndHour}   onMin={setEndMin}   onAmpm={setEndAmPm} />
              </View>

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} activeOpacity={0.80}>
                <Text style={styles.submitBtnText}>ADD CLASS</Text>
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
  container:  { flex: 1, backgroundColor: COLORS.cream },
  pageHeader: {
    backgroundColor: COLORS.cream,
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  backBtn:     { marginBottom: SPACING.md },
  backText:    { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.primaryDeep, letterSpacing: 0.4, textDecorationLine: 'underline' },
  headerRule:  { height: 1, backgroundColor: COLORS.rule, marginBottom: SPACING.sm },
  title:       { fontFamily: 'PlayfairDisplay_900Black', fontSize: SIZES.xxxl + 8, color: COLORS.primaryDeep, letterSpacing: -1 },
  subtitle:    { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, fontStyle: 'italic', marginTop: 2 },
  headerAccent:{ height: 2, backgroundColor: COLORS.amber, marginTop: SPACING.md },

  scroll:        { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  emptyCard:  { backgroundColor: COLORS.white, padding: SPACING.xl, borderTopWidth: 2, borderTopColor: COLORS.rule, marginBottom: SPACING.lg, alignItems: 'center' },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, marginBottom: SPACING.xs },
  emptySub:   { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkLight, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },

  classCard: { backgroundColor: COLORS.white, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 2, borderTopColor: COLORS.rule },
  classInfo:     { flex: 1 },
  className:     { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, marginBottom: 3 },
  classMeta:     { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.xs, color: COLORS.inkLight, marginTop: 1 },
  removeBtn:     { padding: SPACING.xs, marginLeft: SPACING.md },
  removeBtnText: { ...FONTS.medium, fontSize: SIZES.md, color: COLORS.inkFaint },

  addBtn:     { height: 46, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.lg, borderWidth: 1, borderColor: COLORS.primaryDeep },
  addBtnText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.cream, letterSpacing: 1.2 },

  tipCard:   { backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 2, borderTopColor: COLORS.primaryDeep },
  tipKicker: { ...FONTS.medium, fontSize: 9, color: COLORS.amberDark, letterSpacing: 1.4, marginBottom: SPACING.xs },
  tipAccent: { width: 32, height: 2, backgroundColor: COLORS.amber, marginBottom: SPACING.md },
  tipBody:   { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkMid, lineHeight: 20, fontStyle: 'italic' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,20,0.5)' },
  modalSheet:   { backgroundColor: COLORS.cream, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, maxHeight: '90%', borderTopWidth: 3, borderTopColor: COLORS.ink },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  modalTitle:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.xl, color: COLORS.ink },
  modalAccent:  { height: 2, backgroundColor: COLORS.amber, marginBottom: SPACING.xl },
  modalClose:   { ...FONTS.regular, fontSize: SIZES.lg, color: COLORS.inkLight, padding: SPACING.xs },

  fieldGroup:  { marginBottom: SPACING.lg },
  fieldLabel:  { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.8, marginBottom: SPACING.sm },
  fieldInput:  { height: 44, borderBottomWidth: 1.5, borderBottomColor: COLORS.ink, fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.md, color: COLORS.ink },

  dayRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dayChip:         { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.rule },
  dayChipActive:   { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  dayChipText:     { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.inkLight },
  dayChipTextActive: { color: COLORS.cream },

  timePair:    { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  timeGroup:   { flex: 1 },
  timeLabel:   { ...FONTS.medium, fontSize: 10, color: COLORS.inkLight, letterSpacing: 0.8, marginBottom: SPACING.sm },
  timeRow:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  timeBox:     { width: 40, height: 40, borderBottomWidth: 1.5, borderBottomColor: COLORS.ink, textAlign: 'center', fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.ink },
  timeColon:   { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink },
  ampmRow:     { flexDirection: 'row', gap: 2 },
  ampmBtn:     { paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.rule },
  ampmBtnActive:   { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  ampmText:        { ...FONTS.medium, fontSize: 11, color: COLORS.inkLight },
  ampmTextActive:  { color: COLORS.cream },

  formError:     { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.error, marginBottom: SPACING.md, fontStyle: 'italic' },
  submitBtn:     { height: 46, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
  submitBtnText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.cream, letterSpacing: 1.2 },
});
