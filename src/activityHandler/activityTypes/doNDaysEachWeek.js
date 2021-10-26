import React from 'react';
import { Text } from 'react-native-paper'
import { useSelector } from 'react-redux'
import { selectActivityById, selectActivityByIdAndDate, getWeeklyStats, selectEntryByActivityIdAndDate } from '../../redux'
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

const WeekView = ({ activityId, date, todayChecked }) => {
  // selectors
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, date, activityId))
  const activity = useSelector( state => selectActivityById(state, activityId) )

  // calculations
  const daysLeft = activity.params.days - daysDoneCount - (todayChecked=='checked'?1:0)
  
  let daysLeftList = []
  for(let i = date.weekday+1; i < date.weekday+1 + daysLeft && i < 8; i++){
    daysLeftList.push(i)
  }
  
  const daysDone = (
    todayChecked=='checked'?
      [ ...daysDoneList, date.weekday ]
    : 
      daysDoneList
  )

  return (
    <BaseWeekView dayOfWeek={date.weekday} daysDone={daysDone} daysLeft={daysLeftList} />
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

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
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
  WeekView,
  isWeekCompleted,
  getFrequencyString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { daysDoneCount } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityByIdAndDate(state, activityId, date)
  const daysTarget = activity.params.days

  return daysDoneCount >= daysTarget
}