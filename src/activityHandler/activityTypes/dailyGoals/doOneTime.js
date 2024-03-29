import React from 'react';
import { withTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { toggleCompleted, selectEntryByActivityIdAndDate, selectActivityByIdAndDate, selectGoalById } from '../../../redux'
import { Checkbox, ActivityListItem } from '../../../components'
import { useTranslation } from 'react-i18next'

const TodayScreenItem = withTheme(({ activityId, date, theme }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const goal = useSelector((state) => selectGoalById(state, activity.goalId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const { t, i18 } = useTranslation()
  
  return(
    <ActivityListItem
      activity={activity}
      goal={goal}
      entry={entry}
      date={date}
      left={() => (
        <Checkbox 
          color={theme.colors.todayCompletedIcon}
          uncheckedColor={theme.colors.todayDueIcon}
          status={entry.completed?'checked':'unchecked'}
          onPress={() => {
            dispatch(toggleCompleted({date: date, id: activityId}))
          }}
        />
      )}
      leftTooltipText={t('tooltips.checkboxIcon')}
      leftTooltipName={'DoOnceListItemTooltip'}
      leftTooltipKey={'DoOnceListItemTooltip'+activityId}
    />
  )
})

function getFrequencyString(state, activityId, t){
  return '' 
  // I removed the previous string since it is obvious and unneccessary.
  // t('activityHandler.dailyGoals.doOneTime.frequencyString')
}

export function getDayActivityCompletionRatio(state, activityId, date){
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)

  if(!entry){
    return 0
  }else if(entry.completed){
    return 1
  }else if(entry.repetitions?.length > 0 || entry.intervals.length > 0){
    return 0.1
  }else{
    return 0
  }
}

export default { TodayScreenItem, getFrequencyString, getDayActivityCompletionRatio }