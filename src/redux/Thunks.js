import { DateTime } from 'luxon'
import { selectAllActivities,  createActivity, setState as setActivitiesState, selectActivityById } from './ActivitySlice'
import { selectGoalById, createGoal, setState as setGoalsState } from './GoalsSlice'
import { 
  deleteOneTodaysEntry, upsertEntry, sortLog, selectEntryByActivityIdAndDate, selectLogById, deleteEntry,
  createLog, addEntry, sortTodayLog, setState as setLogsState, selectEntriesByDay, deleteLog, replaceEntry,
  capAllTimers,
} from './LogSlice'
import { initDate as initTasksDate } from './TasksSlice'
import { startOfDay, dueToday, newEntry, isActive } from './../util'
import { setState as setSettingsState } from './SettingsSlice'
import { addActivityRecord, deleteActivityRecordsByDate } from './ActivityRecordsSlice'

import { updateEntryThunk } from '../activityHandler'
import { getTodaySelector } from './selectors'


export function generateDummyData(){
  return function(dispatch, getState){
    const state = getState()
    const today = getTodaySelector(state).plus({day: -5})
    
    // goals
    dispatch(createGoal({name: 'dummy goal'}))

    // activities
    dispatch(createActivity({
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

    dispatch(createActivity({
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

    dispatch(createActivity({
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

    dispatch(createActivity({
      name: 'do10MinutesEachWeek', 
      goalId: '0', 
      type: 'doNSecondsEachWeek', 
      params: { 
        seconds: 600,
      }
    }))

    dispatch(createActivity({
      name: 'do10TimesEachWeek', 
      goalId: '0', 
      type: 'doNTimesEachWeek', 
      params: { 
        repetitions: 10,
      }
    }))

    dispatch(createActivity({
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


function getNewestDate(isoDatesList){
  const epoch = DateTime.fromMillis(0)

  const loggedDateTimes = isoDatesList.map((isoDate) => DateTime.fromISO(isoDate))
  
  const newestLogDate = loggedDateTimes.reduce((curr, prev) => {
    return curr>=prev? curr : prev
  }, epoch)

  return newestLogDate
}

export function updateLogs(){
  return function(dispatch, getState){
    const state = getState()
    const { logs: { ids: loggedDatesISO } } = state
    const today = getTodaySelector(state)
    const epoch = DateTime.fromMillis(0)
    
    // find latest logged day
    let newestLogDate = getNewestDate(loggedDatesISO)

    // if tomorrows log already exists (due to a daystarthour change)
    while(newestLogDate > today){
      // hard delete it and repeat
      dispatch(deleteLog({ isoDate: newestLogDate.toISO() }))
      const { logs: { ids: newLoggedDatesISO } } = getState()
      newestLogDate = getNewestDate(newLoggedDatesISO)
    }

    // there are no logs
    if(newestLogDate.toISO() == epoch.toISO()){
      // create the today log as the first one
      dispatch(initDate(today))
      dispatch(updateLog({ date: today }))

    // today log has already been created
    }else if(newestLogDate.toISO() == today.toISO()){
      // delete activity records that may exist for today, they are not needed   
      dispatch(deleteActivityRecordsByDate({ date: today }))
      // update today's log
      dispatch(updateLog({ date: today }))

    // there are logs, but today log has not been created yet
    }else{
      // cap all open timers of the previous day
      dispatch(capAllTimers({ date: newestLogDate }))

      // from next day of newestLogDate to today (including both), create and update logs.
      for(let date = newestLogDate.plus({ days: 1 }); date <= today; date = date.plus({ days: 1 })){
        dispatch(initDate(date))
        dispatch(updateLog({ date }))
      }
    
      // from newestLogDate to yesterday (including both), create their activity records,
      // so that we know how the activity were in that day.
      for(let date = newestLogDate; date < today; date = date.plus({ days: 1 })){
        dispatch(createActivityRecords({ date }))
      }
    }
  }
}

export function initDate(date){
  return function(dispatch, getState){
    dispatch(createLog({ date }))  // init date for logSlice
    dispatch(initTasksDate({ date }))  // init date for tasks slice
  }
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

export function createOrUnarchiveEntry(date, activityId, extraData = {}){
  /* creates an entry in specified day for the chosen activity if it does not exist.
  If it exists and is archived, unarchives it. */
  return function(dispatch, getState){
    const state = getState()
    const entry = selectEntryByActivityIdAndDate(state, activityId, date)
    
    if(entry?.archived){
      dispatch(upsertEntry({ date, entry: { ...entry, archived: false }}))
    }else if(!entry){
      const activity = selectActivityById(state, activityId)
      const entry = { ...newEntry(activity), ...extraData, date }
      dispatch(addEntry({ date, entry }))
    }
  }
}

function updateLog({ date }){
  return function(dispatch, getState){
    const state = getState() 
    
    for(let activity of selectAllActivities(state)){
      dispatch( updateEntryThunk( activity.id, date ) )
    }
    dispatch(sortLog({ date }))
  }
}

// TODO: not all activities should be recorded every day.
// weekly activities should reflect changes back to the last monday.
function createActivityRecords({ date }){
  /* Puts into all entries of the specified date the current data
  of their corresponding activities. This way, even if the activity
  name, repeatMode or whatever gets changed, it won't change the embalmed
  logs appearance in the calendar. */
  return function(dispatch, getState){
    const state = getState()
    const logEntries = selectEntriesByDay(state, date)
    for(let entry of logEntries){
      const activity = selectActivityById(state, entry.id)
      dispatch(addActivityRecord({ date, activityRecord: activity }))
    }
  }
}

export function importState(newState){
  return function(dispatch, getState){
    dispatch(setSettingsState({ newState: newState.settings }))
    dispatch(setActivitiesState({ newState: newState.activities }))
    dispatch(setGoalsState({ newState: newState.goals }))
    dispatch(setLogsState({ newState: newState.logs }))
  }
}
