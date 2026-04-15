import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

function TabIcon({ name, focused, label }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={focused ? COLORS.primary : COLORS.textSecondary} />
    </View>
  );
}

export default function Navigation() {
  const { onboardingComplete } = useApp();

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
          tabBarStyle: tabStyles.tabBar,
          tabBarLabelStyle: tabStyles.label,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="DiningTab"
          component={DiningStack}
          options={{
            tabBarLabel: 'Dining',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'restaurant' : 'restaurant-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ChatTab"
          component={ChatbotScreen}
          options={{
            tabBarLabel: 'AI Chat',
            tabBarIcon: ({ focused }) => (
              <View style={tabStyles.chatIconWrap}>
                <Ionicons name="sparkles" size={22} color={COLORS.surface} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Progress',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    ...SHADOWS.subtle,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  iconWrapActive: {
    backgroundColor: COLORS.primaryLight,
  },
  chatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...SHADOWS.medium,
  },
});
