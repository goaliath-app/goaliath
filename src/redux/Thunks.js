import { DateTime } from 'luxon'
import { selectAllActivities,  createActivity } from './ActivitySlice'
import { selectGoalById, createGoal } from './GoalsSlice'
import { 
  deleteOneTodaysEntry, upsertTodaysEntry, selectTodayLogByActivityId, selectDailyLogById, 
  createDailyLog, addEntry
} from './DailyLogSlice'


export function generateDummyData(){
  return function(dispatch, getState){
    dispatch(createGoal({name: 'dummy goal'}))
    dispatch(createActivity({name: 'dummy activity', goalId: '0', goal: 'check', repeatMode: 'daily'}))
    dispatch(createActivity({name: 'dummy activity2', goalId: '0', goal: 'check', repeatMode: 'daily'}))
    const entry = {intervals: [], completed: true, id: 0, archived: true }
    dispatch(createDailyLog({date: DateTime.now()}))
    dispatch(addEntry({date: DateTime.now(), entry}))
  }
}

export function updateLogs(){
  return function(dispatch, getState){
    const state = getState()
    const today = DateTime.now()
    
    if(!selectDailyLogById(state, today)){ 
      dispatch(createDailyLog({date: today}))
    }

    for(let activity of selectAllActivities(state)){
      const goal = selectGoalById(state, activity.goalId)
      const oldLog = selectTodayLogByActivityId(state, activity.id)

      if(dueToday(activity, goal)){
        if(oldLog){
          dispatch(upsertTodaysEntry({ ...oldLog, archived: false }))
        }else{
          const entry = newEntry(activity)
          dispatch(addEntry({date: today, entry}))
        }
      }else{
        if(oldLog?.intervals || oldLog?.completed){
          dispatch(upsertTodaysEntry({ ...oldLog, archived: true }))
        }else if(oldLog){
          dispatch(deleteOneTodaysEntry(oldLog.id))
        }
      }
    }
  }
}

function newEntry(activity){
  return(
    {
      intervals: [], 
      completed: false, 
      id: activity.id,
      archived: false
    }
  )
}

function dueToday(activity, activityGoal){
  const today = DateTime.now()
  if(!activity.active || !activityGoal.active){
    return false
  }
  if(activity.repeatMode == 'daily'){
    return true
  }
  if(activity.repeatMode == 'select'){
    if(activity.weekDays[today.weekday]){
      return true
    }
  }
  return false
}



