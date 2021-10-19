import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Subheading } from 'react-native-paper';
import ProgressBar from 'react-native-progress/Bar';
import { CalendarColor } from '../styles/Colors';

/* TODO: Al mantener pulsado un día, que salga la pantalla de ese día.
         Si el día es de otro mes, que salga con un estilo diferente. */
const CalendarDayItem = ({ today, day }) => (
  <View style={styles.dayComponent}>
    <View style={{flex: 1, justifyContent: 'center', margin: 5}}>
      {/* Day ProgressBar */}
      <ProgressBar 
      progress={1} 
      height='100%' 
      color={CalendarColor.dayProgress} 
      borderWidth={0} 
      borderRadius={0} 
      width={null} 
      style={{ transform: [{ rotate: '-90deg' }]}}
      />
      <View style={{position: 'absolute', flex: 1, alignSelf: 'center'}}>
        {today.day===day.day && today.month===day.month && today.year===day.year? 
        <View style={styles.todayView}>
          <Subheading style={{color: CalendarColor.todayTextColor, fontWeight: 'bold' }}>
            {day.toFormat('d')}
          </Subheading>
        </View>
        :
        <Subheading>{day.toFormat('d')}</Subheading>
         }
        
      </View>
    </View>
  </View>
)

/* TODO: Add a screen with the activities for weeks and days */
const CalendarWeekItem = ({ date, startOfWeek, today }) => {
  const dayPosition = ((date.weekday % 7) - startOfWeek) % 7

  return(
    <View>
      <Pressable onPress={() => {}}>
        <View style={styles.weekComponent}>
          <CalendarDayItem today={today} day={date.plus({days: (0 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (1 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (2 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (3 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (4 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (5 - dayPosition)})} />
          <CalendarDayItem today={today} day={date.plus({days: (6 - dayPosition)})} />
        </View>

        {/* Week ProgressBar */}
        <View style={{marginHorizontal: 5, marginBottom: 15}}>
          <ProgressBar 
            progress={0.5} 
            height={20} 
            color={CalendarColor.progressBarColor} 
            borderWidth={0} 
            borderRadius={0} 
            width={null} 
          />
        </View>
      </Pressable>

    </View>
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
    borderRadius: 50, 
    width: 50, 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center'
  }

})

export default CalendarWeekItem;