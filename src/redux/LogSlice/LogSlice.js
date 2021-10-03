import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import { isActivityRunning, startOfWeek, getTodaySelector } from '../../util'
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

/* SLICE DESCRIPTION

The slice is:
  {
    ids: array of all log ids,
    entities: { [logId]: log }
  }

Each log is:
  {
    id: Date,
    weekliesSelected: defaults to false, true daily selection of weekly activities has been done
    entries: { 
      ids: array of all entry ids, 
      entities: { [entryId]: entry } 
    }
  }

An entry is:
  {
    id: id matching with the activity this log comes from
    intervals: [{startDate: Date, endDate: Date}],
    completed: bool,
    archived: bool, (a log is archived if it contains information that may be useful in the future but should not be shown i.e. if the activity has been disabled after logging some time on it)
    ...other data specific to the activity type, like repetitions for doNTimes and doNTimesEachWeek
  }

*/

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    /* All reducer's date payloads are expected to be a luxon DateTime 
    from the natural beggining of a day (i.e. hour 00:00:00) */
    createLog(state, action){
      /* create empty daily log for the specified date */
      const { date } = action.payload
      const log= {
        id: date.toISO(),
        weekliesSelected: false,
        entries: entryAdapter.getInitialState(),
      }
      logAdapter.addOne(state, log)
    },
    setWeekliesSelected(state, action){
      const { date, value } = action.payload
      const selectedDay = state.entities[date.toISO()]
      selectedDay.weekliesSelected = value
    },
    addEntry(state, action){
      /* add a single entry to a daily log */
      const { date, entry } = action.payload
      const selectedDay = state.entities[date.toISO()]
      entryAdapter.addOne(selectedDay.entries, entry)
    },
    upsertEntry(state, action){
      const { date, entry } = action.payload
      const day = date.toISO()
      const dayLog = state.entities[day].entries
      entryAdapter.upsertOne(dayLog, entry)
    },
    replaceEntry(state, action){
      const { date, entry } = action.payload
      const day = date.toISO()
      const dayLog = state.entities[day].entries.entities
      dayLog[entry.id] = entry
    },
    deleteEntry(state, action){
      const { date, entryId } = action.payload
      const today = date.toISO()
      const todaysLog = state.entities[today].entries
      entryAdapter.removeOne(todaysLog, entryId)
    },
    toggleCompleted(state, action){
      const { date, id } = action.payload
      const log = state.entities[date.toISO()].entries
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
      const { date, id } = action.payload
      const today = date.toISO()
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
      const { date, id } = action.payload
      const today = date.toISO()
      const todaysLog = state.entities[today]
      const activityEntry = todaysLog.entries.entities[id]
      stopActivity(activityEntry)
    },
    sortLog(state, action){
      const { date } = action.payload
      const today = date.toISO()
      const todaysLog = state.entities[today].entries
      todaysLog.ids.sort((idA, idB) => {return compareEntries(todaysLog.entities[idA], todaysLog.entities[idB])})
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    },
    deleteLog(state, action){
      const { isoDate } = action.payload
      logAdapter.removeOne(state, isoDate)
    },
    capAllTimers(state, action){
      const { isoDate, capIsoDate } = action.payload
      const log = state.entities[isoDate]
      const entries = log.entries.entities

      for(let entryId in entries){
        const entry = entries[entryId]

        // remove all open intrevals that start past the cap date
        entry.intervals = entry.intervals.filter((interval => (
          interval.endDate ||
          DateTime.fromISO(interval.startDate) < DateTime.fromISO(capIsoDate)
        )))

        // set open interval's endDate to capIsoDate
        entry.intervals = entry.intervals.map((interval) => (
          interval.endDate?
            interval
          :
            {...interval, endDate: capIsoDate}
        ))
      }
    }
  }
})

export const { 
  createLog, addEntry, deleteEntry, toggleCompleted, startTimer, 
  stopTimer, sortLog, upsertEntry, setState, deleteLog, replaceEntry,
  capAllTimers, setWeekliesSelected, 
} = logSlice.actions

export const { 
  selectAll: selectAllLogs, selectById: selectLogById, selectEntities: selectLogEntities
} = logAdapter.getSelectors(state => state.logs)

export function selectEntriesByDay(state, day){
  const thatDayLog = selectLogById(state, day.toISO())
  const entrySelectors = entryAdapter.getSelectors()
  if(thatDayLog){
    const todayEntries = entrySelectors.selectAll(thatDayLog.entries)
    return todayEntries
  }else{
    return []
  }
}

export function selectEntryByActivityIdAndDate(state, activityId, date){
  const { dayStartHour } = state.settings
  const thatDaysLog = state.logs.entities[date.toISO()]
  return thatDaysLog?.entries.entities[activityId]
}

export function selectAllWeekEntriesByActivityId(state, activityId, date){
  // date can be any moment of the week
  const { dayStartHour } = state.settings
  let entries = {}
  for(let i = 0; i < 7; i++){
    const weekday = getStartOfWeekDay(date, i, dayStartHour)
    const entry = selectEntryByActivityIdAndDate(state, activityId, weekday)
    if(entry){
      entries[i] = entry
    }
  }
  return entries
}

export function selectThisWeekEntriesByActivityId(state, activityId){
  selectAllWeekEntriesByActivityId(state, activityId, DateTime.now())
}

export default logSlice.reducer

function getStartOfWeekDay(date, weekDayNumber, dayStartHour){
  /* date: luxon datetime
     weekDayNumber: week day from 0 (monday) to 6 (sunday)
     returns the date of the start of the specified week day of the week of date */
  const weekStart = startOfWeek(date, dayStartHour)
  return weekStart.plus({days: weekDayNumber})
}

function stopActivity(entry){
  const lastInterval = entry.intervals.slice(-1)[0]
  lastInterval.endDate = DateTime.now().toISO()
}

function selectTodayLog(state){
  const log = selectLogById(state, getTodaySelector(state).toISO())
  return log
}

export function areWeekliesSelectedToday(state){
  const log = selectTodayLog(state)
  return log?.weekliesSelected? log.weekliesSelected : false
}

