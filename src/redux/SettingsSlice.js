import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import * as Localization from 'expo-localization'
import tutorialStates from '../tutorialStates'


const initialState = {
    dayStartHour: DateTime.fromObject({hour:0, minute:0}).toISO(),
    language: Localization.locale,
    tutorialState: tutorialStates.NewUser,
    dailyNotificationHour: DateTime.fromObject({hour:9, minute:0}).toISO(),
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setDayStartHour(state, action){
            state.dayStartHour = action.payload
        },
        setTutorialState(state, action){
            state.tutorialState = action.payload
        },
        setState(state, action){
            const { newState } = action.payload
            return { ...initialState, ...newState }
        },
        setLanguage(state, action) {
            state.language = action.payload
        },
        setDailyNotificationHour(state, action){
            state.dailyNotificationHour = action.payload
        }
    }
})

export const { 
    setDayStartHour, setState, setLanguage, setTutorialState, setDailyNotificationHour, 
} = settingsSlice.actions

export function selectTutorialState(state){
    return state.settings.tutorialState
}

export default settingsSlice.reducer