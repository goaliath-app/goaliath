import React from 'react';
import { useSelector } from 'react-redux'
import { 
  selectActivityById, createOrUnarchiveEntry, archiveOrDeleteEntry, 
  selectGoalById, selectActivityByIdAndDate, selectAllActiveActivities, 
  selectAllActiveActivitiesByDate,
  selectEntryByActivityIdAndDate, selectEntriesByDay,
  findAllActivityRecords, isActiveSelector
} from "../redux"
import activityTypes from './activityTypes'
import { WeekView as BaseWeekView } from '../components'
import { isActive } from '../util'

import { List } from 'react-native-paper'

export function updateEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    const state = getState()
    const activity = selectActivityById( state, activityId )

    const activityType = activityTypes[ activity.type ]
  
    const thunk = activityType.updateEntryThunk
  
    if( thunk ){
      dispatch(thunk(activityId, date))
    }
  }
}

export const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityByIdAndDate( state, activityId, date ) )

  const activityType = activityTypes[activity.type]
  const ActivityTypeTodayScreenItem = activityType.TodayScreenItem

  return (
    ActivityTypeTodayScreenItem?
      <ActivityTypeTodayScreenItem activityId={activityId} date={date} />
      : 
      null 
  )
}

export function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  const activityType = activityTypes[activity.type]
  const ActivityTypeSelectWeekliesItemDue = activityType.SelectWeekliesItemDue

  return (
    ActivityTypeSelectWeekliesItemDue?
      <ActivityTypeSelectWeekliesItemDue activity={activity} today={today} isChecked={isChecked} onCheckboxPress={onCheckboxPress} isSelected={isSelected} onPress={onPress} />
      :
      null
  )
}

export function SelectWeekliesItemCompleted({ activity, today, isSelected, onPress }){
  const activityType = activityTypes[activity.type]
  const ActivityTypeSelectWeekliesItemCompleted = activityType.SelectWeekliesItemCompleted

  return (
    ActivityTypeSelectWeekliesItemCompleted?
      <ActivityTypeSelectWeekliesItemCompleted activity={activity} today={today} isSelected={isSelected} onPress={onPress} />
      :
      null
  )
}

export function usesSelectWeekliesScreen(state, activityId){
  const activity = selectActivityById( state, activityId )
  const goal = selectGoalById( state, activity.goalId )

  const activityType = activityTypes[activity.type]

  return (
    isActive( activity, goal ) &&
    ( activityType.SelectWeekliesItemCompleted !== undefined
      || activityType.SelectWeekliesItemDue !== undefined )
  )
}

export const WeekView = ({ activityId, date, todayChecked }) => {
  const activity = useSelector( state => selectActivityById( state, activityId ) )

  const activityType = activityTypes[activity.type]
  const ActivityTypeWeekView = activityType.WeekView

  return(
    ActivityTypeWeekView?
      <ActivityTypeWeekView activityId={activityId} date={date} todayChecked={todayChecked} />
      : 
      <BaseWeekView dayOfWeek={date.weekday} daysDone={todayChecked=='checked'?[date.weekday]:[]} daysLeft={[]} />
  )
}


/* ATM solely for creating entry of weekly activities when they are selected in the SelectWeekliesScreen */
export function addEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    const state = getState()
    const activity = selectActivityById( state, activityId )
    const activityType = activityTypes[activity.type]
    const activityTypeAddEntryThunk = activityType.addEntryThunk

    if(activityTypeAddEntryThunk){
      dispatch(activityTypeAddEntryThunk(activityId, date))
    }else{
      dispatch(createOrUnarchiveEntry(date, activityId))
    }
  }
}

/* ATM solely for removing entry of weekly activities when they are selected in the SelectWeekliesScreen */
export function removeEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(archiveOrDeleteEntry(date, activityId))
  }
}

export function areThereWeeklyActivities(state){
  const activities = selectAllActiveActivities(state)

  for( let activity of activities ){
    if(usesSelectWeekliesScreen(state, activity.id)){
      return true
    }
  }

  return false
}

export function areTherePendingWeeklyActivities(state, date){
  const activities = selectAllActiveActivities(state)

  for( let activity of activities ){
    if(usesSelectWeekliesScreen(state, activity.id)){
      const activityType = activityTypes[activity.type]
      if(!activityType.isWeekCompleted( state, activity.id, date )){
        return true
      }
    }
  }

  return false
}

export function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  const activityType = activityTypes[activity.type]

  return activityType.getFrequencyString?
  activityType.getFrequencyString(state, activityId, t)
    :
    'ERROR: no frequency string'
}

export function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )

  const activityType = activityTypes[activity.type]

  if(activityType.getDayActivityCompletionRatio){
    return activityType.getDayActivityCompletionRatio(state, activityId, date)
  }else{
    // Generic completion ratio calculation
    const entry = selectEntryByActivityIdAndDate(state, activityId, date)

    if(!entry){
      return 0
    }else if(entry.completed){
      return 1
    }else if(entry.repetitions?.length > 0 || entry.intervals.length > 0){
      return 0.1
    }else{
      return 0
    }
  }
}

export function getDayCompletionRatio(state, date){
  const dateEntries = selectEntriesByDay(state, date)

  let completionAccumulator = 0
  let activeEntries = 0
  for(let entry of dateEntries){
    if(!entry.archived){
      completionAccumulator += getDayActivityCompletionRatio(state, entry.id, date)
      activeEntries += 1
    }
  }

  if(activeEntries == 0){
    return 0
  }else{
    return completionAccumulator / activeEntries
  }
}

export function getWeekActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )

  const activityType = activityTypes[activity.type]

  if(activityType.getWeekActivityCompletionRatio){
    return activityType.getWeekActivityCompletionRatio(state, activityId, date)
  }else{
    // Error
    throw `activity type ${activity.type} does not have a getWeekActivityCompletionRatio function.`
  }
}

export function getWeekCompletionRatio(state, date){
  const weekEndDate = date.endOf("week")

  // get the number of active activities this week
  const dueActivities = []

  const activities = selectAllActiveActivitiesByDate(state, weekEndDate)
  
  activities.forEach( activity => {
    if( dueThisWeek(state, activity.id, weekEndDate) ){
      dueActivities.push(activity)
    }
  }) 
  
  // get how much of each activity is completed this week
  let completionAccumulator = 0
  dueActivities.forEach( activity => {
    const completionRatio = getWeekActivityCompletionRatio(state, activity.id, weekEndDate)
    completionAccumulator += completionRatio
  })

  // divide the completed activities by the total number of active activities
  if(dueActivities.length == 0){
    return 0
  }else{
    return completionAccumulator / dueActivities.length
  }
}

function dueThisWeek(state, activityId, date){
  // This function tells wether the activity is due this week or not
  // An activity is not due for a week if
  //  - it is archived
  //  - it is not active
  //  - it is from an activityType that don't need work every week, and this
  //    is one of these weeks
  // 
  // If date is present, we check the current activities.
  // If date is of a past week, we check the activity records for the last
  // day of that week.

  const activity = selectActivityByIdAndDate(state, activityId, date.endOf("week"))

  if(!activity){
    return false
  }
  
  // TODO: GET THE HISTORICAL VERSION OF THE GOAL
  if(!isActiveSelector(state, activityId, date.endOf("week"))){
    return false
  }

  const activityType = activityTypes[activity.type]

  if(activityType.dueThisWeek){
    return activityType.dueThisWeek(state, activityId, date)
  }else{
    return true
  }
}

