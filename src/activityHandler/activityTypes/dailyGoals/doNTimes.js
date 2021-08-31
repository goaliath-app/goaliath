import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List } from 'react-native-paper'
import { toggleCompleted, selectEntryByActivityIdAndDate, selectActivityById } from '../../../redux'
import { ActivityListItemColors } from '../../../styles/Colors'
import { Checkbox, ActivityListItem } from '../../../components'


const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const activity = useSelector((state) => selectActivityById(state, activityId))
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

export default { TodayScreenItem }