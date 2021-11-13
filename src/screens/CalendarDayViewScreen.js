import React from 'react';
import { View } from 'react-native';
import { DayContent, Header } from '../components';
import { DateTime } from "luxon"
import { GeneralColor } from '../styles/Colors';
import { useTranslation } from 'react-i18next'

const CalendarDayViewScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  
  const date = DateTime.fromISO(route.params.date)
  const monthLabel = t('units.monthNames.' + date.toFormat('MMMM').toLowerCase())

  return(
    <View style={{ backgroundColor: GeneralColor.screenBackground, flex: 1 }}>
      <Header title={t('calendar.dayView.header', {month: monthLabel, day: date.toFormat('d'), year: date.toFormat('yyyy')})} left='back' navigation={navigation} />
      <DayContent date={date} />
    </View>
  )
}

export default CalendarDayViewScreen;