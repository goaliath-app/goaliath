import React from 'react';
import { useSelector } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry } from '../../redux'
import { getWeeklyStats, isActive } from '../../util'
import { WeeklyListItem } from '../../components'
import { List } from 'react-native-paper'
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

export default { 
  SelectWeekliesItemDue,
  TodayScreenItem,
}