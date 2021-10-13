import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import ProgressBar from 'react-native-progress/Bar';
import { CalendarColor } from '../styles/Colors';

/* TODO: Al mantener pulsado un día, que salga la pantalla de ese día.
         Que se marque el día de hoy.
         Si el día es de otro mes, que salga con un estilo diferente. */
const CalendarDayItem = ({ today, day }) => (
  <View style={styles.dayComponent}>
    <View style={styles.dayProgress}>
      <Text>{day.toFormat('d')}</Text>
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

        <View style={{marginHorizontal: 5, marginBottom: 15}}>
          <ProgressBar progress={1} height={20} color={CalendarColor.progressBarColor} borderWidth={0} borderRadius={0} width={null} />
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

  dayComponent:{
    flex: 1, 
    aspectRatio: 1,
  },

  dayProgress: {
    backgroundColor: CalendarColor.dayProgress, 
    margin: 5, 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'

  }
})

export default CalendarWeekItem;