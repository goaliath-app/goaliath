import React from 'react';
import { useTranslation } from 'react-i18next'
import { getTodaySelector } from '../redux'
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
import { CalendarColor } from '../styles/Colors';
import { 
  dueToday, getWeekCompletionRatio, getDayCompletionRatio, 
  getDayActivityCompletionRatio, getWeekActivityCompletionRatio 
} from '../activityHandler'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle, useAnimatedGestureHandler,
  runOnJS, withSequence, withDelay, interpolateColor,
} from 'react-native-reanimated'
import { 
  GestureDetector, Gesture, State 
} from 'react-native-gesture-handler';

const CalendarDayItem = ({ 
  day, 
  currentMonth, 
  activityId, 
  showDayNumber=true, 
  softTodayHighlight=false, 
  onLongPress=()=>{}, 
  onPress=()=>{}, 
  pressAnimationValue: weekAnimationValue,
  animate // 'day' or 'week'
}) => {
  const dayAnimationValue = useSharedValue(0)

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
  const dayBackground = activityFailedThisDay? '#DDDDDD' : '#6495ED00'

  const pressAnimationStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      dayAnimationValue.value,
      [0, 1],
      [dayBackground, '#6495ED']
    )

    return { backgroundColor }
  })

  function onDayPress(){
    onPress(day)
  }

  function onDayLongPress(){
    onLongPress(day)
  }

  const tapGesture = Gesture.Tap()
    .shouldCancelWhenOutside(false)
    .maxDistance(30)
    .onStart(() => runOnJS(onDayPress)())
    .onFinalize(({ state }) => {
      if (state == State.END) {
        if(animate=='day'){
          dayAnimationValue.value = withDelay(500, withTiming(0, {duration: 500}))
        }else if(animate=='week'){
          weekAnimationValue.value = withDelay(500, withTiming(0), {duration: 500})
        }
      }else if(state == State.FAILED){
        if(animate=='day'){
          dayAnimationValue.value = withTiming(0, {duration: 300})
        }else if(animate=='week'){
          weekAnimationValue.value = withTiming(0, {duration: 300})
        }
      }
    })

  const longPressGesture = Gesture.LongPress()
    .shouldCancelWhenOutside(false)
    .maxDistance(30)
    .onBegin(() => {
      if(animate=='day'){
        dayAnimationValue.value = withTiming(1, {duration: 35})
      }else if(animate=='week'){
        weekAnimationValue.value = withTiming(1, {duration: 35})
      }
    })
    .onStart(() => runOnJS(onDayLongPress)())
    .onFinalize(({ state }) => {
      if(state == State.END || state == State.CANCELLED){
        if(animate=='day'){
          dayAnimationValue.value = 0
        }else if(animate=='week'){
          weekAnimationValue.value = 0
        }
      }
    })

  const compoundGesture = Gesture.Exclusive(longPressGesture, tapGesture)

  return(
    <Animated.View style={[styles.dayComponent, pressAnimationStyle]}>
      <GestureDetector gesture={compoundGesture} >
        <View style={{ flex: 1, justifyContent: 'center' }}>
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
          {/* Today Highlight */}
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
    </GestureDetector>
  </Animated.View>
)}

const CalendarWeekItem = ({ 
  date,                  // (required) day belonging to the week to be shown 
  currentMonth=null,     // used to gray out days that are not in the current month, null if not used
  startOfWeek=1,         // used to determine the first day of the week, 1=Monday, 2=Tuesday, etc.
  activityId=null,       // provide an activityId to show the progress for that activity. If null, show all activities progress
  showDayNumbers=true,   // if false, show weekday initials instead of week numbers
  showWeekProgress=true, // if false, the week progress bar won't be shown
  softTodayHighlight=false,  // if true, the today highlight will be a little bit softer
  animate='week',  // Controls what gets animated on press. Values: 'week', 'day', or none
  onDayPress=()=>{},
  onDayLongPress=()=>{},
}) => {
  const pressAnimationValue = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - 0.3*pressAnimationValue.value,
      transform: [
        {
          scale: 1 - 0.03*pressAnimationValue.value,
        },
      ],
    }
  })

  // const dayPosition = ((date.weekday % 7) - startOfWeek) % 7
  date = date.startOf("week")
 
  let weekProgress
  if(activityId != null){
    weekProgress = useSelector((state) => getWeekActivityCompletionRatio(state, activityId, date))
  }else{
    weekProgress = useSelector((state) => getWeekCompletionRatio(state, date))
  }

  return(
    <Animated.View style={animatedStyle}>

      <View style={styles.weekComponent}>
        { [0, 1, 2, 3, 4, 5, 6].map( dayNumber => (
          <CalendarDayItem  
            activityId={activityId} 
            day={date.plus({days: (dayNumber)})} 
            currentMonth={currentMonth}
            showDayNumber={showDayNumbers}
            softTodayHighlight={softTodayHighlight}
            pressAnimationValue={pressAnimationValue}
            onLongPress={onDayLongPress}
            onPress={onDayPress} 
            animate={animate}
          />
        ))}
      </View>

      {/* Week ProgressBar */}
      {
      showWeekProgress?
      <View style={{ marginBottom: 10 }}>
        <ProgressBar 
          progress={weekProgress} 
          height={7} 
          color={CalendarColor.progressBarColor} 
          unfilledColor={CalendarColor.progressBarBackground}
          borderWidth={0} 
          borderRadius={0} 
          width={null} 
        />
      </View>
      : null }
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  weekComponent: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    backgroundColor: CalendarColor.weekBackgroundColor
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
  },
})

export default CalendarWeekItem;