import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import DiningScreen from '../screens/DiningScreen';
import DiningDetailScreen from '../screens/DiningDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import { useApp } from '../context/AppContext';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Neumorphic tab button — raised when inactive, inset when active ──
function NeuTabButton({ onPress, children, accessibilityState }) {
  const focused = accessibilityState?.selected;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.tabBtn, focused && styles.tabBtnActive]}
    >
      {children}
    </TouchableOpacity>
  );
}

function DiningStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiningList" component={DiningScreen} />
      <Stack.Screen name="DiningDetail" component={DiningDetailScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="DiningDetail" component={DiningDetailScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: COLORS.primaryDeep,
        tabBarInactiveTintColor: COLORS.primaryMuted,
        tabBarButton: (props) => <NeuTabButton {...props} />,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DiningTab"
        component={DiningStack}
        options={{
          tabBarLabel: 'Dining',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isLoading, isLoggedIn, onboardingComplete } = useApp();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('../../assets/IconOnly_Transparent_NoBuffer (1).png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={COLORS.amber} style={{ marginTop: SPACING.xl }} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (!onboardingComplete) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 120,
    height: 120,
  },

  tabBar: {
    backgroundColor: COLORS.base,
    borderTopWidth: 0,
    height: 84,
    paddingBottom: 16,
    paddingTop: 8,
    paddingHorizontal: SPACING.xs,
    // Upward neumorphic shadow
    shadowColor: '#a3aa9b',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    // Top highlight edge
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.85)',
  },

  label: { ...FONTS.medium, fontSize: 10, marginTop: 2 },

  // Inactive tab item — flat (no extra shadow, bar already raised)
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  // Active tab item — inset pressed-in pill
  tabBtnActive: {
    backgroundColor: COLORS.inputBg,
    // Inset shadow: dark top-left, light bottom-right
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(163,170,155,0.65)',
    borderLeftColor: 'rgba(163,170,155,0.65)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.80)',
    borderRightColor: 'rgba(255,255,255,0.80)',
  },
});
