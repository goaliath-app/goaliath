import React from 'react';
import { View } from 'react-native'
import { DateTime } from 'luxon'
import { Header, DayContent } from '../components' 
import {  GeneralColor } from '../styles/Colors';

const DayInCalendarScreen = ({ route, navigation }) => {
  const isoDate = route.params.isoDate
  const dateTime = DateTime.fromISO(isoDate)

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={dateTime.toFormat("d MMMM yyyy")} left='back' navigation={navigation}/>
      <DayContent date={dateTime} />
    </View>
  )
}

export default DayInCalendarScreen

