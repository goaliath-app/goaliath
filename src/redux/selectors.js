import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

import { selectActivityById, selectAllActivities, selectActivityEntities } from './ActivitySlice'
import { selectGoalEntities, selectGoalById } from './GoalsSlice'
import { findActivityRecord } from './ActivityRecordsSlice'
import { selectAllWeekEntriesByActivityId, selectEntriesByDay } from './LogSlice'

import { getTodayTime, startOfDay, dueToday, newEntry } from './../util'

/* 
  This file defines selectors that use data from more than one slice 
  and/or is out of the slice responsibilities
*/

export function selectActivityByIdAndDate(state, activityId, date){
  let activityRecord

  if(date){
    activityRecord = findActivityRecord(state, activityId, date)
  } 

  if(activityRecord) {
    return activityRecord
  }else{
    return selectActivityById(state, activityId)
  }
}

export function selectAllActiveActivities(state){
  /* returns a list of all activities that:
  - are not disabled or archived
  - belong to goals that are not disabled or archived */
  const allActivities = selectAllActivities(state)
  const goalEntities = selectGoalEntities(state)

  const activeActivities = allActivities.filter(activity => {
    const goal = goalEntities[activity.goalId]
    return(
      activity.active && !activity.archived && goal.active && !goal.archived 
    )
  })

  return activeActivities
}

export function getWeeklyStats(state, day, activityId){
  /* counting all entries of that week up to the day specified
  ignores given and later days. */

  let weeklyTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
  let daysDoneCount = 0
  let daysDoneList = []
  let repetitionsCount = 0

  const weekLogs = selectAllWeekEntriesByActivityId(state, activityId, day)

  for(let thatDay in weekLogs){
    if(day.weekday-1==thatDay){
      break
    }
    weeklyTime = weeklyTime.plus(getTodayTime(weekLogs[thatDay].intervals))
    if(weekLogs[thatDay].completed){
      daysDoneCount += 1
      daysDoneList.push(parseInt(thatDay)+1)
    }
    repetitionsCount += weekLogs[thatDay].repetitions? weekLogs[thatDay].repetitions.length : 0
  }

  return {weeklyTime, daysDoneCount, daysDoneList, repetitionsCount}
}

export function getTodaySelector(state){
  /* returns DateTime */
  const dayStartHour = state.settings.dayStartHour
  return startOfDay(DateTime.now(), dayStartHour)
}
