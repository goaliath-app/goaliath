import React from 'react';
import { useSelector } from 'react-redux';
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry, selectActivityByIdAndDate, 
    isActiveSelector } from '../../redux'
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

function getWeekProgressString(state, activityId, date, t){
  return getFrequencyString(state, activityId, t, date)
}

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]

  return dailyGoal.getDayActivityCompletionRatio(state, activityId, date)
}

function getWeekActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  let numberOfDaysGoal = 0
  Object.values(activity.params.daysOfWeek).forEach( day => {
    if(day){ 
      numberOfDaysGoal += 1
    }
  })

  const weekStartDate = date.startOf('week')
  const weekEndDate = date.endOf('week')

  let completionAccumulator = 0
  for(let day = weekStartDate; day <= weekEndDate; day = day.plus({days: 1})){
    const entry = selectEntryByActivityIdAndDate(state, activityId, day)
    if( entry && !entry.archived ){
      completionAccumulator += getDayActivityCompletionRatio(state, activityId, day)
    }
  }

  if( numberOfDaysGoal == 0 ){
    return 1
  } else {
    return Math.min( 1, completionAccumulator / numberOfDaysGoal )
  }
}

// returns true if the activity has to be done in the given date,
// and not doing it that exact day would be considered a "failure"
function dueToday(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  if(!activity){
    return false
  }

  if(!isActiveSelector(state, activityId, date)){
    return false
  }

  const daysOfWeek = activity.params.daysOfWeek
  if(daysOfWeek[date.weekday]){
    return true
  }else{
    return false
  }
}

export default {
  dueToday,
  updateEntryThunk,
  TodayScreenItem,
  getFrequencyString,
  getWeekProgressString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio,
}