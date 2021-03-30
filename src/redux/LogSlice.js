import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import { isActivityRunning } from '../util'
import arrayMove from 'array-move'

function compareEntries(a, b){
  if( a.completed == b.completed ){
    return 0
  }
  if( a.completed ){
    return 1
  }
  return -1
}

const logAdapter = createEntityAdapter();
const entryAdapter = createEntityAdapter();

const initialState = logAdapter.getInitialState();

/*
each log is 
  {id: Date, 
    entries: {  // the entries are managed via entryAdapter
      ids: array of ids of all entries
      entities: {
        eachEntryId: {
          id: id matching with the activity this log comes from,
          intervals: [{startDate: Date, endDate: Date}],
          completed: bool,
          archived: bool, (a log is archived if it contains information that may be useful in the future but should not be shown i.e. if the activity has been disabled after logging some time on it)
          ...data redundant to its Activity for logs of past days that
             should remain the same even if the orifinal activity changes
        }
      }
    }
  }
*/

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    createLog(state, action){
      /* create empty daily log for today
      action.payload: 
        date: a luxon DateTime from the day you want to get the logs from
      */
      const log= {
        id: action.payload.date.startOf('day').toISO(),
        entries: entryAdapter.getInitialState()
      }
      logAdapter.addOne(state, log)
    },
    addEntry(state, action){
      /* add a single entry to a daily log
      action.payload:
        date: a luxon date of the day to add a log to
        entry: the entry object to add
      */
      const { date, entry } = action.payload
      const selectedDay = state.entities[date.startOf('day').toISO()]
      entryAdapter.addOne(selectedDay.entries, entry)
    },
    upsertTodaysEntry(state, action){
      /* upsert a single entry to todays daily log
      action.payload: a entry object to be upserted*/
      const entry = action.payload
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today].entries
      entryAdapter.upsertOne(todaysLog, entry)
      //todaysLog.ids.sort((idA, idB) => {return compareEntries(todaysLog.entities[idA], todaysLog.entities[idB])})
    },
    deleteOneTodaysEntry(state, action){
      /* action.payload: id of the entry to delete */
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today].entries
      entryAdapter.removeOne(todaysLog, action.payload)
    },
    toggleCompleted(state, action){
      /* action.payload = {date: DateTime, id: logID}*/
      const { date, id } = action.payload
      const log = state.entities[date.startOf('day').toISO()].entries
      let firstCompletedIndex = 0
      for(let i = 0; i < log.ids.length; i++){
        if(log.entities[log.ids[i]].completed){
          firstCompletedIndex = i
          break
        }
      }
      const entry = log.entities[id]
      const newCompleted = !entry.completed
      entryAdapter.upsertOne(log, {...entry, completed: newCompleted})
      const newPosition = newCompleted? -1 : firstCompletedIndex
      log.ids = arrayMove(log.ids, log.ids.indexOf(id), newPosition)
    },
    startTimer(state, action){
      const id = action.payload
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today]
      for(let entry of Object.values(todaysLog.entries.entities)){
        if(isActivityRunning(entry.intervals)){
          stopActivity(entry)
        }
      }
      const activityEntry = todaysLog.entries.entities[id]
      activityEntry.intervals.push({startDate: DateTime.now().toISO()})
    },
    stopTimer(state, action){
      const id = action.payload
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today]
      const activityEntry = todaysLog.entries.entities[id]
      stopActivity(activityEntry)
    },
    sortTodayLog(state, action){
      const today = DateTime.now().startOf('day').toISO()
      const todaysLog = state.entities[today].entries
      todaysLog.ids.sort((idA, idB) => {return compareEntries(todaysLog.entities[idA], todaysLog.entities[idB])})
    }
  }
})

export const { createLog, addEntry, upsertTodaysEntry, deleteOneTodaysEntry, toggleCompleted, startTimer, stopTimer, sortTodayLog } = logSlice.actions

export const { 
  selectAll: selectAllLogs, selectById: selectLogById, selectEntities: selectLogEntities
} = logAdapter.getSelectors(state => state.logs)

export function selectTodayEntries(state){
  const entrySelectors = entryAdapter.getSelectors()
  const todayLog = state.logs.entities[DateTime.now().startOf('day').toISO()]
  if(todayLog){
    const todayEntries = entrySelectors.selectAll(todayLog.entries)
    return todayEntries
  }else{
    return []
  }
}

export function selectTodayEntryByActivityId(state, activityId){
  const todayLog = state.logs.entities[DateTime.now().startOf('day').toISO()]
  return todayLog?.entries.entities[activityId]
}

function selectEntryByActivityIdAndDate(state, activityId, date){
  const thatDaysLog = state.logs.entities[date.startOf('day').toISO()]
  return thatDaysLog?.entries.entities[activityId]
}

export function selectThisWeekEntriesByActivityId(state, activityId){
  let entries = {}
  let today = DateTime.now()
  for(let i = 0; i < 7; i++){
    const weekday = getStartOfWeekDay(today, i)
    const entry = selectEntryByActivityIdAndDate(state, activityId, weekday)
    if(entry){
      entries[i] = entry
    }
  }
  return entries
}

export default logSlice.reducer

function getStartOfWeekDay(date, weekDayNumber){
  /* date: luxon datetime
     weekDayNumber: week day from 0 (monday) to 6 (sunday)
     returns the date of the start of the specified week day of the week of date */
  const weekStart = date.startOf('week')
  return weekStart.plus({days: weekDayNumber})
}

function stopActivity(entry){
  const lastInterval = entry.intervals.slice(-1)[0]
  lastInterval.endDate = DateTime.now().toISO()
}