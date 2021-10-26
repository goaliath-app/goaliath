import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { DayContent } from '../components'
import { Header } from '../components';
import { getTodaySelector } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

const TodayScreen = ({ navigation }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  // selectors
  const today = useSelector(getTodaySelector)

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      <DayContent date={today} />
    </View>
  );
}

export default TodayScreen
