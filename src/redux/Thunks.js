import { DateTime } from 'luxon'

import { serializeDate, getNewestDate } from './../time'
import { newEntry } from './../util'

import { dismissAllNotificationsAsync } from 'expo-notifications'

import {
  selectAllActivities, setActivity, selectActivityById, 
  setState as setActivitiesState, moveAllActivityRecordsOneDayBack,
  selectLatestActivityEntryDate,
} from './ActivitySlice'

import { 
  setState as setGoalsState, setGoal, moveAllGoalRecordsOneDayBack,
  selectLatestGoalEntryDate,
} from './GoalsSlice'

import { 
  deleteOneTodaysEntry, upsertEntry, sortLog, selectEntryByActivityIdAndDate, selectLogById, deleteEntry,
  addEntry, sortTodayLog, setState as setLogsState, selectEntriesByDay, deleteLog, replaceEntry,
  capAllTimers,
} from './LogSlice'

import { setState as setTasksState } from './TasksSlice'
import { setState as setSettingsState } from './SettingsSlice'
import { setState as setGuideState } from './GuideSlice'

import { getTodaySelector } from './selectors'


export function generateDummyData(){
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state).plus({day: -5})
    
    // goals
    dispatch(setGoal({name: 'dummy goal'}))

    // activities
    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'Daily do10Seconds', 
      goalId: '0', 
      type: 'doFixedDays', 
      params: { 
        daysOfWeek: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
        dailyGoal: {
          type: 'doNSeconds',
          params: { 
            seconds: 10
          }
        }
      }
    }))

    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'Daily do1Times', 
      goalId: '0', 
      type: 'doFixedDays', 
      params: { 
        daysOfWeek: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
        dailyGoal: {
          type: 'doOneTime',
          params: { }
        }
      }
    }))

    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'do2TimesEachWeek do1Times', 
      goalId: '0', 
      type: 'doNDaysEachWeek', 
      params: { 
        days: 2,
        dailyGoal: {
          type: 'doOneTime',
          params: { }
        }
      }
    }))

    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'do10MinutesEachWeek', 
      goalId: '0', 
      type: 'doNSecondsEachWeek', 
      params: { 
        seconds: 600,
      }
    }))

    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'do10TimesEachWeek', 
      goalId: '0', 
      type: 'doNTimesEachWeek', 
      params: { 
        repetitions: 10,
      }
    }))

    dispatch(setActivity({
      archived: false,
      active: true,
      name: 'Daily do3Times', 
      goalId: '0', 
      type: 'doFixedDays', 
      params: { 
        daysOfWeek: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
        dailyGoal: {
          type: 'doNTimes',
          params: {
            repetitions: 3
          }
        }
      }
    }))

  }
}

export function updateLogs(){
  return function(dispatch, getState){
    let state = getState()
    const { logs: { ids: loggedDatesISO } } = state
    const today = getTodaySelector(state)
    const epoch = DateTime.fromMillis(0)
    
    // find latest logged day
    let newestLogDate = getNewestDate(loggedDatesISO)

    // if tomorrows log already exists (due to a daystarthour change)
    while(newestLogDate > today){
      // hard delete it and repeat
      dispatch(deleteLog({ isoDate: serializeDate(newestLogDate) }))
      state = getState()
      const { logs: { ids: newLoggedDatesISO } } = state
      newestLogDate = getNewestDate(newLoggedDatesISO)
    }

    // move changes to goals from tomorrow to today (if any)
    let newestGoalEntryDate = selectLatestGoalEntryDate(state)
    while(newestGoalEntryDate > today){
      dispatch(moveAllGoalRecordsOneDayBack(newestGoalEntryDate))
      state = getState()
      newestGoalEntryDate = selectLatestGoalEntryDate(state)
    }

    // move changes to activities from tomorrow to today (if any)
    let newestActivityEntryDate = selectLatestActivityEntryDate(state)
    while(newestActivityEntryDate > today){
      dispatch(moveAllActivityRecordsOneDayBack(newestActivityEntryDate))
      state = getState()
      newestActivityEntryDate = selectLatestActivityEntryDate(state)
    }

    if(newestLogDate < today && areThereOpenTimers(state, serializeDate(newestLogDate))){
      // cap all open timers of the previous day
      dispatch(capAllTimers({ date: newestLogDate }))
      // also dismiss the "you are working on" sticky notification
      dismissAllNotificationsAsync();
    }
  }
}

function areThereOpenTimers(state, date){
  const entries = selectEntriesByDay(state, date)

  // check each entry
  for(let entry of entries){
    // if it has any open intervals
    if(entry.intervals?.some(interval => !interval.endDate)){
      // then yes
      return true
    }
  }
  // otherwise no
  return false
}


export function archiveOrDeleteEntry(date, entryId){
  /* Archives an entry if it has been completed or has any interval recorded.
  Otherwise it just deletes it */
  return function(dispatch, getState){
    const state = getState()
    const entry = selectEntryByActivityIdAndDate(state, entryId, date)
    if(entry?.intervals || entry?.completed){
      dispatch(upsertEntry({ date, entry: { ...entry, archived: true }}))
    }else if(entry){
      dispatch(deleteEntry({ date, entryId: entry.id }))
    }
  }
}

export function createOrUnarchiveEntry(date, activityId){
  /* creates an entry in specified day for the chosen activity if it does not exist.
  If it exists and is archived, unarchives it. */
  return function(dispatch, getState){
    const state = getState()
    const entry = selectEntryByActivityIdAndDate(state, activityId, date)
    if(entry?.archived){
      dispatch(upsertEntry({ date, entry: { ...entry, archived: false }}))
    }else if(!entry){
      const activity = selectActivityById(state, activityId)
      const entry = { ...newEntry(activity.id), date }
      dispatch(addEntry({ date, entry }))
    }
  }
}

export function importState(newState){
  return function(dispatch, getState){
    dispatch(setSettingsState({ newState: newState.settings }))
    dispatch(setActivitiesState({ newState: newState.activities }))
    dispatch(setGoalsState({ newState: newState.goals }))
    dispatch(setLogsState({ newState: newState.logs }))
    dispatch(setTasksState({ newState: newState.tasks }))
    dispatch(setGuideState({ newState: newState.guide }))
  }
}
