import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'

const goalsAdapter = createEntityAdapter();

const initialState = goalsAdapter.getInitialState({nextId: 0});

// each goal is {name: str, motivation: str, activated: bool}

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    createGoal(state, action){
      goalsAdapter.addOne(state, {...action.payload, id: state.nextId.toString(), activated: true})
      state.nextId += 1
    },
    toggleGoal(state, action){
      const goalId = action.payload.id
      const newValue = !state.entities[goalId].activated
      goalsAdapter.updateOne(state, {id: goalId, changes: {activated: newValue}})
    }
  }
})

export const { createGoal, toggleGoal } = goalsSlice.actions

export const { selectAll: selectAllGoals } = goalsAdapter.getSelectors(state => state.goals)

export default goalsSlice.reducer