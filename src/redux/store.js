import { configureStore } from '@reduxjs/toolkit'

import goalsReducer from './GoalsSlice'
import activitySlice from './ActivitySlice'

const store = configureStore({
  reducer: {
    goals: goalsReducer,
    activities: activitySlice,
  }
})

export default store