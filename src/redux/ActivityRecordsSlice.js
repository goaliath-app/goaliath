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

      entityAdapter.upsertOne(state.entities[activityRecord.id].entries, {...activityRecord, id: toDateTime(date).toISO()})
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
  addActivityRecord, deleteActivityRecordsByDate
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
