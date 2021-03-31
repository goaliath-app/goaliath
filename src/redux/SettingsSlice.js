import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    dayStartHour: 4 
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