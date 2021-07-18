import { DateTime } from 'luxon'
import { selectAllActivities,  createActivity, setState as setActivitiesState, selectActivityById } from './ActivitySlice'
import { selectGoalById, createGoal, setState as setGoalsState } from './GoalsSlice'
import { 
  deleteOneTodaysEntry, upsertEntry, sortLog, selectEntryByActivityIdAndDate, selectLogById, deleteEntry,
  createLog, addEntry, sortTodayLog, setState as setLogsState, selectEntriesByDay, deleteLog, replaceEntry,
  capAllTimers,
} from './LogSlice'
import { getToday, startOfDay, dueToday, newEntry, isActive } from './../util'
import { setState as setSettingsState } from './SettingsSlice'


export function generateDummyData(){
  return function(dispatch, getState){
    const { dayStartHour } = getState().settings
    const today = getToday(dayStartHour).plus({day: -5})
    dispatch(createGoal({name: 'dummy goal'}))
    dispatch(createLog({date: today}))
    dispatch(createLog({date: today.plus({day: -1})}))
    dispatch(createLog({date: today.plus({day: -2})}))
    // Daily activities
    dispatch(createActivity({name: 'Social Media', goalId: '0', goal: 'time', timeGoal: 10800, repeatMode: 'daily'}))
    dispatch(createActivity({name: 'Call a pal', goalId: '0', goal: 'check', repeatMode: 'daily'}))
    dispatch(createActivity({name: 'App work', goalId: '0', goal: 'time', timeGoal: 10800, repeatMode: 'daily'}))
    dispatch(createActivity({name: 'Watch anime', goalId: '0', goal: 'time', timeGoal: 10800, repeatMode: 'daily'}))   
    dispatch(createActivity({name: 'Play guitar', goalId: '0', goal: 'time', timeGoal: 3600, repeatMode: 'daily'}))
    dispatch(createActivity({name: 'Anki', goalId: '0', goal: 'check', repeatMode: 'daily'}))
    dispatch(addEntry({date: today, entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00'}], completed: false, id: "2", archived: false }}))
    dispatch(addEntry({date: today, entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T11:03:14.938+01:00'}], completed: false, id: "3", archived: false }}))
    dispatch(addEntry({date: today, entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T11:53:26.690+01:00'}], completed: true, id: "4", archived: false }}))
    dispatch(addEntry({date: today, entry: {intervals: [], completed: true, id: "5", archived: false }}))

    // weekly activities
    dispatch(createActivity({name: 'Call a pal', goalId: '0', goal: 'check', timesPerWeek: 3, repeatMode: 'weekly'}))
    dispatch(addEntry({date: today.plus({day: -1}), entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T11:03:14.938+01:00'}], completed: true, id: "6", archived: false }}))
    dispatch(addEntry({date: today.plus({day: -2}), entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T11:03:14.938+01:00'}], completed: true, id: "6", archived: false }}))
    dispatch(createActivity({name: 'Social Media', goalId: '0', goal: 'time', timeGoal: 3, repeatMode: 'weekly'}))
    dispatch(addEntry({date: today.plus({day: -1}), entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T10:53:27.690+01:00'}], completed: true, id: "7", archived: false }}))
    dispatch(addEntry({date: today.plus({day: -2}), entry: {intervals: [{startDate: '2021-03-20T10:53:26.690+01:00', endDate: '2021-03-20T10:53:27.690+01:00'}], completed: true, id: "7", archived: false }}))
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
  // TODO close open time intervals on day change.
  return function(dispatch, getState){
    const { 
      settings: { dayStartHour }, 
      logs: { ids: loggedDatesISO } 
    } = getState()
    const today = getToday(dayStartHour)
    const epoch = DateTime.fromMillis(0)
    
    // find latest logged day
    let newestLogDate = getNewestDate(loggedDatesISO)

    // if tomorrows log already exists (due to a daystarthour change)
    while(newestLogDate > today){
      dispatch(deleteLog({ isoDate: newestLogDate.toISO() }))
      const { logs: { ids: newLoggedDatesISO } } = getState()
      newestLogDate = getNewestDate(newLoggedDatesISO)
    }

    // there are no logs
    if(newestLogDate.toISO() == epoch.toISO()){
      dispatch(createLog({ date: today }))
      dispatch(updateLog({ date: today }))

    // today log has already been created
    }else if(newestLogDate.toISO() == today.toISO()){    
      dispatch(unembalmLog({ date: today }))
      dispatch(updateLog({ date: today }))

    // there are logs, but today log has not been created yet
    }else{
      dispatch(capAllTimers({ date: newestLogDate }))

      // from next day of newestLogDate to today (including both), create and update logs.
      for(let date = newestLogDate.plus({ days: 1 }); date <= today; date = date.plus({ days: 1 })){
        dispatch(createLog({ date }))
        dispatch(updateLog({ date }))
      }
    
      // from newestLogDate to yesterday (including both), embalm their logs.
      for(let date = newestLogDate; date < today; date = date.plus({ days: 1 })){
        dispatch(embalmLog({ date }))
      }
    }
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
      const entry = newEntry(activity)
      dispatch(addEntry({ date, entry }))
    }
  }
}

function updateLog({ date }){
  return function(dispatch, getState){
    const state = getState() 
    
    for(let activity of selectAllActivities(state)){
      const goal = selectGoalById(state, activity.goalId)
      const oldEntry = selectEntryByActivityIdAndDate(state, activity.id, date)
      
      // if activity is inactive, remove its entry if it has one
      if( !isActive(activity, goal) && oldEntry && !oldEntry.archived ){
        dispatch( archiveOrDeleteEntry(date, activity.id) )
      // else, if the activity is not weekly
      } else if(activity.repeatMode != 'weekly') {
        // create its entry if the activity is due today
        if(dueToday(date, activity, goal)){
          createOrUnarchiveEntry(date, activity.id)
        // or remove its possible entry if it is not due today
        }else{
          dispatch( archiveOrDeleteEntry(date, activity.id) )
        }
      }
    }
    dispatch(sortLog({ date }))
  }
}

function embalmLog({ date }){
  /* Puts into all entries of the specified date the current data
  of their corresponding activities. This way, even if the activity
  name, repeatMode or whatever gets changed, it won't change the embalmed
  logs appearance in the calendar. */
  return function(dispatch, getState){
    const state = getState()
    const logEntries = selectEntriesByDay(state, date)
    for(let entry of logEntries){
      const activity = selectActivityById(state, entry.id)
      const embalmedEntry = { ...activity, ...entry, embalmed: true }
      dispatch(upsertEntry({ date, entry: embalmedEntry }))
    }
  }
}

function unembalmLog({ date }){
  return function(dispatch, getState){
    const state = getState()
    const log = selectLogById(state, date.toISO())
    const entries = log.entries.entities
    for(let entryId in entries){
      const entry = entries[entryId]
      if(entry.embalmed){
        const unembalmedEntry = {
          ...newEntry({ id: entry.id }),
          completed: entry.completed,
          intervals: entry.intervals
        }

        dispatch(replaceEntry({ date, entry: unembalmedEntry }))
      }
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
