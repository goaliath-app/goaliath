import React from 'react';
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { isActive } from '../../util'
import { List } from 'react-native-paper'
import dailyGoals from './dailyGoals'

export function updateEntryThunk( activityId, date ){
  return function(dispatch, getState){
    const state = getState()
    const activity = selectActivityById( state, activityId )
    const goal = selectGoalById( state, activity.goalId )
    const oldEntry = selectEntryByActivityIdAndDate(state, activity.id, date)
      
    // if activity is active and this day is one of the selected days of the week
    if( isActive(activity, goal) && activity.params.daysOfWeek[date.weekday] ){
      dispatch( createOrUnarchiveEntry(date, activity.id) )
    }else{
      dispatch( archiveOrDeleteEntry(date, activity.id) )
    }
  }
}


export function renderTodayScreenItem( activity, date ){
  return dailyGoals.renderTodayScreenItemIndex[activity.params.dailyGoal.type]( activity, date )
}