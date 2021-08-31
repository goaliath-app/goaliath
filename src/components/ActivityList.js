import React from 'react';
import { FlatList } from 'react-native';
import { TodayScreenItem } from '../activityHandler'

const renderItem = ({ item }) => {
  return <TodayScreenItem activityId={item.activity.id} date={item.date} />
}

const ActivityList = ({ data, disabled=false }) => (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem({item: {...item, disabled}})}
      />
)

export default ActivityList;