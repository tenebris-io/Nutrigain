import React, { createContext, useContext, useState } from 'react';
import { USER_PROFILE, LOGGED_MEALS, MENU_ITEMS, DINING_HALLS } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(USER_PROFILE);
  const [loggedMeals, setLoggedMeals] = useState(LOGGED_MEALS);
  const [diningHalls, setDiningHalls] = useState(DINING_HALLS);
  const [activeFilters, setActiveFilters] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const logMeal = (menuItem, hallName) => {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
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
                items: [...l.items, { menuItemId: menuItem.id, name: menuItem.name, calories: menuItem.calories, hallName }],
                totalCalories: l.totalCalories + menuItem.calories,
              }
            : l
        )
      );
    } else {
      setLoggedMeals((prev) => [
        ...prev,
        {
          id: `log${Date.now()}`,
          date: 'today',
          mealPeriod,
          items: [{ menuItemId: menuItem.id, name: menuItem.name, calories: menuItem.calories, hallName }],
          totalCalories: menuItem.calories,
        },
      ]);
    }

    setUser((prev) => ({
      ...prev,
      currentCalories: prev.currentCalories + menuItem.calories,
      currentProtein: prev.currentProtein + menuItem.protein,
      currentCarbs: prev.currentCarbs + menuItem.carbs,
      currentFat: prev.currentFat + menuItem.fat,
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
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
