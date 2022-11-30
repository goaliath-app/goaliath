import { configureStore } from '@reduxjs/toolkit'
import {combineReducers} from "redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import goalsReducer from './GoalsSlice'
import activitySlice from './ActivitySlice'
import logSlice from './LogSlice'
import settingsSlice from './SettingsSlice'
import tasksSlice from './TasksSlice'
import guideSlice from './GuideSlice';

const rootReducer = combineReducers({
  goals: goalsReducer,
  activities: activitySlice,
  logs: logSlice,
  settings: settingsSlice,
  tasks: tasksSlice,
  guide: guideSlice,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  // disable serializableCheck middleware
  // non-serializable values (luxon DateTimes for example) are used in action
  // payload (but never put into the state).
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
    ImmutableStateInvariantMiddleware: { warnAfter: 500 }
  }),
  reducer: persistedReducer
})

export default store