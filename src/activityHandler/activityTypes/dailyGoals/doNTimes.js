import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List } from 'react-native-paper'
import { toggleCompleted, selectEntryByActivityIdAndDate, selectActivityById } from '../../../redux'
import { ActivityListItemColors } from '../../../styles/Colors'
import { Checkbox } from '../../../components'


const DoNTimesTodayListItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const activity = useSelector((state) => selectActivityById(state, activityId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))

  return(
    <View style={{ backgroundColor: ActivityListItemColors.listItemBackground }}>
      <List.Item
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
        title={activity.name}
        onPress={() => {
          navigation.navigate('ActivityDetail', {activityId, date: date.toISO()})
        }}
      />
    </View>
  )
}

function renderTodayScreenItem( activity, date ){
  return <DoNTimesTodayListItem activityId={activity.id} date={date} />
}

export default { renderTodayScreenItem }