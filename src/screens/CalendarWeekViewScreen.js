import React from 'react';
import { ScrollView, View } from 'react-native';
import { Header } from '../components';
import { CalendarWeekItem } from '../components';

const CalendarWeekViewScreen = ({ navigation, route }) => {
  const { date } = route.params

  return(
    <View>
      <Header title={'Week View'} left='back' navigation={navigation} />
      <ScrollView >
        <View style={{paddingVertical: 15, paddingHorizontal: 30}}>
          <CalendarWeekItem date={date} showDayNumbers={false} />
        </View>
      </ScrollView>
    </View>
  )
}

export default CalendarWeekViewScreen;
