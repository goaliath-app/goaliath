import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import arrayMove from 'array-move'
import { toDateTime } from '../util'

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
    id: date of the entry,
    ...all data that activity normally has in the activitySlice
  }

activityRecord store how an activity was UNTIL and INCLUDING the day of this log.
*/

const entityAdapter = createEntityAdapter();
const initialState = entityAdapter.getInitialState();

const activityRecordsSlice = createSlice({
  name: 'activityRecords',
  initialState,
  reducers: {
    addActivityRecord(state, action){
      const { activityRecord, date } = action.payload
      
      // create the activity records for this activity if they do not exist
      if(!state.entities[activityRecord.id]){

        entityAdapter.addOne(state, {
            id: activityRecord.id,
            entries: entityAdapter.getInitialState()
        })
      }

      // using custom function because activityAdapter's one wont work
      // with a newly created state
      setOne(state.entities[activityRecord.id].entries, {...activityRecord, id: toDateTime(date).toISO()})

      return state
    },

    deleteActivityRecordsByDate(state, action){
      const { date } = action.payload

      state.ids.forEach(id => {
        entityAdapter.removeOne(state.entities[id].entries, toDateTime(date).toISO())
      })
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    }
  }
})

export default activityRecordsSlice.reducer

export const { 
  addActivityRecord, deleteActivityRecordsByDate, setState,
} = activityRecordsSlice.actions


/* SELECTORS */
/* When activity records are selected, its id (a date) is reemplaced by the 
activity id, so that the record fully resembles how the activity was at the
given date. */

export function selectActivityRecordByIdAndDate(state, id, date){
  const isoDate = toDateTime(date).toISO()

  const result = state.activityRecords.entities[id]?.entries.entities[isoDate]

  if(result){
    return { ...result, id }
  }else{
    return null
  }
}

// searches for an activity record for that activity, starting from date and
// going forward in time until it finds one that matches the activity
// or the current day is reached
export function findActivityRecord(state, id, date){
  const today = getTodaySelector(state)
  
  const thatActivityRecords = state.activityRecords.entities[id]

  if(!thatActivityRecords){
    return null
  }
  while(date < today){
    const activityRecord = thatActivityRecords.entries.entities[date.toISO()]

    if(activityRecord){
      return { ...activityRecord, id }
    }

    date = date.plus({ days: 1 })
  }

  return null
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
