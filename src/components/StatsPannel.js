import React from 'react';
import { View, ActivityIndicator } from 'react-native'
import { Divider, List, withTheme } from 'react-native-paper';

import { ActivityBarChartPicker } from './BarCharts'
import { default as ActivityCalendarHeatmap } from './CalendarHeatmap'
import { default as GenericStats } from './GenericStats'
import { loadedComponent } from '../components/Loading'
import { useTranslation } from 'react-i18next'

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

const Placeholder = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <List.Item 
      left={()=><ActivityIndicator style={{transform: [{scale: 1.2}], marginHorizontal: 6}} color={theme.colors.primary} />} 
      title={t('loadingStats')}
    />
  )
})

export default loadedComponent(StatsPannel, Placeholder)