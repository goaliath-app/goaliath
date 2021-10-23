import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { DayContent, GenericStats, ActivityCalendarHeatmap, Header, ActivityBarChartPicker, StatsPannel } from '../components'
import { getTodaySelector } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

const StatsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  return (
    <ScrollView style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('statsScreen.headerTitle')} left='hamburger' navigation={navigation} />
      <StatsPannel />
    </ScrollView>
  );
}

export default StatsScreen
