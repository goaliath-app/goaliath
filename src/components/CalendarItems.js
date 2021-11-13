import React from 'react';
import { useTranslation } from 'react-i18next'
import { getTodaySelector } from '../redux'
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
import { CalendarColor } from '../styles/Colors';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { dueToday, getWeekCompletionRatio, getDayCompletionRatio, getDayActivityCompletionRatio, getWeekActivityCompletionRatio } from '../activityHandler'

const CalendarDayItem = ({ 
  day, 
  currentMonth, 
  activityId, 
  showDayNumber=true, 
  softTodayHighlight=false, 
  onLongPress=()=>{}, 
  onPress=()=>{}, 
}) => {
  const today = useSelector(getTodaySelector)

  let dayProgress
  if(activityId != null){
    dayProgress = useSelector(state => getDayActivityCompletionRatio(state, activityId, day))
  } else {
    dayProgress = useSelector(state => getDayCompletionRatio(state, day))
  }

  const { t, i18n } = useTranslation()

  const daysOfWeekInitials = [
    t('units.dayNamesInitials.monday'),
    t('units.dayNamesInitials.tuesday'),
    t('units.dayNamesInitials.wednesday'),
    t('units.dayNamesInitials.thursday'),
    t('units.dayNamesInitials.friday'),
    t('units.dayNamesInitials.saturday'),
    t('units.dayNamesInitials.sunday'),
  ]

  const dayLabel = showDayNumber? day.toFormat('d') : daysOfWeekInitials[(day.weekday-1)%7]

  const isDueThisDay = useSelector(state => dueToday(state, activityId, day))
  const activityFailedThisDay = activityId != null && isDueThisDay && dayProgress == 0 && day < today
  const dayBackground = activityFailedThisDay? {backgroundColor: '#DDDDDD'} : {}

  return(
    <View style={{...styles.dayComponent, ...dayBackground}}>
      <Pressable onLongPress={() => onLongPress(day)} style={{flex: 1}} onPress={() => onPress(day)}>
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
              (softTodayHighlight?
              <View style={styles.softTodayView}>
                <Text style={{ color: CalendarColor.softTodayTextColor, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                  {dayLabel}
                </Text>
              </View>
              :
              <View style={styles.todayView}>
                <Text style={{ color: CalendarColor.todayTextColor }}>
                  {dayLabel}
                </Text>
              </View> )
            :
            currentMonth == null || currentMonth.toFormat('L')==day.month?
            <Text>{dayLabel}</Text>
            :
            <Text style={{color: CalendarColor.dayOtherMonth}}>{dayLabel}</Text>
            }
          </View>
        </View>
      </Pressable>
    </View>
)}

/* TODO: Add a screen with the activities for weeks and days */
const CalendarWeekItem = ({ 
  date,                  // (required) day belonging to the week to be shown 
  currentMonth=null,     // used to gray out days that are not in the current month, null if not used
  startOfWeek=1,         // used to determine the first day of the week, 1=Monday, 2=Tuesday, etc.
  activityId=null,       // provide an activityId to show the progress for that activity. If null, show all activities progress
  showDayNumbers=true,   // if false, show weekday initials instead of week numbers
  showWeekProgress=true, // if false, the week progress bar won't be shown
  onWeekPress=()=>{},          // function to call when the week is pressed 
  softTodayHighlight=false,  // if true, the today highlight will be a little bit softer
  onDayPress=()=>{},
  onDayLongPress=()=>{},
}) => {
  // const dayPosition = ((date.weekday % 7) - startOfWeek) % 7
  date = date.startOf("week")
  
  const navigation = useNavigation()

  let weekProgress
  if(activityId != null){
    weekProgress = useSelector((state) => getWeekActivityCompletionRatio(state, activityId, date))
  }else{
    weekProgress = useSelector((state) => getWeekCompletionRatio(state, date))
  }

  return(
    <Pressable onPress={() => onWeekPress(date)}>
      <View>
        <View style={styles.weekComponent}>
          { [0, 1, 2, 3, 4, 5, 6].map( dayNumber => (
            <CalendarDayItem  
              activityId={activityId} 
              day={date.plus({days: (dayNumber)})} 
              currentMonth={currentMonth}
              showDayNumber={showDayNumbers}
              softTodayHighlight={softTodayHighlight}
              onLongPress={onDayLongPress}
              onPress={onDayPress} />
          ))}
        </View>

        {/* Week ProgressBar */}
        {
        showWeekProgress?
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
        : null }
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

  softTodayView: {
    justifyContent: 'center', 
    alignItems: 'center'
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