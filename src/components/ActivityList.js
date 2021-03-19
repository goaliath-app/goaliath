import React from 'react';
import { FlatList } from 'react-native';
import ActivityListItem from './ActivityListItem'

const renderItem = ({ item }) => (
    <ActivityListItem 
      {...item}
    />
)

const ActivityList = ({ data }) => (
      <FlatList
        data={data}
        renderItem={renderItem}
      />
)

export default ActivityList;