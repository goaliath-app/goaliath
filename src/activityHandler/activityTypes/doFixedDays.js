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

function usesRepetitions(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]

  if(dailyGoal.usesRepetitions){
    return dailyGoal.usesRepetitions(state, activityId, date)
  }else{
    return false
  }
}

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityByIdAndDate(state, activityId, date) )

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  const DailyGoalTodayScreenItem = dailyGoal.TodayScreenItem

  return <DailyGoalTodayScreenItem activityId={activityId} date={date} />
}

function getFrequencyString(state, activityId, t, date=null){
  const activity = date? selectActivityByIdAndDate(state, activityId, date)
    : selectActivityById(state, activityId)

  const dailyGoalName = activity.params.dailyGoal.type
  const dailyGoal = dailyGoals[dailyGoalName]
  
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

  let longString, shortString

  if( isEveryDay ){
    longString = t('activityHandler.activityTypes.doFixedDays.everyDayFrequencyString')
    shortString = longString
  }else{
    let daysOfWeekShort = ''
    const labelsShort = {
      1: t('units.dayNamesShort3.monday'), 
      2: t('units.dayNamesShort3.tuesday'), 
      3: t('units.dayNamesShort3.wednesday'), 
      4: t('units.dayNamesShort3.thursday'), 
      5: t('units.dayNamesShort3.friday'), 
      6: t('units.dayNamesShort3.saturday'), 
      7: t('units.dayNamesShort3.sunday')
    }
    for (let day in activity.params.daysOfWeek){
      if (activity.params.daysOfWeek[day]){
        if(daysOfWeekShort == ""){
          daysOfWeekShort = labelsShort[day]
        }else{
          daysOfWeekShort = `${daysOfWeekShort}, ${labelsShort[day]}`
        }
      }
    }
  
    let daysOfWeekLong = ''
    const labelsLong = {
      1: t('units.dayNames.monday'), 
      2: t('units.dayNames.tuesday'), 
      3: t('units.dayNames.wednesday'), 
      4: t('units.dayNames.thursday'), 
      5: t('units.dayNames.friday'), 
      6: t('units.dayNames.saturday'), 
      7: t('units.dayNames.sunday')
    }
    for (let day in activity.params.daysOfWeek){
      if (activity.params.daysOfWeek[day]){
        if(daysOfWeekLong == ""){
          daysOfWeekLong = labelsLong[day]
        }else{
          daysOfWeekLong = `${daysOfWeekLong}, ${labelsLong[day]}`
        }
      }
    }
  
    shortString = t('activityHandler.activityTypes.doFixedDays.frequencyString', { daysOfWeek: daysOfWeekShort }) 
    longString = t('activityHandler.activityTypes.doFixedDays.frequencyString', { daysOfWeek: daysOfWeekLong })
  }
  
  if(dailyGoalName == 'doOneTime'){
    shortString = shortString.charAt(0).toUpperCase() + shortString.slice(1)
    longString = longString.charAt(0).toUpperCase() + longString.slice(1)
  }else{
    shortString = dailyGoalString + ' ' + shortString
    longString = dailyGoalString + ' ' + longString
  }

  return(
    longString.length < 40 ? longString : shortString
  )
}

function getWeekProgressString(state, activityId, date, t){
  return getFrequencyString(state, activityId, t, date)
}

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  // getWeekActivityCompletionRatio can call this function on an activity
  // that is not of type 'doFixedDays', so we need to check if the activity
  // has a dailyGoal
  if(!activity.params.dailyGoal){
    return 0
  }

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

function getTimeGoal(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  if( !activity?.params.dailyGoal ) return null

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  
  if( !dailyGoal?.getTimeGoal ) return null
  
  return dailyGoal.getTimeGoal(state, activityId, date)
}

export default {
  dueToday,
  updateEntryThunk,
  TodayScreenItem,
  getFrequencyString,
  getWeekProgressString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio,
  usesRepetitions,
  getTimeGoal,
}