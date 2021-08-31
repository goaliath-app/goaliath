import React from 'react';
import { useSelector } from 'react-redux'
import { selectActivityById, createOrUnarchiveEntry, archiveOrDeleteEntry } from "../redux"
import { updateEntryThunkIndex, renderSelectWeekliesItemDueIndex, todayScreenItemIndex } from './activityTypes'

import { List } from 'react-native-paper'

export function updateEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    const state = getState()
    const activity = selectActivityById( state, activityId )
  
    const thunk = updateEntryThunkIndex[ activity.type ]
  
    if( thunk ){
      dispatch(thunk(activityId, date))
    }
  }
}

export const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityById( state, activityId ) )
  const ActivityTypeTodayScreenItem = todayScreenItemIndex[ activity.type ]

  return (
    ActivityTypeTodayScreenItem?
      <ActivityTypeTodayScreenItem activityId={activityId} date={date} />
      : 
      null 
  )
}

export function renderSelectWeekliesItemDue( activity, today, isChecked, onCheckboxPress, isSelected, onPress ){
  const render = renderSelectWeekliesItemDueIndex[ activity.type ]

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