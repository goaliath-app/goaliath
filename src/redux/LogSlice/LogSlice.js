import { createSlice, createEntityAdapter, current } from '@reduxjs/toolkit'
import { DateTime } from 'luxon'
import { serializeDate, getTodayTime, deserializeDate } from '../../time'
import { isActivityRunning, newEntry } from '../../util'
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
    id: serializeDate(date),
    weekliesSelected: false,
    entries: entryAdapter.getInitialState(),
  }
  state = logAdapter.addOne(state, log)
  return log
}

function getOrCreateEntry(id, dayLog){
  let entry = dayLog.entries.entities[id]
  if(!entry){
    entry = newEntry(id)
    dayLog.entries = entryAdapter.addOne(dayLog.entries, entry)
  }
  return entry
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
      let selectedDay = getOrCreateDay(state, serializeDate(date))
      selectedDay.entries = entryAdapter.addOne(selectedDay.entries, entry)
    },
    upsertEntry(state, action){
      const { date, entry } = action.payload
      const day = serializeDate(date)
      let dayLog = getOrCreateDay(state, day).entries
      dayLog = entryAdapter.upsertOne(dayLog, entry)
    },
    replaceEntry(state, action){
      const { date, entry } = action.payload
      const day = serializeDate(date)
      let dayLog = getOrCreateDay(state, day).entries.entities
      dayLog[entry.id] = entry
    },
    deleteEntry(state, action){
      const { date, entryId } = action.payload
      const today = serializeDate(date)
      let todaysLog = getOrCreateDay(state, today).entries
      todaysLog = entryAdapter.removeOne(todaysLog, entryId)
    },
    toggleCompleted(state, action){
      // select data
      const { date, id } = action.payload
      const log = getOrCreateDay(state, serializeDate(date))
      const entry = getOrCreateEntry(id, log)

      // toggle the completed status of the entry
      if(entry.completed === null){
        entry.completed = serializeDate(DateTime.now())
      }else{
        entry.completed = null
      }
    },
    startTimer(state, action){
      const { date, id } = action.payload
      const today = serializeDate(date)
      const todaysLog = getOrCreateDay(state, today)
      for(let entry of Object.values(todaysLog.entries.entities)){
        if(isActivityRunning(entry.intervals)){
          stopActivity(entry)
        }
      }
      let activityEntry = getOrCreateEntry(id, todaysLog)
      activityEntry.intervals = [ ...activityEntry.intervals, {startDate: serializeDate(DateTime.now())} ]
    },
    stopTimer(state, action){
      const { date, id } = action.payload
      const today = serializeDate(date)
      const todaysLog = getOrCreateDay(state, today)
      const activityEntry = todaysLog.entries.entities[id]
      stopActivity(activityEntry)
    },
    sortLog(state, action){
      const { date } = action.payload
      const today = serializeDate(date)
      const todaysLog = getOrCreateDay(state, today).entries
      todaysLog.ids.sort((idA, idB) => {return compareEntries(todaysLog.entities[idA], todaysLog.entities[idB])})
    },
    setState(state, action){
      const { newState } = action.payload
      return newState
    },
    deleteLog(state, action){
      const { isoDate } = action.payload
      state = logAdapter.removeOne(state, isoDate)
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
          deserializeDate(interval.startDate) < deserializeDate(capIsoDate)
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
      const log = getOrCreateDay(state, serializeDate(date))
      let entry = getOrCreateEntry(id, log)

      if(entry.repetitions == undefined) return

      if( entry.repetitions.length < repetitions ){
        for(let i = entry.repetitions.length; i < repetitions; i++){
          entry.repetitions = [DateTime.now(), ...entry.repetitions]
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
  const thatDayLog = selectLogById(state, serializeDate(deserializeDate(day)))
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
  const thatDaysLog = state.logs.entities[serializeDate(date)]
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
  lastInterval.endDate = serializeDate(DateTime.now())
}

function selectTodayLog(state){
  const log = selectLogById(state, serializeDate(getTodaySelector(state)))
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
  const firstLogDateTime = deserializeDate(state.logs.ids[0])
  const today = getTodaySelector(state)

  if(!firstLogDateTime) return null

  return getPeriodStats(state, firstLogDateTime, today, activityId)
}