import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const activityAdapter = createEntityAdapter();

const initialState = activityAdapter.getInitialState({nextId: 0});

/*
each activity is:
{ 
  id: str
  name: str
  goalId: id of its goal
  dailyTarget: {
    type: str,
    params: { ... }
  },
  weeklyTarget: {
    type: str,
    params: { ... }
  }
  active: bool
  archived: bool, is marked true when the activity is "deleted"
}
*/

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    createActivity(state, action){
      activityAdapter.addOne(state, {...action.payload, id: state.nextId.toString(), active: true, archived: false})
      state.nextId += 1
    },
    updateActivity(state, action){
      activityAdapter.updateOne(state, {id: action.payload.id, changes: action.payload})
    },
    toggleActivity(state, action){
      const activityId = action.payload.id
      const newValue = !state.entities[activityId].active
      activityAdapter.updateOne(state, {id: activityId, changes: {active: newValue}})
    },
    archiveActivity(state, action){
      const activityId = action.payload
      activityAdapter.updateOne(state, {id: activityId, changes: {archived: true}})
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

export const { createActivity, updateActivity, toggleActivity, archiveActivity, setState } = activitySlice.actions

export const { 
  selectAll: selectAllActivities, selectById: selectActivityById, selectEntities: selectActivityEntities,
} = activityAdapter.getSelectors(state => state.activities)

export default activitySlice.reducer