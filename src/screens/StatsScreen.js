import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { DayContent } from '../components'
import { Header } from '../components';
import { getTodaySelector } from '../redux'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

const StatsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('statsScreen.headerTitle')} left='hamburger' navigation={navigation} />
    </View>
  );
}

export default StatsScreen
