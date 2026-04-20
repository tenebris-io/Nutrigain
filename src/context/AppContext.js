import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// Set to true once you've run `python scripts/scrape_menus.py` at least once
// and src/data/menuData.js exists.
// ─────────────────────────────────────────────────────────────────────────────
const USE_LIVE_DATA = true;

// Mock data — always available as fallback
import {
  USER_PROFILE,
  LOGGED_MEALS,
  MENU_ITEMS     as MOCK_MENU_ITEMS,
  DINING_HALLS   as MOCK_DINING_HALLS,
} from '../data/mockData';

// Live data — only imported when the flag is on and the file exists.
let LIVE_MENU_ITEMS   = null;
let LIVE_DINING_HALLS = null;
if (USE_LIVE_DATA) {
  const live = require('../data/menuData');
  LIVE_MENU_ITEMS   = live.MENU_ITEMS;
  LIVE_DINING_HALLS = live.DINING_HALLS;
}

const MENU_ITEMS   = USE_LIVE_DATA ? LIVE_MENU_ITEMS   : MOCK_MENU_ITEMS;
const DINING_HALLS = USE_LIVE_DATA ? LIVE_DINING_HALLS : MOCK_DINING_HALLS;

// ─────────────────────────────────────────────────────────────────────────────
// Tester credentials
// ─────────────────────────────────────────────────────────────────────────────
const VALID_CREDENTIALS = { 'max.1282': 'buckeye123' };

// AsyncStorage keys
const STORAGE_KEYS = {
  session:     '@nutrigain/session',
  user:        '@nutrigain/user',
  onboarding:  '@nutrigain/onboardingComplete',
  loggedMeals: '@nutrigain/loggedMeals',
};

// ─────────────────────────────────────────────────────────────────────────────

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isLoading, setIsLoading]               = useState(true);
  const [isLoggedIn, setIsLoggedIn]             = useState(false);
  const [user, setUserState]                    = useState(USER_PROFILE);
  const [loggedMeals, setLoggedMeals]           = useState(LOGGED_MEALS);
  const [diningHalls]                           = useState(DINING_HALLS);
  const [activeFilters, setActiveFilters]       = useState([]);
  const [onboardingComplete, setOnboardingState] = useState(false);

  // ── Bootstrap: load persisted state on mount ────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [sessionRaw, userRaw, onboardingRaw, mealsRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.session),
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.onboarding),
          AsyncStorage.getItem(STORAGE_KEYS.loggedMeals),
        ]);

        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.isLoggedIn) setIsLoggedIn(true);
        }
        if (userRaw) setUserState(JSON.parse(userRaw));
        if (onboardingRaw) setOnboardingState(JSON.parse(onboardingRaw));
        if (mealsRaw) setLoggedMeals(JSON.parse(mealsRaw));
      } catch (e) {
        // Ignore storage errors — app starts fresh
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Persist user profile whenever it changes (after initial load) ────────
  const setUser = async (updater) => {
    setUserState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // ── Persist onboarding flag ──────────────────────────────────────────────
  const setOnboardingComplete = async (val) => {
    setOnboardingState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(val));
    } catch (e) {}
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    if (VALID_CREDENTIALS[username] !== password) return false;
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.session,
        JSON.stringify({ isLoggedIn: true, username })
      );
    } catch (e) {}
    setIsLoggedIn(true);
    return true;
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (e) {}
    setIsLoggedIn(false);
    setOnboardingState(false);
    setUserState(USER_PROFILE);
    setLoggedMeals(LOGGED_MEALS);
  };

  // ── Meal logging ─────────────────────────────────────────────────────────
  const logMeal = (menuItem, hallName) => {
    const hour       = new Date().getHours();
    const mealPeriod = hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';

    setLoggedMeals((prev) => {
      const existingLog = prev.find(
        (l) => l.date === 'today' && l.mealPeriod === mealPeriod
      );
      let next;
      if (existingLog) {
        next = prev.map((l) =>
          l.id === existingLog.id
            ? {
                ...l,
                items: [
                  ...l.items,
                  { menuItemId: menuItem.id, name: menuItem.name, calories: menuItem.calories, hallName },
                ],
                totalCalories: l.totalCalories + menuItem.calories,
              }
            : l
        );
      } else {
        next = [
          ...prev,
          {
            id:   `log${Date.now()}`,
            date: 'today',
            mealPeriod,
            items: [{ menuItemId: menuItem.id, name: menuItem.name, calories: menuItem.calories, hallName }],
            totalCalories: menuItem.calories,
          },
        ];
      }
      AsyncStorage.setItem(STORAGE_KEYS.loggedMeals, JSON.stringify(next)).catch(() => {});
      return next;
    });

    setUser((prev) => ({
      ...prev,
      currentCalories: prev.currentCalories + menuItem.calories,
      currentProtein:  prev.currentProtein  + (menuItem.protein || 0),
      currentCarbs:    prev.currentCarbs    + (menuItem.carbs   || 0),
      currentFat:      prev.currentFat      + (menuItem.fat     || 0),
    }));
  };

  const getFilteredMenuItems = (hallId) =>
    MENU_ITEMS.filter((item) => {
      if (hallId && item.hallId !== hallId) return false;
      if (activeFilters.length === 0) return true;
      return activeFilters.every((f) => item.dietary.includes(f));
    });

  const toggleFilter = (filter) =>
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        login,
        logout,
        user,
        setUser,
        loggedMeals,
        logMeal,
        diningHalls,
        activeFilters,
        toggleFilter,
        getFilteredMenuItems,
        onboardingComplete,
        setOnboardingComplete,
        usingLiveData: USE_LIVE_DATA,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
