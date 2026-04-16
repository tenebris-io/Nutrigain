import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PROFILE, LOGGED_MEALS, MENU_ITEMS, DINING_HALLS } from '../data/mockData';

const AppContext = createContext();

const TODAY = new Date().toISOString().split('T')[0];

const KEYS = {
  USER: '@nutrigain/user',
  MEALS: '@nutrigain/meals',
  ONBOARDING: '@nutrigain/onboarding',
  API_KEY: '@nutrigain/api_key',
};

// Seed mock meals with today's real date and full macro data per item
const INITIAL_MEALS = LOGGED_MEALS.map((log) => ({
  ...log,
  date: TODAY,
  items: log.items.map((item) => {
    const menuItem = MENU_ITEMS.find((m) => m.id === item.menuItemId) || {};
    return { ...item, protein: menuItem.protein || 0, carbs: menuItem.carbs || 0, fat: menuItem.fat || 0 };
  }),
}));

export function AppProvider({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(USER_PROFILE);
  const [loggedMeals, setLoggedMeals] = useState(INITIAL_MEALS);
  const [diningHalls] = useState(DINING_HALLS);
  const [activeFilters, setActiveFilters] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [apiKey, setApiKeyState] = useState('');

  // ── Load persisted data on startup ──────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const [savedUser, savedMeals, savedOnboarding, savedApiKey] = await Promise.all([
          AsyncStorage.getItem(KEYS.USER),
          AsyncStorage.getItem(KEYS.MEALS),
          AsyncStorage.getItem(KEYS.ONBOARDING),
          AsyncStorage.getItem(KEYS.API_KEY),
        ]);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedMeals) {
          // Only keep meals logged today; discard prior days
          setLoggedMeals(JSON.parse(savedMeals).filter((m) => m.date === TODAY));
        }
        if (savedOnboarding !== null) setOnboardingComplete(JSON.parse(savedOnboarding));
        if (savedApiKey) setApiKeyState(savedApiKey);
      } catch (e) {
        console.warn('[Nutrigain] Storage restore failed:', e);
      } finally {
        setLoaded(true);
      }
    };
    restore();
  }, []);

  // ── Persist on change (guarded by loaded to avoid overwriting on first render) ──
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)).catch(() => {});
  }, [user, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(loggedMeals)).catch(() => {});
  }, [loggedMeals, loaded]);

  // ── Actions ─────────────────────────────────────────────────────────
  const completeOnboarding = (val) => {
    setOnboardingComplete(val);
    AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(val)).catch(() => {});
  };

  const setApiKey = (key) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    AsyncStorage.setItem(KEYS.API_KEY, trimmed).catch(() => {});
  };

  const logMeal = (menuItem, hallName) => {
    const hour = new Date().getHours();
    const period = hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';

    const entry = {
      menuItemId: menuItem.id,
      name: menuItem.name,
      calories: menuItem.calories,
      protein: menuItem.protein || 0,
      carbs: menuItem.carbs || 0,
      fat: menuItem.fat || 0,
      hallName,
    };

    setLoggedMeals((prev) => {
      const existing = prev.find((l) => l.date === TODAY && l.mealPeriod === period);
      if (existing) {
        return prev.map((l) =>
          l.id === existing.id
            ? { ...l, items: [...l.items, entry], totalCalories: l.totalCalories + menuItem.calories }
            : l
        );
      }
      return [
        ...prev,
        { id: `log${Date.now()}`, date: TODAY, mealPeriod: period, items: [entry], totalCalories: menuItem.calories },
      ];
    });

    setUser((prev) => ({
      ...prev,
      currentCalories: prev.currentCalories + menuItem.calories,
      currentProtein: prev.currentProtein + (menuItem.protein || 0),
      currentCarbs: prev.currentCarbs + (menuItem.carbs || 0),
      currentFat: prev.currentFat + (menuItem.fat || 0),
    }));
  };

  const removeMeal = (logId, itemIndex) => {
    setLoggedMeals((prev) => {
      const log = prev.find((l) => l.id === logId);
      if (!log) return prev;
      const item = log.items[itemIndex];
      if (!item) return prev;

      setUser((u) => ({
        ...u,
        currentCalories: Math.max(0, u.currentCalories - item.calories),
        currentProtein: Math.max(0, u.currentProtein - (item.protein || 0)),
        currentCarbs: Math.max(0, u.currentCarbs - (item.carbs || 0)),
        currentFat: Math.max(0, u.currentFat - (item.fat || 0)),
      }));

      const newItems = log.items.filter((_, i) => i !== itemIndex);
      if (newItems.length === 0) return prev.filter((l) => l.id !== logId);
      return prev.map((l) =>
        l.id === logId
          ? { ...l, items: newItems, totalCalories: Math.max(0, l.totalCalories - item.calories) }
          : l
      );
    });
  };

  const getFilteredMenuItems = (hallId) =>
    MENU_ITEMS.filter((item) => {
      if (hallId && item.hallId !== hallId) return false;
      if (activeFilters.length === 0) return true;
      return activeFilters.every((f) => item.dietary.includes(f));
    });

  const toggleFilter = (filter) =>
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));

  return (
    <AppContext.Provider
      value={{
        loaded,
        user,
        setUser,
        loggedMeals,
        logMeal,
        removeMeal,
        diningHalls,
        activeFilters,
        toggleFilter,
        getFilteredMenuItems,
        onboardingComplete,
        setOnboardingComplete: completeOnboarding,
        apiKey,
        setApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
