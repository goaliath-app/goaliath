import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { DayContent } from '../components'
import { Header } from '../components';
import { getTodaySelector } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

import { CalendarHeatmap } from './../components/CalendarHeatmap'
import { VictoryBarChart } from './../screens/ActivityDetailScreen/Stats'


const TodayScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  // selectors
  const today = useSelector(getTodaySelector)

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      <DayContent date={today} />
      <CalendarHeatmap 
        data={[
          {date: '2021-10-07', color: 'red'},
          {date: '2021-10-08', strength: 0.2},
          {date: '2021-10-09', strength: 0.25},
          {date: '2021-10-10', strength: 0.5},
          {date: '2021-10-11', strength: 0.75},
          {date: '2021-10-12', strength: 1},
          {date: '2021-10-13', value: 10},
          {date: '2021-10-14', value: 7},
          {date: '2021-10-15', value: 3},
          {date: '2021-10-16', value: 1},
          {date: '2021-11-04'},
        ]}
        domain={{ start: '2021-10-07', end: '2021-12-20' }}
        weekStart={1}
      />
      <VictoryBarChart />
    </View>
  );
}

export default TodayScreen
