import React from 'react';
import { useSelector } from 'react-redux'
import { selectActivityById, createOrUnarchiveEntry, archiveOrDeleteEntry, selectGoalById, selectActivityByIdAndDate, selectAllActiveActivities } from "../redux"
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
