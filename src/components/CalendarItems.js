import React from 'react';
import { useTranslation } from 'react-i18next'
import { getTodaySelector } from '../redux'
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { 
  dueToday, getWeekCompletionRatio, getDayCompletionRatio, 
  getDayActivityCompletionRatio, getWeekActivityCompletionRatio 
} from '../activityHandler'
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle,
  runOnJS, withDelay, interpolateColor, Easing
} from 'react-native-reanimated'
import { 
  GestureDetector, Gesture, State 
} from 'react-native-gesture-handler';

const CalendarDayItem = withTheme(({
  theme,
  colors,
  day, 
  currentMonth, 
  activityId, 
  showDayNumber=true, 
  softTodayHighlight=false, 
  onLongPress=()=>{}, 
  onPress=()=>{}, 
  pressAnimationValue: weekAnimationValue,
  animate, // 'day' or 'week'
}) => {

  const dayAnimationValue = useSharedValue(0)
  const weekFillAnimationValue = useSharedValue(0)

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
  const dayBackground = activityFailedThisDay? colors.failedDayBackGround : 'transparent'

  const pressAnimationStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      dayAnimationValue.value,
      [0, 1],
      [dayBackground, colors.pressedDayBackGround]
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
        dayAnimationValue.value = 1
      }else if(animate=='week'){
        weekAnimationValue.value = 1
        weekFillAnimationValue.value = withDelay(150, withTiming(1, {duration: 400}))
      }
    })
    .onStart(() => runOnJS(onDayLongPress)())
    .onFinalize(({ state }) => {
      weekFillAnimationValue.value = withTiming(0, {duration: 500})
      if(state == State.END || state == State.CANCELLED){
        if(animate=='day'){
          dayAnimationValue.value = 0
        }else if(animate=='week'){
          weekAnimationValue.value = 0
        }
      }
    })

  const compoundGesture = Gesture.Exclusive(longPressGesture, tapGesture)

  const weekFillAnimation = useAnimatedStyle(() => {
    const height = `${weekFillAnimationValue.value*160}%`
    const width = `${weekFillAnimationValue.value*160}%`

    return {
      opacity: 0.5,
      backgroundColor: colors.longPressBackground,
      position: 'absolute',
      height,
      width,
      alignSelf: 'center',
      borderRadius: 90,
    }
  })

  const styles = StyleSheet.create({
    dayComponent: {
      flex: 1, 
      aspectRatio: 1,
    },
  
    // soft today highlight
    softTodayView: {
      justifyContent: 'center', 
      alignItems: 'center'
    },
  
    // today highlight
    todayView: {
      backgroundColor: colors.todayHighlightBackground, 
      borderRadius: 30, 
      width: 30, 
      height: 30, 
      justifyContent: 'center', 
      alignItems: 'center'
    },
  })

  return(
    <Animated.View style={styles.dayComponent} >
      <GestureDetector gesture={compoundGesture} >
        <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row'}}>
          <Animated.View style={weekFillAnimation} />
          {/* Day ProgressBar */}
          <View style={{
            alignSelf: 'flex-end',
            width: '100%',
            height: `${dayProgress*100}%`,
            backgroundColor: colors.dayProgressBar,
          }} />
          {/* Press animation */}
          <Animated.View style={[{
            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0
          }, pressAnimationStyle] } />
          {/* Today Highlight */}
          <View style={{ position: 'absolute', flex: 1, alignSelf: 'center' }}>
            {today.day===day.day && today.month===day.month && today.year===day.year? 
              (softTodayHighlight?
              <View style={styles.softTodayView}>
                <Text style={{ color: colors.softTodayHighlightText, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                  {dayLabel}
                </Text>
              </View>
              :
              <View style={styles.todayView}>
                <Text style={{ color: colors.todayHighlightText }}>
                  {dayLabel}
                </Text>
              </View> )
            :
            currentMonth == null || currentMonth.toFormat('L')==day.month?
            <Text style={{color: colors.dayNumber}}>{dayLabel}</Text>
            :
            <Text style={{color: colors.pastDayNumber}}>{dayLabel}</Text>
            }
          </View>
        </View>
    </GestureDetector>
  </Animated.View>
)})

const CalendarWeekItem = withTheme(({
  theme,
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

  const colors = {
    weekBackground: theme.colors.weekBackground,
    dayProgressBar: theme.colors.dayProgressBar,
    weekProgressBar: theme.colors.weekProgressBar,
    weekProgressBarBackground: theme.colors.weekProgressBarBackground,
    dayNumber: theme.colors.weekDayNumber,
    pastDayNumber: theme.colors.weekPastDayNumber,
    todayHighlightBackground: theme.colors.calendarTodayHighlightBackground,
    todayHighlightText: theme.colors.calendarTodayHighlightText,
    softTodayHighlightText: theme.colors.calendarSoftTodayHighlightText,
    pressedDayBackGround: theme.colors.weekPressedDayBackGround,
    failedDayBackGround: theme.colors.weekFailedDayBackGround,
    weekPressedBackground: theme.colors.weekPressedBackground,
    longPressBackground: theme.colors.calendarLongPressBackground,
  }

  const pressAnimationValue = useSharedValue(0)

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 /*- 0.3*pressAnimationValue.value*/,
      transform: [
        {
          scale: 1 - 0.03*pressAnimationValue.value,
        },
      ],
    }
  })


  const animatedWeekStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        pressAnimationValue.value, 
        [0, 1],
        [colors.weekBackground, colors.weekPressedBackground] 
      )
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

  const styles = StyleSheet.create({
    weekComponent: {
      justifyContent: 'space-around',
      flexDirection: 'row',
    },
  })

  return(
    <Animated.View style={animatedContainerStyle} >
      <Animated.View style={[styles.weekComponent, animatedWeekStyle, {zIndex: 1}]}>
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
            colors={colors}
          />
        ))}
      </Animated.View>

      {/* Week ProgressBar */}
      {
      showWeekProgress?
        <View style={{marginBottom: 10, backgroundColor: colors.weekProgressBarBackground, zIndex: 0}}>
          <View style={{
            height: 7,
            width: `${weekProgress*100}%`,
            backgroundColor: colors.weekProgressBar,
            opacity: 0.6,
          }} />
        </View>
      : null }
    </Animated.View>
  )
})

export default CalendarWeekItem;