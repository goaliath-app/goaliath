import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { toggleCompleted, selectEntryByActivityIdAndDate } from '../../../redux'
import { selectActivityByIdAndDate } from '../../../util'
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

export default { TodayScreenItem, getFrequencyString }