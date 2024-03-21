import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import * as Localization from 'expo-localization'
import tutorialStates from '../tutorialStates'
import { serializeDate } from '../time'


const initialState = {
    dayStartHour: serializeDate(DateTime.fromObject({hour:0, minute:0})),
    language: Localization.locale,

    // we are skipping the old tutorial for now
    tutorialState: tutorialStates.Finished,  
    
    dailyNotificationHour: serializeDate(DateTime.fromObject({hour:9, minute:0})),
    darkTheme: false,
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
        },
        setDarkTheme(state, action){
            state.darkTheme = action.payload
        },
    }
})

export const { 
    setDayStartHour, setState, setLanguage, setTutorialState, setDailyNotificationHour, setDarkTheme,
} = settingsSlice.actions

export function selectTutorialState(state){
    return state.settings.tutorialState
}

export function selectDarkTheme(state){
    return state.settings.darkTheme
}

export default settingsSlice.reducer