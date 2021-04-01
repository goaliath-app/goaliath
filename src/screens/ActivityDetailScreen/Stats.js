import React from 'react';
import { View } from 'react-native'
import { List, Divider } from 'react-native-paper';

const GenericStats = () => (
    <View>
      <List.Item title='Stats' />
      <List.Item
        left={() => <List.Icon icon="clock-outline" />}
        title={data.hours + ' total hours dedicated'}
      />
      <List.Item
        left={() => <List.Icon icon="check-circle-outline" />}
        title={data.times + ' days completed'}
      />
      <Divider />
    </View>
  )
  
const WeekStats = () => (
  <View>
    <List.Item title='This Week' />
    <List.Item
    left={() => <List.Icon icon="clock-outline" />}
    title={data.weekHours + ' total hours dedicated'}
    />
    <List.Item
    left={() => <List.Icon icon="check-circle-outline" />}
    title={data.weekTimes + ' days completed'}
    />
    <Divider />
  </View>
)

export { GenericStats, WeekStats }