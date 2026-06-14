import { useCallback, useEffect, useState } from 'react'

import { PlanContext } from './planContext'

const STORAGE_KEY = 'g8_visit_plan'

function readStoredPlan() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return {
      foodItems: Array.isArray(stored?.foodItems) ? stored.foodItems : [],
      activities: Array.isArray(stored?.activities) ? stored.activities : [],
      visit: stored?.visit || null,
    }
  } catch {
    return { foodItems: [], activities: [], visit: null }
  }
}

export function PlanProvider({ children }) {
  const [plan, setPlan] = useState(readStoredPlan)
  const setVisit = useCallback((visit) => setPlan((current) => ({ ...current, visit })), [])
  const clearVisit = useCallback(() => setPlan((current) => ({ ...current, visit: null })), [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
    } catch {
      // Keep the plan usable for the current session when storage is unavailable.
    }
  }, [plan])

  const changeFoodQuantity = (item, delta) => {
    setPlan((current) => {
      const existing = current.foodItems.find((entry) => entry.id === item.id)
      const foodItems = existing
        ? current.foodItems
          .map((entry) => entry.id === item.id
            ? { ...entry, quantity: entry.quantity + delta }
            : entry)
          .filter((entry) => entry.quantity > 0)
        : delta > 0
          ? [...current.foodItems, { ...item, quantity: 1 }]
          : current.foodItems

      return { ...current, foodItems }
    })
  }

  const addActivity = (activity) => {
    setPlan((current) => current.activities.some((entry) => entry.id === activity.id)
      ? current
      : { ...current, activities: [...current.activities, activity] })
  }

  const removeActivity = (activityId) => {
    setPlan((current) => ({
      ...current,
      activities: current.activities.filter((activity) => activity.id !== activityId),
    }))
  }

  const foodCount = plan.foodItems.reduce((total, item) => total + item.quantity, 0)
  const foodTotal = plan.foodItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const value = {
    ...plan,
    foodCount,
    foodTotal,
    planCount: foodCount + plan.activities.length,
    changeFoodQuantity,
    addActivity,
    removeActivity,
    setVisit,
    clearVisit,
    clearFood: () => setPlan((current) => ({ ...current, foodItems: [] })),
    clearActivities: () => setPlan((current) => ({ ...current, activities: [] })),
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
