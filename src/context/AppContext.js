import React, { createContext, useContext, useState } from 'react';

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
// Keep USE_LIVE_DATA = false until scrape_menus.py has been run.
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

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser]                 = useState(USER_PROFILE);
  const [loggedMeals, setLoggedMeals]   = useState(LOGGED_MEALS);
  const [diningHalls, setDiningHalls]   = useState(DINING_HALLS);
  const [activeFilters, setActiveFilters] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const logMeal = (menuItem, hallName) => {
    const hour       = new Date().getHours();
    const mealPeriod = hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';

    const existingLog = loggedMeals.find(
      (l) => l.date === 'today' && l.mealPeriod === mealPeriod
    );

    if (existingLog) {
      setLoggedMeals((prev) =>
        prev.map((l) =>
          l.id === existingLog.id
            ? {
                ...l,
                items: [
                  ...l.items,
                  {
                    menuItemId: menuItem.id,
                    name:       menuItem.name,
                    calories:   menuItem.calories,
                    hallName,
                  },
                ],
                totalCalories: l.totalCalories + menuItem.calories,
              }
            : l
        )
      );
    } else {
      setLoggedMeals((prev) => [
        ...prev,
        {
          id:           `log${Date.now()}`,
          date:         'today',
          mealPeriod,
          items: [
            {
              menuItemId: menuItem.id,
              name:       menuItem.name,
              calories:   menuItem.calories,
              hallName,
            },
          ],
          totalCalories: menuItem.calories,
        },
      ]);
    }

    setUser((prev) => ({
      ...prev,
      currentCalories: prev.currentCalories + menuItem.calories,
      currentProtein:  prev.currentProtein  + (menuItem.protein || 0),
      currentCarbs:    prev.currentCarbs    + (menuItem.carbs   || 0),
      currentFat:      prev.currentFat      + (menuItem.fat     || 0),
    }));
  };

  const getFilteredMenuItems = (hallId) => {
    return MENU_ITEMS.filter((item) => {
      if (hallId && item.hallId !== hallId) return false;
      if (activeFilters.length === 0) return true;
      return activeFilters.every((filter) => item.dietary.includes(filter));
    });
  };

  const toggleFilter = (filter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <AppContext.Provider
      value={{
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
