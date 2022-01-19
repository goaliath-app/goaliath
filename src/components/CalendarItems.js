import React from 'react';
import { useTranslation } from 'react-i18next'
import { getTodaySelector } from '../redux'
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
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
import Color from 'color';

const CalendarDayItem = withTheme(({
  theme,
  day, 
  currentMonth, 
  activityId, 
  showDayNumber=true, 
  softTodayHighlight=false, 
  onLongPress=()=>{}, 
  onPress=()=>{}, 
  pressAnimationValue: weekAnimationValue,
  animate, // 'day' or 'week'
  weekViewLayout
}) => {
  const [ myCurrentLayout, setMyCurrentLayout ] = React.useState()

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
  const dayBackground = activityFailedThisDay? theme.colors.disabled : 'transparent'

  const pressAnimationStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      dayAnimationValue.value,
      [0, 1],
      [dayBackground, theme.colors.primary]
    )

    const zIndex = weekFillAnimationValue.value > 0? 1 : 0

    return { backgroundColor, zIndex }
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
    let left = 0, right = 0, opacity = 0

    if(myCurrentLayout && weekViewLayout){
      opacity = 0 + weekFillAnimationValue.value
      left = (
        myCurrentLayout.width/2  // initial value
        - weekFillAnimationValue.value*(myCurrentLayout.width/2+myCurrentLayout.x)  // offset
      )
      right = (
        myCurrentLayout.width/2  // initial value
        - weekFillAnimationValue.value*(
          myCurrentLayout.width/2 
          + weekViewLayout.width - myCurrentLayout.x - myCurrentLayout.width
        )  // offset
      )
    }


    return {
      opacity,
      backgroundColor: theme.colors.primary,
      position: 'absolute',
      top: 0,
      left,
      right,
      bottom: 0
    }
  })

  const styles = StyleSheet.create({
    dayComponent: {
      flex: 1, 
      aspectRatio: 1,
    },
  
    softTodayView: {
      justifyContent: 'center', 
      alignItems: 'center'
    },
  
    todayView: {
      backgroundColor: theme.colors.primaryDarkVariant, 
      borderRadius: 30, 
      width: 30, 
      height: 30, 
      justifyContent: 'center', 
      alignItems: 'center'
    },
  })

  return(
    <Animated.View style={[styles.dayComponent, pressAnimationStyle]} onLayout={(layoutEvent) => {
      setMyCurrentLayout(layoutEvent.nativeEvent.layout)
    }}>
      <GestureDetector gesture={compoundGesture} >
        <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row'}}>
          <Animated.View style={weekFillAnimation} zIndex={0}/>
          {/* Day ProgressBar */}
          <View style={{
            alignSelf: 'flex-end',
            width: '100%',
            height: `${dayProgress*100}%`,
            backgroundColor: theme.colors.primary,
            opacity: 0.4,
          }} />
          {/* Today Highlight */}
          <View style={{ position: 'absolute', flex: 1, alignSelf: 'center' }}>
            {today.day===day.day && today.month===day.month && today.year===day.year? 
              (softTodayHighlight?
              <View style={styles.softTodayView}>
                <Text style={{ color: theme.colors.primaryDarkVariant, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                  {dayLabel}
                </Text>
              </View>
              :
              <View style={styles.todayView}>
                <Text style={{ color: theme.colors.onPrimary }}>
                  {dayLabel}
                </Text>
              </View> )
            :
            currentMonth == null || currentMonth.toFormat('L')==day.month?
            <Text>{dayLabel}</Text>
            :
            <Text style={{color: theme.colors.placeholder}}>{dayLabel}</Text>
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
  const pressAnimationValue = useSharedValue(0)

  const [myCurrentLayout, setMyCurrentLayout] = React.useState()

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

  const pressedColor = Color(theme.colors.primaryLightVariant).darken(0.1).string()

  const animatedWeekStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        pressAnimationValue.value, 
        [0, 1],
        [theme.colors.primaryLightVariant, pressedColor] 
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
      backgroundColor: theme.colors.primaryLightVariant
    },
  })

  return(
    <Animated.View style={animatedContainerStyle} onLayout={(layoutEvent) => {
      setMyCurrentLayout(layoutEvent.nativeEvent.layout)
    }}>
      <Animated.View style={[styles.weekComponent, animatedWeekStyle]}>
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
            weekViewLayout={myCurrentLayout}
          />
        ))}
      </Animated.View>

      {/* Week ProgressBar */}
      {
      showWeekProgress?
        <View style={{marginBottom: 10, backgroundColor: Color(theme.colors.primaryLightVariant).darken(0.05).string()}}>
          <View style={{
            height: 7,
            width: `${weekProgress*100}%`,
            backgroundColor: theme.colors.primary,
            opacity: 0.6,
          }} />
        </View>
      : null }
    </Animated.View>
  )
})

export default CalendarWeekItem;