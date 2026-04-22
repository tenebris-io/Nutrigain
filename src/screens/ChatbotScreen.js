import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, Image,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';
import { CHATBOT_SUGGESTIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

function buildSystemPrompt(user, diningHalls, getFilteredMenuItems) {
  const STATUS_LABEL = { green: 'LOW WAIT (<5 min)', yellow: 'BUSY (10-15 min)', red: 'CROWDED (20+ min)' };
  const hallSummaries = (diningHalls || []).map((h) => {
    const items = getFilteredMenuItems ? getFilteredMenuItems(h.id) : [];
    const byPeriod = {};
    (items || []).forEach((item) => {
      const p = item.mealPeriod || 'All Day';
      if (!byPeriod[p]) byPeriod[p] = [];
      const tags = [item.calories ? `${item.calories} cal` : null, item.protein ? `${item.protein}g protein` : null, ...(item.dietary || [])].filter(Boolean);
      byPeriod[p].push(`${item.name}${tags.length ? ` (${tags.join(', ')})` : ''}`);
    });
    const menuLines = Object.entries(byPeriod).map(([period, names]) =>
      `    ${period}:\n${names.slice(0, 10).map((n) => `      - ${n}`).join('\n')}`
    ).join('\n');
    return `- ${h.name} (${h.location}, ${h.distance}) -- ${STATUS_LABEL[h.status] || 'UNKNOWN'}\n  Hours: ${h.hours}\n${menuLines ? `  Today's menu:\n${menuLines}` : '  No menu data loaded yet.'}`;
  }).join('\n\n');

  const userRestrictions = user?.dietaryRestrictions?.length
    ? `The student's dietary restrictions are: ${user.dietaryRestrictions.join(', ')}. Always respect these.`
    : 'The student has no dietary restrictions on file.';

  return `You are Graze's AI dining assistant for Ohio State University students. You help students find meals, understand nutrition, and navigate campus dining.\n\n${userRestrictions}\n\nCURRENT DINING HALL STATUS AND MENUS:\n${hallSummaries || 'No dining data loaded.'}\n\nGuidelines:\n- Keep responses concise (2-4 sentences), friendly, and actionable.\n- When listing options, use a short bulleted list (3-6 items max).\n- Always flag allergens when relevant.\n- Lead with crowding status when asked about wait times.\n- Do not make up menu items.\n- For severe allergies, always recommend speaking with a dining hall manager.`;
}

export default function ChatbotScreen() {
  const { user, diningHalls, getFilteredMenuItems } = useApp();
  const systemPrompt = useMemo(() => buildSystemPrompt(user, diningHalls, getFilteredMenuItems), [diningHalls, user?.dietaryRestrictions]);

  const [messages, setMessages] = useState([{
    id: '0', role: 'assistant',
    text: `Hey ${user?.name || 'there'}! I'm your OSU dining assistant. Ask me about menu options, dietary restrictions, nutrition info, or wait times at any dining hall.`,
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages, loading]);

  const sendMessage = async (textOverride) => {
    const userText = (textOverride || input).trim();
    if (!userText || loading) return;
    setInput('');
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', error: true, text: 'No API key set.' }]);
      setLoading(false);
      return;
    }

    try {
      const history = messages.filter((m) => m.id !== '0').map((m) => ({ role: m.role, content: m.text }));
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, system: systemPrompt, messages: [...history, { role: 'user', content: userText }] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `API error ${response.status}`);
      const replyText = data.content?.[0]?.text;
      if (!replyText) throw new Error('Empty response');
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: replyText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', error: true, text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Image source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>AI Dining Assistant</Text>
              <View style={styles.headerStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSub}>Online · Powered by Claude</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}>
              {msg.role === 'assistant' && (
                <Image source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')} style={styles.botAvatar} resizeMode="contain" />
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot, msg.error && styles.bubbleError]}>
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>{msg.text}</Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.msgRow, styles.msgRowBot]}>
              <Image source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')} style={styles.botAvatar} resizeMode="contain" />
              <View style={[styles.bubble, styles.bubbleBot]}>
                <ActivityIndicator size="small" color={COLORS.primaryDeep} />
              </View>
            </View>
          )}

          {!loading && (
            <View style={styles.chips}>
              {CHATBOT_SUGGESTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.chip} onPress={() => sendMessage(s)} activeOpacity={0.7}>
                  <Text style={styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about menus, nutrition, wait times..."
            placeholderTextColor={COLORS.inkFaint}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.ink },
  flex: { flex: 1, backgroundColor: COLORS.cream },

  header: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.ink,
  },
  headerInner:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerLogo:      { width: 36, height: 36 },
  headerInfo:      { flex: 1 },
  headerTitle:     { fontFamily: 'PlayfairDisplay_700Bold', fontSize: SIZES.md, color: COLORS.ink, letterSpacing: -0.3 },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  onlineDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  headerSub:       { ...FONTS.regular, fontSize: SIZES.xs, color: COLORS.inkLight },

  messages:        { flex: 1 },
  messagesContent: { padding: SPACING.lg, gap: SPACING.md },

  msgRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  msgRowBot:  { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },

  botAvatar: { width: 28, height: 28, marginBottom: 2, flexShrink: 0 },

  bubble:       { maxWidth: '78%', padding: SPACING.md },
  bubbleBot:    { backgroundColor: COLORS.white, borderTopWidth: 2, borderTopColor: COLORS.ink },
  bubbleUser:   { backgroundColor: COLORS.primaryDeep },
  bubbleError:  { backgroundColor: COLORS.amberWash, borderTopColor: COLORS.amberDark },
  bubbleText:   { fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.inkMid, lineHeight: 21 },
  bubbleTextUser: { color: COLORS.cream },

  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs, paddingLeft: 38 },
  chip:     { backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.rule },
  chipText: { ...FONTS.medium, fontSize: SIZES.xs, color: COLORS.primaryDeep, letterSpacing: 0.4 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
    padding: SPACING.md, backgroundColor: COLORS.white,
    borderTopWidth: 3, borderTopColor: COLORS.ink,
  },
  input: {
    flex: 1, minHeight: 42, maxHeight: 120,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1.5, borderBottomColor: COLORS.ink,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
    fontFamily: 'SourceSerif4_400Regular', fontSize: SIZES.sm, color: COLORS.ink,
  },
  sendBtn:         { width: 42, height: 42, backgroundColor: COLORS.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.creamDark },
  sendIcon:        { ...FONTS.bold, fontSize: SIZES.lg, color: COLORS.cream },
});
