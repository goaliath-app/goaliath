import { configureStore } from '@reduxjs/toolkit'

import goalsReducer from './GoalsSlice'
import activitySlice from './ActivitySlice'
import logSlice from './LogSlice'

const store = configureStore({
  reducer: {
    goals: goalsReducer,
    activities: activitySlice,
    logs: logSlice
  }
})

export default store