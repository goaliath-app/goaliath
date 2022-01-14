import React from 'react';
import { View } from 'react-native';
import { TodayScreenItem } from '../activityHandler'

const renderItem = (date, { item }) => {
  return <TodayScreenItem activityId={item.id} date={date} />
}

const ActivityList = ({ data, date, disabled=false }) => (
  <View>
    {data.map(item => renderItem(date, {item: {...item, disabled}}))}
  </View>
)

export default ActivityList;