import { configureStore } from '@reduxjs/toolkit'

import goalsReducer from './GoalsSlice'
import activitySlice from './ActivitySlice'
import dailyLogSlice from './DailyLogSlice'

const store = configureStore({
  reducer: {
    goals: goalsReducer,
    activities: activitySlice,
    dailyLogs: dailyLogSlice
  }
})

export default store