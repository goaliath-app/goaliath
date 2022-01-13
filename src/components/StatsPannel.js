import React from 'react';
import { View } from 'react-native'
import { Paragraph, Divider, List } from 'react-native-paper';

import { ActivityBarChartPicker } from './BarCharts'
import { default as ActivityCalendarHeatmap } from './CalendarHeatmap'
import { default as GenericStats } from './GenericStats'
import { loadedComponent } from '../components/Loading'

const StatsPannel = ({ activityId, goalId }) => (
  <View>
    <GenericStats activityId={activityId} goalId={goalId} /> 
    <List.Item title={'Activity'} />
    <ActivityCalendarHeatmap activityId={activityId} goalId={goalId}/>
    <Divider style={{marginTop: 20}}/>
    <List.Item title={'Stats'} />
    <ActivityBarChartPicker activityId={activityId} goalId={goalId} />
  </View>
)

/* TODO TRANSLATE */
const Placeholder = () => {
  return (
    <List.Item title='Loading Stats...' />
  )
}

export default loadedComponent(StatsPannel, Placeholder)