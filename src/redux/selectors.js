import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

import { selectAllActivitiesByDate, selectActivityByIdAndDate, selectAllActivities } from './ActivitySlice'
import { selectGoalByIdAndDate } from './GoalsSlice'
import { selectAllWeekEntriesByActivityId } from './LogSlice'

import { getTodayTime, startOfDay } from './../time'

import { dueToday, dueThisWeek } from '../activityHandler'

import { selectEntryByActivityIdAndDate } from './LogSlice'

/* 
  This file defines selectors that use data from more than one slice 
  and/or is out of the slice responsibilities
*/

function isActive(activity, goal){
  return activity.active && !activity.archived && goal.active && !goal.archived 
}

export function isActiveSelector(state, activityId, date) {
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const goal = selectGoalByIdAndDate(state, activity.goalId, date)

  return isActive(activity, goal)

}

export function selectAllActiveActivities(state){
  const today = getTodaySelector(state)
  return selectAllActiveActivitiesByDate(state, today)
}

export function selectAllActiveActivitiesByDate(state, date){
  /* returns a list of all activities that:
  - are not disabled or archived
  - belong to goals that are not disabled or archived */
  const allActivities = selectAllActivitiesByDate(state, date)

  const activeActivities = allActivities.filter(activity => {
    const goal = selectGoalByIdAndDate(state, activity.goalId, date)
    return isActive(activity, goal) 
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

export function selectAllActiveActivitiesByGoalIdAndDate(state, goalId, date){
  const activeActivities = selectAllActiveActivitiesByDate(state, date)

  return activeActivities.filter(activity => {
    return activity.goalId == goalId
  })
}

export function selectAllActivitiesByGoalId(state, goalId){
  const activities = selectAllActivities(state)
  const thisGoalActivities = activities.filter(activity => {
    return activity.goalId == goalId && !activity.archived
  })
  
  return thisGoalActivities 
}

export function selectVisibleActivities(state, date){
  const activities = selectAllActiveActivitiesByDate(state, date)

  const visibleActivities = activities.filter(a => {
    if(dueToday(state, a.id, date)){
      return true
    }
    if(dueThisWeek(state, a.id, date)){
      const entry = selectEntryByActivityIdAndDate(state, a.id, date)
      if(!entry.archived){
        return true
      }
    }
    return false
  })
  return visibleActivities
}
