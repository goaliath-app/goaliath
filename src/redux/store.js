import { configureStore } from '@reduxjs/toolkit'
import {combineReducers} from "redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from 'redux-persist/lib/storage'
import { persistReducer } from 'redux-persist'
import goalsReducer from './GoalsSlice'
import activitySlice from './ActivitySlice'
import logSlice from './LogSlice'
import settingsSlice from './SettingsSlice'

const rootReducer = combineReducers({
  goals: goalsReducer,
  activities: activitySlice,
  logs: logSlice,
  settings: settingsSlice,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer
})

export default store