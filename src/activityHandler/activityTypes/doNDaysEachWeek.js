import React from 'react';
import { Text } from 'react-native-paper'
import { useSelector } from 'react-redux'
import { 
  selectActivityById, selectActivityByIdAndDate, getWeeklyStats, 
  selectEntryByActivityIdAndDate, isActiveSelector, archiveOrDeleteEntry,
} from '../../redux'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../components'
import dailyGoals from './dailyGoals'
import { useTranslation } from 'react-i18next';
import { SelectWeekliesColor } from '../../styles/Colors';

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityByIdAndDate(state, activityId, date) )

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  const DailyGoalTodayScreenItem = dailyGoal.TodayScreenItem

  return <DailyGoalTodayScreenItem activityId={activityId} date={date} />
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

function getWeekProgressString(state, activityId, date, t){
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const { daysDoneCount } = useSelector((state) => getWeeklyStats(state, date, activityId))

  const daysLeft = activity.params.days - daysDoneCount
  return (daysLeft == 0 ? t('activityHandler.activityTypes.doNDaysEachWeek.completed') : t('activityHandler.activityTypes.doNDaysEachWeek.daysLeft', {daysLeft}))
}

function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  const { t, i18n } = useTranslation()
  
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, today, activity.id))
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))

  const daysLeft = activity.params.days - daysDoneCount

  let description
  if(isChecked=='checked'){
    description = (
      <Text style={{color: SelectWeekliesColor.selectedActivityDescription}}>
        {t('weeklyActivities.daysLeft', {daysLeft: daysLeft-1})}
      </Text>
    )
  }else{
    description = t('weeklyActivities.daysLeft', {daysLeft})
  }

  return(
    weekCompleted?
      null
      :
      <WeeklyListItem 
        name={activity.name}
        description={description}
        id={activity.id}
        checkboxStatus={isChecked} 
        onCheckboxPress={onCheckboxPress} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
      /> 
  )
}

function SelectWeekliesItemCompleted({ activity, today, isSelected, onPress }){
  const { t, i18n } = useTranslation()
  
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, today, activity.id))
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))

  return(
    weekCompleted?
      <WeeklyListItem 
        name={activity.name}
        description={t('weeklyActivities.checkCompleted', {weeklyTimes: daysDoneCount})}
        id={activity.id}
        checkboxStatus={'checked'} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
        checkboxColor='grey'
      /> 
      :
      null
  )
}

function getFrequencyString(state, activityId, t, date=null){
    const activity = selectActivityByIdAndDate(state, activityId, date)

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  
  const dailyGoalString = (
    dailyGoal.getFrequencyString? 
    dailyGoal.getFrequencyString(state, activityId, t) : '<NO DAILYGOAL STRING>'
  )

  const days = 2

  return(
    dailyGoalString + ' ' +
    t('activityHandler.activityTypes.doNDaysEachWeek.frequencyString', { days })
  )
}

function updateEntryThunk( activityId, date ){
  return function(dispatch, getState){
    const state = getState()
    const isActive = isActiveSelector(state, activityId, date)
      
    // if activity is active and this day is one of the selected days of the week
    if( !isActive ){
      dispatch( archiveOrDeleteEntry(date, activityId) )
    }
  }
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
  const daysGoal = activity.params.days

  const weekStartDate = date.startOf('week')
  const weekEndDate = date.endOf('week')

  let completionAccumulator = 0
  for(let day = weekStartDate; day <= weekEndDate; day = day.plus({days: 1})){
    const entry = selectEntryByActivityIdAndDate(state, activityId, day)
    if( entry && !entry.archived ){
      completionAccumulator += getDayActivityCompletionRatio(state, activityId, day)
    }
  }

  if( daysGoal == 0 ){
    return 1
  } else {
    return Math.min( 1, completionAccumulator / daysGoal )
  }
}

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  isWeekCompleted,
  getFrequencyString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio,
  getWeekProgressString,
  usesRepetitions,
  updateEntryThunk,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { daysDoneCount } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityByIdAndDate(state, activityId, date)

  if(activity == null) return false

  const daysTarget = activity.params.days

  return daysDoneCount >= daysTarget
}