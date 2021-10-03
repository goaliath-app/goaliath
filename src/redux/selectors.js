import { useStore } from 'react-redux'
import { DateTime } from 'luxon'
import Duration from 'luxon/src/duration.js'

import { selectActivityById, selectAllActivities } from './ActivitySlice'
import { selectGoalEntities } from './GoalsSlice'
import { findActivityRecord } from './ActivityRecordsSlice'

/* This file defines selectors that use data from more than one slice */

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