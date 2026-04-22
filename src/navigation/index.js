import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SPACING } from '../theme';

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
        tabBarInactiveTintColor: COLORS.inkFaint,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveBackgroundColor: COLORS.cream,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DiningTab"
        component={DiningStack}
        options={{
          tabBarLabel: 'Dining',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
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
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: { width: 100, height: 100 },

  tabBar: {
    backgroundColor: COLORS.cream,
    borderTopWidth: 3,
    borderTopColor: COLORS.ink,
    height: 80,
    paddingBottom: 14,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  label:   { ...FONTS.medium, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 1 },
  tabItem: { paddingTop: 2 },
});
