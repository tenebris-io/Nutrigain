import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { CHATBOT_SUGGESTIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

function buildSystemPrompt(user, diningHalls, getFilteredMenuItems) {
  const STATUS_LABEL = {
    green:  'LOW WAIT (<5 min)',
    yellow: 'BUSY (10-15 min)',
    red:    'CROWDED (20+ min)',
  };

  const hallSummaries = (diningHalls || []).map((h) => {
    const items    = getFilteredMenuItems ? getFilteredMenuItems(h.id) : [];
    const byPeriod = {};
    (items || []).forEach((item) => {
      const p = item.mealPeriod || 'All Day';
      if (!byPeriod[p]) byPeriod[p] = [];
      const tags = [
        item.calories ? `${item.calories} cal` : null,
        item.protein  ? `${item.protein}g protein` : null,
        ...(item.dietary || []),
      ].filter(Boolean);
      byPeriod[p].push(`${item.name}${tags.length ? ` (${tags.join(', ')})` : ''}`);
    });

    const menuLines = Object.entries(byPeriod)
      .map(([period, names]) =>
        `    ${period}:\n${names.slice(0, 10).map((n) => `      - ${n}`).join('\n')}`
      )
      .join('\n');

    return (
      `- ${h.name} (${h.location}, ${h.distance}) -- ${STATUS_LABEL[h.status] || 'UNKNOWN'}\n` +
      `  Hours: ${h.hours}\n` +
      (menuLines ? `  Today's menu:\n${menuLines}` : '  No menu data loaded yet.')
    );
  }).join('\n\n');

  const userRestrictions = user?.dietaryRestrictions?.length
    ? `The student's dietary restrictions are: ${user.dietaryRestrictions.join(', ')}. Always respect these.`
    : 'The student has no dietary restrictions on file.';

  return `You are Graze's AI dining assistant for Ohio State University students. \
You help students find meals, understand nutrition, and navigate campus dining.

${userRestrictions}

CURRENT DINING HALL STATUS AND MENUS:
${hallSummaries || 'No dining data loaded. Advise the student to check back later.'}

Guidelines:
- Keep responses concise (2-4 sentences), friendly, and actionable.
- When listing options, use a short bulleted list (3-6 items max).
- Always flag allergens (nuts, dairy, gluten, eggs, soy) when relevant.
- Lead with crowding status when asked about wait times.
- Do not make up menu items -- only reference items present in the data above.
- If you don't have data for something, say so honestly.
- For severe allergies, always recommend speaking with a dining hall manager.`;
}

export default function ChatbotScreen() {
  const { user, diningHalls, getFilteredMenuItems } = useApp();

  const systemPrompt = useMemo(
    () => buildSystemPrompt(user, diningHalls, getFilteredMenuItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diningHalls, user?.dietaryRestrictions]
  );

  const [messages, setMessages] = useState([
    {
      id:   '0',
      role: 'assistant',
      text: `Hey ${user?.name || 'there'}! I'm your OSU dining assistant. Ask me about menu options, dietary restrictions, nutrition info, or wait times at any dining hall.`,
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const sendMessage = async (textOverride) => {
    const userText = (textOverride || input).trim();
    if (!userText || loading) return;

    setInput('');

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`, role: 'assistant', error: true,
        text: 'No API key set. Open src/screens/ChatbotScreen.js and replace YOUR_API_KEY_HERE with your Anthropic API key from console.anthropic.com.',
      }]);
      setLoading(false);
      return;
    }

    try {
      const history = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.text }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system:     systemPrompt,
          messages:   [...history, { role: 'user', content: userText }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiMsg = data?.error?.message || `API error ${response.status}`;
        throw new Error(apiMsg);
      }

      const replyText = data.content?.[0]?.text;
      if (!replyText) throw new Error('Empty response from API');

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: replyText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id:    `err-${Date.now()}`,
          role:  'assistant',
          error: true,
          text:  `Error: ${err.message || "Can't connect — check your internet and try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>G</Text>
            </View>
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
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.botAvatar}>
                  <Text style={styles.botAvatarText}>G</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubbleInner,
                  msg.role === 'user' ? styles.bubbleInnerUser : styles.bubbleInnerBot,
                  msg.error && styles.bubbleError,
                ]}
              >
                <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {loading && (
            <View style={[styles.msgRow, styles.msgRowBot]}>
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>G</Text>
              </View>
              <View style={[styles.bubbleInner, styles.bubbleInnerBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            </View>
          )}

          {/* Suggestion chips */}
          {!loading && (
            <View style={styles.chips}>
              {CHATBOT_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => sendMessage(s)}
                  activeOpacity={0.7}
                >
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
            placeholderTextColor={COLORS.textPlaceholder}
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
            <Text style={styles.sendIcon}>{'\u2191'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primaryDeep },
  flex: { flex: 1, backgroundColor: COLORS.base },

  header: {
    backgroundColor: COLORS.primaryDeep,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerInner:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  headerIcon:      {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.amber,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.raised_sm,
  },
  headerIconText:  { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.primaryDeep },
  headerInfo:      { flex: 1 },
  headerTitle:     { ...FONTS.bold, fontSize: SIZES.md, color: COLORS.amberLight },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  onlineDot:       { width: 6, height: 6, borderRadius: RADIUS.full, backgroundColor: '#4CD964' },
  headerSub:       { ...FONTS.regular, fontSize: SIZES.xs, color: 'rgba(255,255,255,0.75)' },

  messages:        { flex: 1 },
  messagesContent: { padding: SPACING.lg, gap: SPACING.md },

  msgRow:          { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  msgRowBot:       { justifyContent: 'flex-start' },
  msgRowUser:      { justifyContent: 'flex-end' },

  botAvatar:       {
    width: 30, height: 30, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2, flexShrink: 0,
    ...SHADOWS.raised_sm,
  },
  botAvatarText:   { ...FONTS.bold, fontSize: SIZES.sm, color: COLORS.baseLight },

  bubbleInner:     { maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleInnerBot:  { backgroundColor: COLORS.base, ...SHADOWS.subtle },
  bubbleInnerUser: { backgroundColor: COLORS.primary },
  bubbleError:     { backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#ffd0d0' },
  typingBubble:    { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  bubbleText:      { ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary, lineHeight: 21 },
  bubbleTextUser:  { color: COLORS.baseLight },

  chips:    {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginTop: SPACING.xs, paddingLeft: 38,
  },
  chip: {
    backgroundColor: COLORS.base,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    ...SHADOWS.raised_sm,
  },
  chipText: { ...FONTS.medium, fontSize: SIZES.sm, color: COLORS.primary },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.base,
    borderTopWidth: 0.5, borderTopColor: 'rgba(163,170,155,0.40)',
  },
  input: {
    flex: 1, minHeight: 42, maxHeight: 120,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.55)', borderLeftColor: 'rgba(163,170,155,0.55)',
    borderBottomWidth: 1, borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.65)', borderRightColor: 'rgba(255,255,255,0.65)',
    ...FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary,
  },
  sendBtn:         {
    width: 42, height: 42, borderRadius: RADIUS.full,
    backgroundColor: COLORS.amber,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.raised_sm,
  },
  sendBtnDisabled: { backgroundColor: COLORS.inputBg },
  sendIcon:        { ...FONTS.bold, fontSize: SIZES.lg, color: COLORS.primaryDeep },
});
