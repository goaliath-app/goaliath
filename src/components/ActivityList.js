import React from 'react';
import { FlatList } from 'react-native';
import ActivityListItem from './ActivityListItem'

const renderItem = ({ item }) => (
    <ActivityListItem 
      name={item.title}
      timeGoal={item.timeGoal}
      completed={item.completed}
      repeatMode={item.repeatMode}
      weeklyTimesObjective={item.weeklyTimesObjective}
      weeklyTimes={item.weeklyTimes}
      weeklyTime={item.weeklyTime}
      weeklyTimeGoal={item.weeklyTimeGoal}
      intervals={item.intervals}
/>
)

const ActivityList = ({ data }) => (
      <FlatList
        data={data}
        renderItem={renderItem}
      />
)

export default ActivityList;