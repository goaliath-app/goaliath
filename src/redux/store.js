import { configureStore } from '@reduxjs/toolkit'

import goalsReducer from './GoalsSlice'

const store = configureStore({
  reducer: {
    goals: goalsReducer,
  }
})

export default store