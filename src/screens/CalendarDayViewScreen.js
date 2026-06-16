import React from 'react';
import { View } from 'react-native';
import { withTheme } from 'react-native-paper';
import { DayContent, Header } from '../components';
import { useTranslation } from 'react-i18next'
import { deserializeDate } from '../time';

const CalendarDayViewScreen = withTheme(({ navigation, route, theme }) => {
  const { t, i18n } = useTranslation()
  
  const date = deserializeDate(route.params.date)
  const monthLabel = t('units.monthNames.' + date.toFormat('MMMM').toLowerCase())

  return(
    <View style={{ backgroundColor: theme.colors.calendarDayViewScreenBackground, flex: 1 }}>
      <Header title={t('calendar.dayView.header', {month: monthLabel, day: date.toFormat('d'), year: date.toFormat('yyyy')})} left='back' navigation={navigation} />
      <DayContent date={date} />
    </View>
  )
})

export default CalendarDayViewScreen;