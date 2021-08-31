import React from 'react';
import { List } from 'react-native-paper'
import { useSelector } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { getWeeklyStats, isActive } from '../../util'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../components'
import dailyGoals from './dailyGoals'
import { useTranslation } from 'react-i18next';

const TodayScreenItem = ({ activityId, date }) => {
  const activity = useSelector( state => selectActivityById(state, activityId) )

  const dailyGoal = dailyGoals[activity.params.dailyGoal.type]
  const DailyGoalTodayScreenItem = dailyGoal.TodayScreenItem

  return <DailyGoalTodayScreenItem activityId={activityId} date={date} />
}

function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  const { t, i18n } = useTranslation()
  
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, today, activity.id))

  const daysLeft = activity.params.days - daysDoneCount

  return(
    <WeeklyListItem 
      name={activity.name}
      description={t('weeklyActivities.daysLeft', {daysLeft: daysLeft})}
      id={activity.id}
      checkboxStatus={isChecked} 
      onCheckboxPress={onCheckboxPress} 
      selected={isSelected} 
      onPress={onPress}
      date={today}
    /> 
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

export default { 
  SelectWeekliesItemDue,
  TodayScreenItem,
  WeekView,
}