import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

const initialState = {
    dayStartHour: DateTime.fromObject({hour:0, minute:0}).toISO() 
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setDayStartHour(state, action){
            state.dayStartHour = action.payload
        },
        setState(state, action){
            const { newState } = action.payload
            return newState
        }
    }
})

export const { setDayStartHour, setState } = settingsSlice.actions

export default settingsSlice.reducer