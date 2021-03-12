import React from 'react';
import { FlatList } from 'react-native';
import ActivityListItem from './ActivityListItem'

const renderItem = ({ item }) => (
    <ActivityListItem 
      name={item.title}
      timeGoal={item.timeGoal}
      completed={item.completed}
      current={item.current}
      period={item.period}
      todayTime={item.todayTime}
      weeklyTimesObjective={item.weeklyTimesObjective}
      weeklyTimes={item.weeklyTimes}
      weeklyTime={item.weeklyTime}
      weeklyTimeGoal={item.weeklyTimeGoal}
/>
)

const ActivityList = ({ data }) => (
      <FlatList
        data={data}
        renderItem={renderItem}
      />
)

export default ActivityList;