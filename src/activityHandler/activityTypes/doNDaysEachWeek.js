import React from 'react';
import { List, Text } from 'react-native-paper'
import { useSelector } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { getWeeklyStats, isActive } from '../../util'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../components'
import dailyGoals from './dailyGoals'
import { useTranslation } from 'react-i18next';
import { GeneralColor, SelectWeekliesColor } from '../../styles/Colors';

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityById(state, activityId) )

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

function getFrequencyString(state, activityId, t){
  const activity = selectActivityById(state, activityId)
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

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  WeekView,
  isWeekCompleted,
  getFrequencyString,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { daysDoneCount } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityById(state, activityId)
  const daysTarget = activity.params.days

  return daysDoneCount >= daysTarget
}