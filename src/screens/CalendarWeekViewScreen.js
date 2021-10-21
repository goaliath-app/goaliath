import React from 'react';
import { View } from 'react-native';
import { Header } from '../components';

const CalendarWeekViewScreen = ({ navigation }) => (
  <View>
    <Header title={'Week View'} left='back' navigation={navigation}/>
  </View>
)

export default CalendarWeekViewScreen;
