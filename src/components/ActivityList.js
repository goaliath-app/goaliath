import React from 'react';
import { FlatList } from 'react-native';
import ActivityListItem from './ActivityListItem'
import ActivityHandler from '../activityHandler/activityHandler'

const renderItem = ({ item }) => {
  const handler = new ActivityHandler( { activity: item.activity, entry: item.entry, date: item.date } )
  return handler.getActivityListItem()
}

const ActivityList = ({ data, disabled=false }) => (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem({item: {...item, disabled}})}
      />
)

export default ActivityList;