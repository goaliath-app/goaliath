import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import { isActivityRunning, getTodayTime, newEntry } from '../../util'
import arrayMove from 'array-move'
import Duration from 'luxon/src/duration.js'


import { getTodaySelector } from '../selectors'

function compareEntries(a, b){
  if( (a.completed != null) == (b.completed != null) ){
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
    completed: ISODate of completion, or null if not completed,
    archived: bool, (a log is archived if it contains information that may be useful in the future but should not be shown i.e. if the activity has been disabled after logging some time on it)
    (optional) repetitions: list of ISODates of each repetition, 
  }

*/

function getOrCreateDay(state, date){
  const day = state.entities[date]
  if(day){
    return day
  }
  const log = {
    id: date.toISO ? date.toISO() : date,
    weekliesSelected: false,
    entries: entryAdapter.getInitialState(),
  }
  logAdapter.addOne(state, log)
  return log
}

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    /* All reducer's date payloads are expected to be a luxon DateTime 
    from the natural beggining of a day (i.e. hour 00:00:00) */
    setWeekliesSelected(state, action){
      const { date, value } = action.payload
      const selectedDay = getOrCreateDay(state, date)
      selectedDay.weekliesSelected = value
    },
    addEntry(state, action){
      /* add a single entry to a daily log */
      const { date, entry } = action.payload
      const selectedDay = getOrCreateDay(state, date.toISO())
      entryAdapter.addOne(selectedDay.entries, entry)
    },
    upsertEntry(state, action){
      const { date, entry } = action.payload
      const day = date.toISO()
      const dayLog = getOrCreateDay(state, day).entries
      entryAdapter.upsertOne(dayLog, entry)
    },
    replaceEntry(state, action){
      const { date, entry } = action.payload
      const day = date.toISO()
      const dayLog = getOrCreateDay(state, day).entries.entities
      dayLog[entry.id] = entry
    },
    deleteEntry(state, action){
      const { date, entryId } = action.payload
      const today = date.toISO()
      const todaysLog = getOrCreateDay(state, today).entries
      entryAdapter.removeOne(todaysLog, entryId)
    },
    toggleCompleted(state, action){
      // select data
      const { date, id } = action.payload
      const log = getOrCreateDay(state, date.toISO()).entries
      let entry = log.entities[id]
      
      // get index of the first completed entry in that date
      let firstCompletedIndex = 0
      for(let i = 0; i < log.ids.length; i++){
        if(log.entities[log.ids[i]].completed){
          firstCompletedIndex = i
          break
        }
      }
      
      // toggle the completed status of the entry
      if(!entry){
        log.entities[id] = { ...newEntry(id), completed: true }
        entry = log.entities[id]
      }else if(entry.completed){
        entry.completed = null
      }else{
        entry.completed = DateTime.now().toISO()
      }
      
      // move the entry to its new position
      const newPosition = entry.completed? -1 : firstCompletedIndex
      log.ids = arrayMove(log.ids, log.ids.indexOf(id), newPosition)
    },
    startTimer(state, action){
      const { date, id } = action.payload
      const today = date.toISO()
      const todaysLog = getOrCreateDay(state, today)
      for(let entry of Object.values(todaysLog.entries.entities)){
        if(isActivityRunning(entry.intervals)){
          stopActivity(entry)
        }
      }
      let activityEntry = todaysLog.entries.entities[id]
      if(!activityEntry){
        todaysLog.entries.entities[id] = { ...newEntry(id) }
        activityEntry = todaysLog.entries.entities[id]
      }
      activityEntry.intervals.push({startDate: DateTime.now().toISO()})
    },
    stopTimer(state, action){
      const { date, id } = action.payload
      const today = date.toISO()
      const todaysLog = getOrCreateDay(state, today)
      const activityEntry = todaysLog.entries.entities[id]
      stopActivity(activityEntry)
    },
    sortLog(state, action){
      const { date } = action.payload
      const today = date.toISO()
      const todaysLog = getOrCreateDay(state, today).entries
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
      const log = getOrCreateDay(state, isoDate)
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
    },
    setRepetitions(state, action){
      const { date, id, repetitions } = action.payload
      const log = getOrCreateDay(state, date.toISO()).entries
      let entry = log.entities[id]

      if(!entry){
        log.entities[id] = { ...newEntry(id) }
        entry = log.entities[id]
      }

      if(entry.repetitions == undefined) return

      if( entry.repetitions.length < repetitions ){
        for(let i = entry.repetitions.length; i < repetitions; i++){
          entry.repetitions.push(DateTime.now().toISO())
        }
      }else if( entry.repetitions.length > repetitions ){
        entry.repetitions = entry.repetitions.slice(0, repetitions)
      }
    },
  }
})

export const { 
  addEntry, deleteEntry, toggleCompleted, startTimer, 
  stopTimer, sortLog, upsertEntry, setState, deleteLog, replaceEntry,
  capAllTimers, setWeekliesSelected, setRepetitions,
} = logSlice.actions

export const { 
  selectById: selectLogById
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
  return thatDaysLog?.entries.entities[activityId] ?? newEntry(activityId, true)
}

export function selectAllWeekEntriesByActivityId(state, activityId, date){
  // date can be any moment of the week
  let entries = {}
  for(let i = 0; i < 7; i++){
    const weekday = getStartOfWeekDay(date, i)
    const entry = selectEntryByActivityIdAndDate(state, activityId, weekday)
    if(entry){
      entries[i] = entry
    }
  }
  return entries
}

export function selectAllActivityEntries(state, activityId){
  let allEntries = {}
  state.logs.ids.forEach((logDate) => {
    const thatDayEntry = state.logs.entities[logDate].entries.entities[activityId]
    if(thatDayEntry){
      allEntries[logDate] = thatDayEntry
    }
  })
  return allEntries
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

function selectTodayLog(state){
  const log = selectLogById(state, getTodaySelector(state).toISO())
  return log
}

export function areWeekliesSelectedToday(state){
  const log = selectTodayLog(state)
  return log?.weekliesSelected? log.weekliesSelected : false
}

export function selectDailyDurationById(state, activityId, date){
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)
  return entry? getTodayTime(entry.intervals) : Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
}

export function getPeriodStats(state, startDate, endDate, activityId){
  /* gets stats for the activity in the inclusive period between startDate
  and endDate. */
  
  let loggedTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
  let daysDoneCount = 0
  let daysDoneList = []
  let repetitionsCount = 0

  for(let date = startDate; date <= endDate; date = date.plus({days: 1})){
    const entry = selectEntryByActivityIdAndDate(state, activityId, date)
    if(entry){
      if(entry.completed){
        daysDoneCount += 1
        daysDoneList.push(date)
      }
      loggedTime = loggedTime.plus(getTodayTime(entry.intervals))
      repetitionsCount += entry.repetitions? entry.repetitions.length : 0
    }
  }
  
  return { loggedTime, daysDoneCount, daysDoneList, repetitionsCount }
}

export function getLifeTimeStats(state, activityId){
  const firstLogDateTime = DateTime.fromISO(state.logs.ids[0])
  const today = getTodaySelector(state)

  if(!firstLogDateTime) return null

  return getPeriodStats(state, firstLogDateTime, today, activityId)
}