import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  {name: 'Japanese', activated: true},
  {name: 'Beautiful garden', activated: false}
];

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    createGoal(state, action){
      state.push(action.payload)
    },
  }
})

export const { createGoal } = goalsSlice.actions

export default goalsSlice.reducer