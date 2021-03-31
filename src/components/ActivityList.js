import React from 'react';
import { FlatList } from 'react-native';
import ActivityListItem from './ActivityListItem'

const renderItem = ({ item }) => (
    <ActivityListItem 
      {...item}
    />
)

const ActivityList = ({ data, disabled=false }) => (
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem({item: {...item, disabled}})}
      />
)

export default ActivityList;