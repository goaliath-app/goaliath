import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { toggleCompleted, selectEntryByActivityIdAndDate, selectActivityByIdAndDate } from '../../../redux'
import { Checkbox, ActivityListItem } from '../../../components'


const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))

  return(
    <ActivityListItem
      activity={activity}
      entry={entry}
      date={date}
      left={() => (
        <Checkbox 
          color='black'
          uncheckedColor='black'
          status={entry.completed?'checked':'unchecked'}
          onPress={() => {
            dispatch(toggleCompleted({date: date, id: activityId}))
          }}
        />
      )}
    />
  )
}

function getFrequencyString(state, activityId, t){
  return t('activityHandler.dailyGoals.doOneTime.frequencyString')
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