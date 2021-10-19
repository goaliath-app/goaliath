import React from 'react';
import { useSelector } from 'react-redux';
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry, selectActivityByIdAndDate } from '../../redux'
import { isActive } from '../../util'
import dailyGoals from './dailyGoals'

function updateEntryThunk( activityId, date ){
  return function(dispatch, getState){
    const state = getState()
    const activity = selectActivityById( state, activityId )
    const goal = selectGoalById( state, activity.goalId )
      
    // if activity is active and this day is one of the selected days of the week
    if( isActive(activity, goal) && activity.params.daysOfWeek[date.weekday] ){
      dispatch( createOrUnarchiveEntry(date, activity.id) )
    }else{
      dispatch( archiveOrDeleteEntry(date, activity.id) )
    }
  }
}

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityByIdAndDate(state, activityId, date) )

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  const DailyGoalTodayScreenItem = dailyGoal.TodayScreenItem

  return <DailyGoalTodayScreenItem activityId={activityId} date={date} />
}

function getFrequencyString(state, activityId, t, date=null){
    const activity = selectActivityByIdAndDate(state, activityId, date)

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  
  const dailyGoalString = (
    dailyGoal.getFrequencyString? 
    dailyGoal.getFrequencyString(state, activityId, t) : '<NO DAILYGOAL STRING>'
  )

  let isEveryDay = true
  for(let day in activity.params.daysOfWeek){
    if(!activity.params.daysOfWeek[day]){
      isEveryDay = false
      break
    }
  }

  if( isEveryDay ){
    return dailyGoalString + ' ' + t('activityHandler.activityTypes.doFixedDays.everyDayFrequencyString')
  }
  
  let daysOfWeek = ''
  const labels = {
    1: t('units.dayNamesShort2.monday'), 
    2: t('units.dayNamesShort2.tuesday'), 
    3: t('units.dayNamesShort2.wednesday'), 
    4: t('units.dayNamesShort2.thursday'), 
    5: t('units.dayNamesShort2.friday'), 
    6: t('units.dayNamesShort2.saturday'), 
    7: t('units.dayNamesShort2.sunday')
  }
  for (let day in activity.params.daysOfWeek){
    if (activity.params.daysOfWeek[day]){
      daysOfWeek = `${daysOfWeek} ${labels[day]}`
    }
  }

  return(
    dailyGoalString + ' ' + t('activityHandler.activityTypes.doFixedDays.frequencyString', { daysOfWeek })
  )
}

export function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]

  return dailyGoal.getDayActivityCompletionRatio(state, activityId, date)
}

export default {
  updateEntryThunk,
  TodayScreenItem,
  getFrequencyString,
  getDayActivityCompletionRatio,
}