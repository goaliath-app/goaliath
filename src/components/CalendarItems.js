import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
import { CalendarColor } from '../styles/Colors';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { getWeekCompletionRatio, getDayCompletionRatio } from '../activityHandler'

const CalendarDayItem = ({ today, navigation, day, currentMonth }) => {
  const dayProgress = useSelector((state)=>getDayCompletionRatio(state, day))

  return(
    <LongPressGestureHandler
      onHandlerStateChange={(event) => { 
        if(event.nativeEvent.state === State.ACTIVE) {
          navigation.navigate('CalendarDayView')
        } 
      }}
      minDurationMs={800}
    >
      <View style={styles.dayComponent}>
        <View style={{ flex: 1, justifyContent: 'center', margin: 2 }}>
          {/* Day ProgressBar */}
          <ProgressBar 
          progress={dayProgress} 
          height='100%' 
          color={CalendarColor.dayProgress} 
          borderWidth={0} 
          borderRadius={0} 
          width={null} 
          style={{ transform: [{ rotate: '-90deg' }]}}
          />
          <View style={{ position: 'absolute', flex: 1, alignSelf: 'center' }}>
            {today.day===day.day && today.month===day.month && today.year===day.year? 
            <View style={styles.todayView}>
              <Text style={{ color: CalendarColor.todayTextColor }}>
                {day.toFormat('d')}
              </Text>
            </View>
            :
            currentMonth.toFormat('L')==day.month?
            <Text>{day.toFormat('d')}</Text>
            :
            <Text style={{color: CalendarColor.dayOtherMonth}}>{day.toFormat('d')}</Text>
            }
            
          </View>
        </View>
      </View>
    </LongPressGestureHandler>
)}

/* TODO: Add a screen with the activities for weeks and days */
const CalendarWeekItem = ({ date, currentMonth, navigation, startOfWeek, today }) => {
  const dayPosition = ((date.weekday % 7) - startOfWeek) % 7

  const weekProgress = useSelector((state) => getWeekCompletionRatio(state, date))

  return(
    <Pressable onPress={() => navigation.navigate('CalendarWeekView')}>
      <View>
        <View style={styles.weekComponent}>
          <CalendarDayItem today={today} day={date.plus({days: (0 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (1 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (2 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (3 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (4 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (5 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
          <CalendarDayItem today={today} day={date.plus({days: (6 - dayPosition)})} currentMonth={currentMonth} navigation={navigation} />
        </View>

        {/* Week ProgressBar */}
        <View style={{ marginHorizontal: 2, marginBottom: 10 }}>
          <ProgressBar 
            progress={weekProgress} 
            height={7} 
            color={CalendarColor.progressBarColor} 
            borderWidth={0} 
            borderRadius={0} 
            width={null} 
          />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  weekComponent: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },

  dayComponent: {
    flex: 1, 
    aspectRatio: 1,
  },

  todayView: {
    backgroundColor: CalendarColor.today, 
    borderRadius: 30, 
    width: 30, 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center'
  }

})

export default CalendarWeekItem;