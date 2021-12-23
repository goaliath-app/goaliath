import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import * as Localization from 'expo-localization'


const initialState = {
    dayStartHour: DateTime.fromObject({hour:0, minute:0}).toISO(),
    newUser: true,
    language: Localization.locale,
    /* 
    Tutorial States: 
        TodayScreenIntroduction 
        GoalsScreenIntroduction 
        FirstGoalCreation 
        AfterFirstGoalCreation 
        GoalScreenIntroduction
        ActivitiesInTodayScreen 
        ChooseWeekliesIntroduction 
        OneTimeTasksIntroduction 
        TutorialEnding 
        Finished 
    */
    tutorialState: 'TodayScreenIntroduction',
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
        finishOnboarding(state, action){
            state.newUser = false
        },
        setLanguage(state, action) {
            state.language = action.payload
        }
    }
})

export const { 
    setDayStartHour, setState, finishOnboarding, setLanguage, setTutorialState 
} = settingsSlice.actions

export function selectTutorialState(state){
    return state.settings.tutorialState
}

export default settingsSlice.reducer