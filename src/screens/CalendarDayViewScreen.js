import React from 'react';
import { View } from 'react-native';
import { DayContent, Header } from '../components';
import { DateTime } from "luxon"
import { GeneralColor } from '../styles/Colors';

const CalendarDayViewScreen = ({ navigation, route }) => {
  const date = DateTime.fromISO(route.params.date)
  return(
    <View style={{ backgroundColor: GeneralColor.screenBackground, flex: 1 }}>
      <Header title={date.toFormat("dd-MM-yyyy")} left='back' navigation={navigation} />
      <DayContent date={date} />
    </View>
  )
}

export default CalendarDayViewScreen;