import React from 'react';
import { useSelector } from 'react-redux';
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { isActive } from '../../util'
import { List } from 'react-native-paper'
import dailyGoals from './dailyGoals'

function updateEntryThunk( activityId, date ){
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

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityById(state, activityId) )

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  const DailyGoalTodayScreenItem = dailyGoal.TodayScreenItem

  return <DailyGoalTodayScreenItem activityId={activityId} date={date} />
}

export default {
  updateEntryThunk,
  TodayScreenItem
}