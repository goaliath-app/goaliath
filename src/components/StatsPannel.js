import React from 'react';
import { View } from 'react-native'
import { Paragraph, Divider, List } from 'react-native-paper';

import { ActivityBarChartPicker } from './BarCharts'
import { default as ActivityCalendarHeatmap } from './CalendarHeatmap'
import { default as GenericStats } from './GenericStats'

const StatsPannel = ({ activityId }) => (
  <View>
    <GenericStats activityId={activityId} /> 
    <List.Item title={'Activity'} />
    <ActivityCalendarHeatmap activityId={activityId}/>
    <Divider style={{marginTop: 20}}/>
    <List.Item title={'Stats'} />
    <ActivityBarChartPicker activityId={activityId} />
    <View style={{height:100}} />
  </View>
)

export default StatsPannel