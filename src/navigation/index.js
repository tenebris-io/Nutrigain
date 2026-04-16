import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import DiningScreen from '../screens/DiningScreen';
import DiningDetailScreen from '../screens/DiningDetailScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { onboardingComplete, loaded } = useApp();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
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
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.label,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: '#8E8E93',
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="DiningTab"
          component={DiningStack}
          options={{
            tabBarLabel: 'Dining',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ChatTab"
          component={ChatbotScreen}
          options={{
            tabBarLabel: 'AI Chat',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Progress',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 0.5,
    height: 82,
    paddingBottom: 18,
    paddingTop: 10,
    ...SHADOWS.subtle,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
