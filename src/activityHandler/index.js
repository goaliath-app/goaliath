import React from 'react';
import { useSelector } from 'react-redux'
import { selectActivityById, createOrUnarchiveEntry, archiveOrDeleteEntry } from "../redux"
import activityTypes from './activityTypes'

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
  const activity = useSelector( state => selectActivityById( state, activityId ) )

  const activityType = activityTypes[activity.type]
  const ActivityTypeTodayScreenItem = activityType.TodayScreenItem

  return (
    ActivityTypeTodayScreenItem?
      <ActivityTypeTodayScreenItem activityId={activityId} date={date} />
      : 
      null 
  )
}

export function renderSelectWeekliesItemDue( activity, today, isChecked, onCheckboxPress, isSelected, onPress ){
  const activityType = activityTypes[activity.type]
  const render = activityType.renderSelectWeekliesItemDue

  if ( render ){
    return render( activity, today, isChecked, onCheckboxPress, isSelected, onPress )
  }else{
    return <></>
  }
}

export function renderSelectWeekliesItemCompleted( activity, today, isChecked, onCheckboxPress, isSelected, onPress ){
  // TODO
  return <></>
}

/* ATM solely for creating entry of weekly activities when they are selected in the SelectWeekliesScreen */
export function addEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(createOrUnarchiveEntry(date, activityId))
  }
}

/* ATM solely for removing entry of weekly activities when they are selected in the SelectWeekliesScreen */
export function removeEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(archiveOrDeleteEntry(date, activityId))
  }
}