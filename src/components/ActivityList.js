import React from 'react';
import { FlatList } from 'react-native';
import { TodayScreenItem } from '../activityHandler'

const renderItem = (date, { item }) => {
  return <TodayScreenItem activityId={item.id} date={date} />
}

const ActivityList = ({ data, date, disabled=false }) => (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(date, {item: {...item, disabled}})}
      />
)

export default ActivityList;