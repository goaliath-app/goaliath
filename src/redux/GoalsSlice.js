import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'

const goalsAdapter = createEntityAdapter();

const initialState = goalsAdapter.getInitialState({nextId: 0});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    createGoal(state, action){
      goalsAdapter.addOne(state, {...action.payload, id: state.nextId.toString()})
      state.nextId += 1
    },
  }
})

export const { createGoal } = goalsSlice.actions

export const { selectAll: selectAllGoals } = goalsAdapter.getSelectors(state => state.goals)

export default goalsSlice.reducer