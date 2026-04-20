import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayISO } from '../utils/diningUtils';

const USE_LIVE_DATA = true;

import {
  USER_PROFILE,
  LOGGED_MEALS,
  MENU_ITEMS     as MOCK_MENU_ITEMS,
  DINING_HALLS   as MOCK_DINING_HALLS,
} from '../data/mockData';

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
const VALID_CREDENTIALS = { 'max.1282': 'buckeye123' };

const MEAL_PLAN_SWIPES = { 'Grey 10': 10, 'Scarlet 14': 14, 'Buckeye Unlimited': 999 };

// Bump this when stored data needs a one-time migration on next boot
const CURRENT_SCHEMA = 2;

const STORAGE_KEYS = {
  schema:      '@nutrigain/schema',
  session:     '@nutrigain/session',
  user:        '@nutrigain/user',
  onboarding:  '@nutrigain/onboardingComplete',
  loggedMeals: '@nutrigain/loggedMeals',
  weeklyData:  '@nutrigain/weeklyData',
  lastLogDate: '@nutrigain/lastLogDate',
  classes:     '@nutrigain/classes',
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
  const [weeklyData, setWeeklyData]             = useState({});
  const [classes, setClasses]                   = useState([]);

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [schemaRaw, sessionRaw, userRaw, onboardingRaw, mealsRaw, weeklyRaw, lastDateRaw, classesRaw] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.schema),
            AsyncStorage.getItem(STORAGE_KEYS.session),
            AsyncStorage.getItem(STORAGE_KEYS.user),
            AsyncStorage.getItem(STORAGE_KEYS.onboarding),
            AsyncStorage.getItem(STORAGE_KEYS.loggedMeals),
            AsyncStorage.getItem(STORAGE_KEYS.weeklyData),
            AsyncStorage.getItem(STORAGE_KEYS.lastLogDate),
            AsyncStorage.getItem(STORAGE_KEYS.classes),
          ]);

        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.isLoggedIn) setIsLoggedIn(true);
        }

        let loadedUser    = userRaw    ? JSON.parse(userRaw)    : { ...USER_PROFILE };
        let loadedWeekly  = weeklyRaw  ? JSON.parse(weeklyRaw)  : {};
        let loadedMeals   = mealsRaw   ? JSON.parse(mealsRaw)   : [];
        const lastLogDate = lastDateRaw || null;
        const today       = todayISO();
        const storedSchema = schemaRaw ? parseInt(schemaRaw, 10) : 0;

        // ── Schema migration ──────────────────────────────────────────────
        // v0/v1 → v2: wipe stale mock daily totals and streak that were
        // persisted before these fields were zeroed out in mockData.js
        if (storedSchema < CURRENT_SCHEMA) {
          loadedUser = {
            ...loadedUser,
            currentCalories: 0,
            currentProtein:  0,
            currentCarbs:    0,
            currentFat:      0,
            streak:          0,
          };
          loadedMeals = [];
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.schema, String(CURRENT_SCHEMA)),
            AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(loadedUser)),
            AsyncStorage.setItem(STORAGE_KEYS.loggedMeals, JSON.stringify([])),
          ]);
        }

        // ── Daily rollover ────────────────────────────────────────────────
        if (lastLogDate && lastLogDate !== today) {
          // Archive the last active day's totals
          loadedWeekly[lastLogDate] = {
            calories: loadedUser.currentCalories || 0,
            protein:  loadedUser.currentProtein  || 0,
            carbs:    loadedUser.currentCarbs    || 0,
            fat:      loadedUser.currentFat      || 0,
          };

          // How many calendar days have passed since we last opened the app?
          const daysDiff = Math.round(
            (new Date(today) - new Date(lastLogDate)) / (1000 * 60 * 60 * 24)
          );

          // Streak continues only if exactly 1 day passed AND user logged yesterday
          const loggedYesterday = (loadedWeekly[lastLogDate]?.calories || 0) > 0;
          const newStreak =
            daysDiff === 1 && loggedYesterday
              ? (loadedUser.streak || 0) + 1
              : 0;

          loadedUser = {
            ...loadedUser,
            streak:          newStreak,
            currentCalories: 0,
            currentProtein:  0,
            currentCarbs:    0,
            currentFat:      0,
          };
          loadedMeals = [];
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.weeklyData, JSON.stringify(loadedWeekly)),
            AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(loadedUser)),
            AsyncStorage.setItem(STORAGE_KEYS.loggedMeals, JSON.stringify([])),
          ]);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.lastLogDate, today);

        if (onboardingRaw) setOnboardingState(JSON.parse(onboardingRaw));
        if (classesRaw)    setClasses(JSON.parse(classesRaw));
        setUserState(loadedUser);
        setLoggedMeals(loadedMeals);
        setWeeklyData(loadedWeekly);
      } catch (e) {
        // Start fresh on storage errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Persist user ─────────────────────────────────────────────────────────
  const setUser = (updater) => {
    setUserState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // ── Onboarding ───────────────────────────────────────────────────────────
  const setOnboardingComplete = async (val) => {
    setOnboardingState(val);
    try { await AsyncStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(val)); } catch (e) {}
  };

  // ── Login / logout ───────────────────────────────────────────────────────
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

  const logout = async () => {
    try { await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS)); } catch (e) {}
    setIsLoggedIn(false);
    setOnboardingState(false);
    setUserState({ ...USER_PROFILE });
    setLoggedMeals([]);
    setWeeklyData({});
    setClasses([]);
  };

  // ── Meal logging ─────────────────────────────────────────────────────────
  const logMeal = (menuItem, hallName) => {
    const hour       = new Date().getHours();
    const mealPeriod = hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';

    setLoggedMeals((prev) => {
      const existingLog = prev.find(
        (l) => l.date === 'today' && l.mealPeriod === mealPeriod
      );
      const newEntry = {
        menuItemId: menuItem.id,
        name:       menuItem.name,
        calories:   menuItem.calories || 0,
        protein:    menuItem.protein  || 0,
        carbs:      menuItem.carbs    || 0,
        fat:        menuItem.fat      || 0,
        hallName,
      };
      let next;
      if (existingLog) {
        next = prev.map((l) =>
          l.id === existingLog.id
            ? { ...l, items: [...l.items, newEntry], totalCalories: l.totalCalories + newEntry.calories }
            : l
        );
      } else {
        next = [...prev, {
          id: `log${Date.now()}`, date: 'today', mealPeriod,
          items: [newEntry],
          totalCalories: newEntry.calories,
        }];
      }
      AsyncStorage.setItem(STORAGE_KEYS.loggedMeals, JSON.stringify(next)).catch(() => {});
      return next;
    });

    setUser((prev) => ({
      ...prev,
      currentCalories: (prev.currentCalories || 0) + (menuItem.calories || 0),
      currentProtein:  (prev.currentProtein  || 0) + (menuItem.protein  || 0),
      currentCarbs:    (prev.currentCarbs    || 0) + (menuItem.carbs    || 0),
      currentFat:      (prev.currentFat      || 0) + (menuItem.fat      || 0),
    }));
  };

  // ── Remove a single item from a logged meal ───────────────────────────────
  const removeMealItem = (logId, itemIndex) => {
    setLoggedMeals((prev) => {
      const log = prev.find((l) => l.id === logId);
      if (!log) return prev;
      const item = log.items[itemIndex];
      if (!item) return prev;

      setUser((u) => ({
        ...u,
        currentCalories: Math.max(0, (u.currentCalories || 0) - item.calories),
        currentProtein:  Math.max(0, (u.currentProtein  || 0) - (item.protein || 0)),
        currentCarbs:    Math.max(0, (u.currentCarbs    || 0) - (item.carbs   || 0)),
        currentFat:      Math.max(0, (u.currentFat      || 0) - (item.fat     || 0)),
      }));

      const newItems = log.items.filter((_, i) => i !== itemIndex);
      const next = newItems.length === 0
        ? prev.filter((l) => l.id !== logId)
        : prev.map((l) => l.id === logId
            ? { ...l, items: newItems, totalCalories: Math.max(0, l.totalCalories - item.calories) }
            : l
          );
      AsyncStorage.setItem(STORAGE_KEYS.loggedMeals, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // ── Swipe balance ────────────────────────────────────────────────────────
  const setSwipes = (remaining) => {
    setUser((prev) => ({ ...prev, swipesRemaining: Math.max(0, remaining) }));
  };

  // ── Class schedule ───────────────────────────────────────────────────────
  const addClass = (cls) => {
    setClasses((prev) => {
      const next = [...prev, cls];
      AsyncStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const removeClass = (id) => {
    setClasses((prev) => {
      const next = prev.filter((c) => c.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // ── Menu filtering ────────────────────────────────────────────────────────
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
        setSwipes,
        loggedMeals,
        logMeal,
        removeMealItem,
        diningHalls,
        activeFilters,
        toggleFilter,
        getFilteredMenuItems,
        onboardingComplete,
        setOnboardingComplete,
        weeklyData,
        classes,
        addClass,
        removeClass,
        usingLiveData: USE_LIVE_DATA,
        MEAL_PLAN_SWIPES,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
