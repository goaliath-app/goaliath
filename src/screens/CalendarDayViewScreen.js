import React from 'react';
import { View } from 'react-native';
import { Header } from '../components';

const CalendarDayViewScreen = ({ navigation }) => (
  <View>
    <Header title={'Day View'} left='back' navigation={navigation} />
  </View>

)

export default CalendarDayViewScreen;