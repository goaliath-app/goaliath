import { createSlice } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'

const initialState = {
    dayStartHour: DateTime.fromObject({hour:4, minute:0}).toISO() 
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setDayStartHour(state, action){
            state.dayStartHour = action.payload
        }
    }
})

export const { setDayStartHour } = settingsSlice.actions

export default settingsSlice.reducer