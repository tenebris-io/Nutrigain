import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { CHATBOT_SUGGESTIONS, MENU_ITEMS, DINING_HALLS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const SYSTEM_PROMPT = `You are Nutrigain's AI dining assistant for Ohio State University students. You help students find meals, understand nutrition, and navigate campus dining.

You have access to the following OSU dining halls:
- Baker Hall (South Campus, 0.3 mi) — Status: GREEN (low wait < 5 min)
- Scott House (North Campus, 0.6 mi) — Status: YELLOW (busy, 10-15 min wait)
- Morrill Tower (South Campus, 0.4 mi) — Status: RED (crowded, 20+ min)
- Traditions (West Campus, 0.9 mi) — Status: GREEN (low wait < 5 min)

Available menu items today include options like Grilled Chicken Bowl (420 cal, 38g protein), Vegan Lentil Soup (210 cal, vegan/GF), Classic Caesar Salad (320 cal, vegetarian), Blueberry Acai Bowl (380 cal, vegan/GF), Scrambled Eggs & Toast (350 cal), Turkey Avocado Wrap (510 cal), Pasta Marinara (480 cal, vegetarian), Tofu Stir Fry (340 cal, vegan), Salmon with Quinoa (520 cal, GF), Veggie Burger (440 cal, vegan), Beef Taco Bowl (580 cal), GF Protein Pancakes (310 cal, GF), Greek Yogurt Parfait (260 cal, vegetarian/GF).

Keep responses concise (2-3 sentences max), friendly, and actionable. Format nutrition data clearly when asked. Use emojis sparingly but effectively. If asked about crowding, always lead with the hall status. If asked about dietary restrictions, always call out allergens.`;

export default function ChatbotScreen() {
  const { user } = useApp();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: `Hey ${user.name}! 👋 I'm your campus dining AI. Ask me about menu options, nutrition info, wait times, or anything dining-related. What can I help you find today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.text }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            ...history,
            { role: 'user', content: userText },
          ],
        }),
      });

      const data = await response.json();
      const replyText = data.content?.[0]?.text || "I'm having trouble connecting right now. Try again in a moment!";

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: "Sorry, I can't connect right now. Check your internet and try again! 📡",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>🤖</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>AI Dining Assistant</Text>
          <View style={styles.headerStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSub}>Online · Powered by Claude</Text>
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
          <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
            {msg.role === 'assistant' && (
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>N</Text>
              </View>
            )}
            <View style={[styles.bubbleInner, msg.role === 'user' ? styles.bubbleInnerUser : styles.bubbleInnerBot]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>{msg.text}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.bubbleBot]}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>N</Text>
            </View>
            <View style={styles.bubbleInnerBot}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestScroll} contentContainerStyle={styles.suggestRow}>
          {CHATBOT_SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} onPress={() => sendMessage(s)} style={styles.suggestChip}>
              <Text style={styles.suggestText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about menus, nutrition, wait times..."
          placeholderTextColor={COLORS.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={300}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.xl, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondaryLight, alignItems: 'center', justifyContent: 'center',
  },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: SIZES.md, color: COLORS.textPrimary },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  onlineDot: { width: 7, height: 7, borderRadius: RADIUS.full, backgroundColor: COLORS.success },
  headerSub: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary },
  messages: { flex: 1 },
  messagesContent: { padding: SPACING.xl, gap: SPACING.lg },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  bubbleUser: { flexDirection: 'row-reverse' },
  bubbleBot: {},
  botAvatar: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  botAvatarText: { fontFamily: FONTS.bold, fontSize: SIZES.sm, color: COLORS.surface },
  bubbleInner: { maxWidth: '78%', borderRadius: RADIUS.md, padding: SPACING.lg },
  bubbleInnerBot: { backgroundColor: COLORS.surface, ...SHADOWS.subtle },
  bubbleInnerUser: { backgroundColor: COLORS.primary },
  bubbleText: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary, lineHeight: 22 },
  bubbleTextUser: { color: COLORS.surface },
  suggestScroll: { maxHeight: 50, borderTopWidth: 1, borderTopColor: COLORS.border },
  suggestRow: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, gap: SPACING.sm },
  suggestChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.subtle,
  },
  suggestText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.primary, whiteSpace: 'nowrap' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.md,
    padding: SPACING.lg, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
  sendIcon: { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.surface },
});
