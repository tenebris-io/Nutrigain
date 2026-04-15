# 🥦 Nutrigain

**Your Executive AI Dietician Partner**

> Campus dining, smarter. Built for Ohio State University students.

Nutrigain is a mobile app that eliminates nutritional blind spots within campus dining and reduces wait-time uncertainty. It integrates AI-driven dietary tracking, real-time hall status, a habit dashboard, and a conversational AI chatbot — all in one place.

**The Ohio State University · IBE Capstone · Spring 2026**  
*Rishi Maguluri · Varsha Viswapriyan · Landry Lies · Sujay Nalla*

---

## 📱 MVP Features

| Feature | Description |
|---|---|
| **Set & Forget Profile Sync** | Onboarding flow that captures dietary restrictions (vegan, GF, etc.) — auto-filters menus with no manual entry |
| **Color-Coded Hall Status** | 🟢🟡🔴 Real-time crowding indicators for all OSU dining halls |
| **Menu Browser** | Browse meals by hall and meal period (breakfast/lunch/dinner), filter by dietary needs, view full macros + allergens |
| **One-Tap Meal Logging** | Log any dining hall meal to track daily calorie & macro progress |
| **Habit Tracking Dashboard** | Weekly calorie/protein bar chart, streak tracking, AI-generated insights, personalized meal recommendations |
| **Swipe Balance Tracker** | Monitors meal plan swipes remaining; alerts when running low |
| **AI Chatbot** | Powered by Claude — answers natural language dining questions like *"What's vegan at Baker under 500 cal?"* |
| **Smart Alerts** | Schedule-aware notifications for nearby hall openings, low wait times, swipe balance warnings |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/go) installed on your iOS or Android device
- Or an iOS Simulator / Android Emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/nutrigain.git
cd nutrigain

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

### Running on Web

```bash
npx expo start --web
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 52) |
| Navigation | React Navigation (Bottom Tabs + Stack) |
| Fonts | Space Grotesk via @expo-google-fonts |
| State | React Context API |
| AI Chatbot | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Charts | react-native-chart-kit + react-native-svg |
| Icons | @expo/vector-icons (Ionicons) |

---

## 📁 Project Structure

```
nutrigain/
├── App.js                    # Entry point, font loading
├── app.json                  # Expo config
├── src/
│   ├── theme/
│   │   └── index.js          # Colors, fonts, spacing, shadows
│   ├── data/
│   │   └── mockData.js       # OSU dining halls, menus, weekly nutrition
│   ├── context/
│   │   └── AppContext.js     # Global state (user, meals, filters)
│   ├── components/
│   │   └── ui.js             # Button, Card, Badge, MacroBar, etc.
│   ├── navigation/
│   │   └── index.js          # Tab + Stack navigator setup
│   └── screens/
│       ├── OnboardingScreen.js   # 4-step profile setup
│       ├── HomeScreen.js         # Dashboard: calories, streak, alerts, meals
│       ├── DiningScreen.js       # All dining halls with crowding status
│       ├── DiningDetailScreen.js # Hall menu, filters, meal logging modal
│       ├── ChatbotScreen.js      # AI chatbot (Claude-powered)
│       ├── DashboardScreen.js    # Habit tracking, weekly charts, recommendations
│       └── ProfileScreen.js      # User profile, goals, dietary restrictions
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#E85D04` (warm orange) |
| Secondary | `#9D4EDD` (electric purple) |
| Background | `#FFF8F0` (warm cream) |
| Font | Space Grotesk |
| Border Radius (md) | 12px |

---

## 🤖 AI Chatbot Setup

The chatbot uses the Anthropic Claude API. In the current implementation, the API key is handled server-side (via Anthropic's proxy in the Expo environment). For production deployment, you should:

1. Create a backend API route that proxies requests to Anthropic
2. Store your `ANTHROPIC_API_KEY` in a `.env` file / server environment
3. Update `ChatbotScreen.js` to call your proxy endpoint

---

## 📊 Data

All dining hall data, menu items, and nutrition information are currently **mocked** for the OSU pilot. In production, this would be replaced with:

- **Nutrislice API** — live OSU dining menus + nutrition data
- **Occupancy sensors / swipe data** — real-time crowding estimates
- **Campus card system** — actual swipe balance
- **OSU student records** — Set & Forget profile sync (FERPA-compliant)

---

## 🗺️ Roadmap

- [ ] Live Nutrislice API integration
- [ ] Real-time crowding data pipeline
- [ ] AI meal photo scanner (vision-based nutrition identification)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] FERPA-compliant student record sync
- [ ] Gamification layer (streaks, badges, challenges)
- [ ] Big Ten university expansion

---

## 📄 License

MIT — built for academic purposes as part of OSU's Integrated Business and Engineering program.
