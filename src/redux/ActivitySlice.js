import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const activityAdapter = createEntityAdapter();

const initialState = activityAdapter.getInitialState({nextId: 0});

/*
each activity is:
{ 
  goalId: id of its goal
  name: str
  active: bool
  repeatMode: "daily" / "weekly" / "select",
  goal: "check" / "time"
  timeGoal: seconds, 
  weekDays: {'1': bool, '2': bool, '3': bool, '4': bool', 
    '5': bool, '6': bool, '7': bool'}, 
  timesPerWeek: int 
  id: str
}
*/

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    createActivity(state, action){
      activityAdapter.addOne(state, {...action.payload, id: state.nextId.toString(), active: true})
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
  }
})

export const { createActivity, updateActivity, toggleActivity } = activitySlice.actions

export const { 
  selectAll: selectAllActivities, selectById: selectActivityById 
} = activityAdapter.getSelectors(state => state.activities)

export default activitySlice.reducer