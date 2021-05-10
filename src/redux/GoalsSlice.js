import { createSlice, createEntityAdapter} from '@reduxjs/toolkit'

const goalsAdapter = createEntityAdapter();

const initialState = goalsAdapter.getInitialState({nextId: 0});

/*
 each goal is {
   name: str, 
   motivation: str, 
   active: bool, 
   id: str,
   archived: bool, is marked true when the goal is "deleeted"
  }
*/

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    createGoal(state, action){
      goalsAdapter.addOne(state, {...action.payload, id: state.nextId.toString(), active: true, archived: false})
      state.nextId += 1
    },
    updateGoal(state, action){
      goalsAdapter.updateOne(state, {id: action.payload.id, changes: action.payload})
    },
    toggleGoal(state, action){
      const goalId = action.payload.id
      const newValue = !state.entities[goalId].active
      goalsAdapter.updateOne(state, {id: goalId, changes: {active: newValue}})
    },
    archiveGoal(state, action){
      const goalId = action.payload
      goalsAdapter.updateOne(state, {id: goalId, changes: {archived: true}})
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

export const { createGoal, toggleGoal, updateGoal, archiveGoal, setState } = goalsSlice.actions

export const { 
  selectAll: selectAllGoals, 
  selectById: selectGoalById,
  selectEntities: selectGoalEntities,
} = goalsAdapter.getSelectors(state => state.goals)

export default goalsSlice.reducer