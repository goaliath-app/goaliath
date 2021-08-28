import React from 'react';
import { FlatList } from 'react-native';
import { renderTodayScreenItem } from '../activityHandler'

const renderItem = ({ item }) => {
  return renderTodayScreenItem( item.activity, item.date )
}

const ActivityList = ({ data, disabled=false }) => (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem({item: {...item, disabled}})}
      />
)

export default ActivityList;