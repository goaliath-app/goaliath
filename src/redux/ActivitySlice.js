import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { serializeDate, getPreviousDate, getNewestDate, deserializeDate } from '../time'
import { getTodaySelector } from './selectors'

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
    description: str, description of the activity
    goalId: id of its goal
    type: str, type of the activity
    params: { ... }, params relevant to its activity type
    active: bool, whether the activity is active or not
    archived: bool, is marked true when the activity is "deleted"
  }

Example of entry (without the id):
{
  name: 'Dummy Activity', 
  description: 'Dummy description',
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

An entry is created for an activity whenever it is created, with the current
date as the id.

Whenever an activity is modified, activated, deactivated or archived, another
entry is created with the current date as the id.

If an activity suffers multiple changes in a day, each change replaces
the existing entry for that day. This way, each day's entry holds the activity
state at the end of the day.

When you select an activity, you get the latest entry.

When you select and activity at a given date, you get the entry for that date,
of, if it does not exist, the latest entry previous to that date.

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
      if(activity.id == null || !state.entities[activity.id]){
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
      setOne(state.entities[activity.id].entries, {...activity, id: serializeDate(date)})

      return state
    },

    deleteActivityRecordsByDate(state, action){
      const { date } = action.payload

      state.ids.forEach(id => {
        entityAdapter.removeOne(state.entities[id].entries, serializeDate(date))
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
} = activitySlice.actions

export const {
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
    const activity = selectActivityById(getState(), activityId)
    const toggledActivity = {...activity, active: !activity.active}
    dispatch(setActivity(toggledActivity))
  }
}

export function archiveActivity(activityId){
  return function(dispatch, getState){
    const activity = selectActivityById(getState(), activityId)
    const archivedActivity = {...activity, archived: true}
    dispatch(setActivity(archivedActivity))
  }
}

export function restoreActivity(activityId){
  return function(dispatch, getState){
    const activity = selectActivityById(getState(), activityId)
    const restoredActivity = {...activity, archived: false}
    dispatch(setActivity(restoredActivity))
  }
}

export function changeActivityGoal(activityId, goalId){
  return function(dispatch, getState){
    const activity = selectActivityById(getState(), activityId)
    const updatedActivity = { ...activity, goalId }
    dispatch(setActivity(updatedActivity))
  }
}

// function that moves all records from the given date to the previous day,
// used when there is a day regresion caused by a dayStartHour change.
export function moveAllActivityRecordsOneDayBack(date){
  return function(dispatch, getState){
    const state = getState()

    const dateEntries = selectAllEntriesByDate(state, date)

    const previousDay = date.minus({ days: 1 })

    dateEntries.forEach(entry => {
      dispatch(setActivity(entry, previousDay))
      setActivityAction({activity: entry, date: previousDay})
    })

    dispatch(deleteActivityRecordsByDate({ date }))

  }
}

// SELECTORS
export function selectActivityByIdAndDate(state, activityId, date){
  const activityState = state.activities.entities[activityId]
  if(!activityState) return null

  const correspondingEntryDate = getPreviousDate(activityState.entries.ids, date)
  if(!correspondingEntryDate) return null

  const entry = activityState.entries.entities[serializeDate(correspondingEntryDate)]
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

// selects all entries saved on a given date. Does not search in other days
export function selectAllEntriesByDate(state, date){
  const entries = []

  state.activities.ids.forEach(id => {
    const entry = state.activities.entities[id].entries.entities[serializeDate(date)]
    if(entry) entries.push({ ...entry, id: id })
  })

  return entries
}

// returns the Luxon DateTime of the latest entry. If there are no entries,
// returns the epoch DateTime
export function selectLatestActivityEntryDate(state){
  let latestDates = []

  state.activities.ids.forEach(id => {
    const activity = state.activities.entities[id]
    const entryDates = activity.entries.ids
    latestDates.push( getNewestDate(entryDates) )
  })

  return deserializeDate(getNewestDate(latestDates))
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
