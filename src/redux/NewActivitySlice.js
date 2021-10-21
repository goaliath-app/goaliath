import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import arrayMove from 'array-move'
import { toISODate, getPreviousDate } from '../util'

import { getTodaySelector } from './selectors'

/*
TODOS:

1. Implement al funcionality of:
 X ActivitySlice
 X ActivityRecordsSlice
 - selectors.js
  - selectAllActiveActivities
  

 2. Changes in client code:
  - change createActivity and updateActivity calls to setActivity function of this slice
  - change toggleActivity and archiveActivity calls to use the homonymous
   functions in this slice
  - change the setStates of activities and activityRecords for this slice setState
  - remove activities and activityRecords from store, add this slice
  - selectAllActivities => this module
  - selectActivityById => this module
  - selectActivityEntities => this module
  - selectActivityByIdAndDate =>

  - remove all the logging burocracy, it is not needed anymore (the activity
    records are created automatically when the activity is changed)

*/


/* SLICE DESCRIPTION

The slice is:
  {
    ids: array of all activity ids,
    entities: { [activityId]: activityRecord }
  }

Each activity record is:
  {
    id: id of the activity it relates to,
    entries: { 
        ids: array of all entry ids (dates),
        entities: { [entryId]: entry } 
    }
  }

An entry is:
  {
    id: date of the entry, when an entry is selected it will be replaced by the activityId
    name: str, name of the activity
    goalId: id of its goal
    type: str, type of the activity
    params: { ... }, params relevant to its activity type
    active: bool, whether the activity is active or not
    archived: bool, is marked true when the activity is "deleted"
  }

An entry can also be a reference to a past entry:
  {
    id: date of the entry
    ref: date of the entry it references
  }

References are used where there is no changes in the activity from one day to the next.

Example of entry (without the id):
{
  name: 'Dummy Activity', 
  goalId: '0', 
  type: 'doFixedDays', 
  params: { 
    daysOfWeek: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
    dailyGoal: {
      type: 'doNSeconds',
      params: { 
        repetitions: 1
      }
    }
  }
  active: true,
  archived: false
}

An entry is created for an activity whenever it is created. At the start of each
subsequent day, a new reference entry is created for that thay, referencing
the latest real entry for that activity.

Whenever an activity is modified, activated, deactivated or archived, the
reference entry is replaced by a real entry with all the data of the activity.

If an activity suffers multiple changes in a day, each change replaces
the existing entry for that day. This way, each day's entry holds the activity
state at the end of the day.

*/

const entityAdapter = createEntityAdapter();
const initialState = entityAdapter.getInitialState({nextId: 0});

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivity(state, action){
      const { activity, date } = action.payload
      
      // if is a new activity, set id and create its initial state
      if(!activity.id || !state.entities[activity.id]){
        activity.id = state.nextId
        state.nextId += 1

        entityAdapter.addOne(state, {
            id: activity.id,
            entries: entityAdapter.getInitialState()
        })
      }

      // insert the activity data into the given date
      // ( using custom function because activityAdapter's one wont work
      //   with state created in the same action dispatch )
      setOne(state.entities[activity.id].entries, {...activity, id: toISODate(date)})

      return state
    },

    deleteActivityRecordsByDate(state, action){
      const { date } = action.payload

      state.ids.forEach(id => {
        entityAdapter.removeOne(state.entities[id].entries, toISODate(date))
      })
    },

    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

const { 
  setActivity: setActivityAction, 
  deleteActivityRecordsByDate, 
  setState,
} = activitySlice.actions

export default activitySlice.reducer

// THUNKS
export function setActivity(activity){
  return function(dispatch, getState){
    const today = getTodaySelector(getState())
    dispatch(setActivityAction({activity, date: today}))
  }
}

export function toggleActivity(activityId){
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state)
    const activity = selectActivityById(state, activityId)
    const toggledActivity = {...activity, active: !activity.active}
    dispatch(setActivity({toggledActivity, date: today}))
  }
}

export function archiveActivity(activityId){
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state)
    const activity = selectActivityById(state, activityId)
    const archivedActivity = {...activity, archived: true}
    dispatch(setActivity({archivedActivity, date: today}))
  }
}


// SELECTORS
export function selectActivityByIdAndDate(state, activityId, date){
  const activityState = state.activities.entities[activityId]
  if(!activityState) return null

  const correspondingEntryDate = getPreviousDate(activityState.entries.ids, date)
  if(!correspondingEntryDate) return null

  const entry = activityState.entries.entities[toISODate(correspondingEntryDate)]
  return { ...entry, id: activityId }
}

export function selectActivityById(state, activityId){
  const today = getTodaySelector(state)
  return selectActivityByIdAndDate(state, activityId, today)
}

// return a array of all activities for the given date, including disabled
// and archived ones
export function selectAllActivitiesByDate(state, date){
  const activityList = []

  state.activities.ids.forEach(id => {
    const activity = selectActivityByIdAndDate(state, id, date)
    if(activity) activityList.push(activity)
  })

  return activityList
}

export function selectAllActivities(state){
  const today = getTodaySelector(state)
  return selectAllActivitiesByDate(state, today)
}


/* UTILITY FUNCTIONS */

/* 
Adds one entity to a normalized state if it does noot exist, replaces it
otherwise. This function is needed instead of the entityAdapter CRUD operations
if you want to create a new state and perform an operation to it in the same 
redux action. entityAdapter operations do no take any effect in this case.
*/ 
function setOne(state, entity){
  if(!state.entities[entity.id]){
    state.ids.push(entity.id)
  }
  
  state.entities[entity.id] = entity
}
