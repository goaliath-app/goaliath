import React from 'react';
import { View, ActivityIndicator } from 'react-native'
import { Divider, List, withTheme } from 'react-native-paper';

import { ActivityBarChartPicker } from './BarCharts'
import { default as ActivityCalendarHeatmap } from './CalendarHeatmap'
import { default as GenericStats } from './GenericStats'
import { loadedComponent, FullScreenActivityIndicator } from '../components/Loading'
import { useTranslation } from 'react-i18next'

const StatsPannel = ({ activityId, goalId }) => {
  const { t, i18n } = useTranslation()

  return (
    <View>
      <GenericStats activityId={activityId} goalId={goalId} /> 
      <List.Item title={t('stats.heatmapTitle')} />
      <ActivityCalendarHeatmap activityId={activityId} goalId={goalId}/>
      <Divider style={{marginTop: 20}}/>
      <List.Item title={t('stats.barchartTitle')} />
      <ActivityBarChartPicker activityId={activityId} goalId={goalId} />
    </View>
  )
}

export default loadedComponent(StatsPannel, FullScreenActivityIndicator)