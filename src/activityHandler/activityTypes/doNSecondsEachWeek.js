import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry, toggleCompleted, stopTodayTimer, startTodayTimer } from '../../redux'
import { getWeeklyStats, isActivityRunning, getPreferedExpression, getTodaySelector, getTodayTime, roundValue, selectActivityByIdAndDate } from '../../util'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../components'
import dailyGoals from './dailyGoals'
import { useTranslation } from 'react-i18next';
import { GeneralColor, SelectWeekliesColor } from '../../styles/Colors';
import Duration from 'luxon/src/duration.js'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { List, IconButton, Text } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import PlayFilledIcon from '../../../assets/play-filled'
import PlayOutlinedIcon from '../../../assets/play-outlined'
import PauseFilledIcon from '../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../assets/pause-outlined'
import { ActivityListItemColors } from '../../styles/Colors'
import { ActivityListItem, DoubleProgressBar } from '../../components'

const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)
  const { weeklyTime } = useSelector((state) => getWeeklyStats(state, date, activityId))

  // state
  const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

  // compute values
  const secondsGoal = activity.params.seconds
  const totalTime = weeklyTime.plus(todayTime)
  const weeklyProgress = Math.min(weeklyTime.as('seconds') / secondsGoal, 1)
  const totalProgress = Math.min(totalTime.as('seconds') / secondsGoal, 1) 
  const timerIsRunning = isActivityRunning(entry.intervals)

  // function definitions
  function onPressPause(){
    if(date.toISO() == todayDate.toISO()){
      dispatch(stopTodayTimer( activityId ))
    }
  }

  function onPressStart(){
    if(date.toISO() == todayDate.toISO()){
     dispatch(startTodayTimer( activityId ))
    }
  }

  function update(){
    const currentTime = getTodayTime(entry.intervals)
    setTodayTime(currentTime)
    if(currentTime.plus(weeklyTime).as('seconds') >= secondsGoal && !entry.completed){
      dispatch(toggleCompleted({date: date, id: activityId}))
    }
  }

  // effect to update progress bar and mark as completed
  React.useEffect(() => {
    update()
    if (timerIsRunning) {
      const intervalId = setInterval(() => {
        update()
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [entry.intervals, entry.completed, secondsGoal])


  // get the correct left component
  let leftSlot

  if(timerIsRunning){
    if(entry.completed){
      leftSlot = <IconButton icon={() => <PauseFilledIcon />} onPress={onPressPause} />
    }else{
      leftSlot = <IconButton icon={() => <PauseOutlinedIcon />} onPress={onPressPause} />
    }
  }else{
    if(entry.completed){
      leftSlot = <IconButton icon={() => <PlayFilledIcon />} onPress={onPressStart} />
    }else{
      leftSlot = <IconButton icon={() => <PlayOutlinedIcon />} onPress={onPressStart} />
    }
  }

  const timeGoal = Duration.fromObject({seconds: secondsGoal}).shiftTo('hours', 'minutes', 'seconds')
  const expression = getPreferedExpression(timeGoal, t)
  const weeklyTimeNumber = roundValue(totalTime.as(expression.unit))
  const description = t('activityListItem.description.weekTimeGoal', {weeklyTimeNumber, expressionValue: expression.value, expressionUnit: expression.localeUnit})

  return(
    <View>
      <ActivityListItem
        activity={activity}
        entry={entry}
        date={date}
        left={()=>leftSlot}
        description={description}
      />
      { timerIsRunning? 
        <DoubleProgressBar 
          height={4}
          firstColor={ActivityListItemColors.progressBarFirstColor} 
          secondColor={ActivityListItemColors.progressBarSecondColor} 
          backgroundColor={ActivityListItemColors.progressBarBackground} 
          firstProgress={weeklyProgress} 
          secondProgress={totalProgress} 
        />
        : null }
    </View>
  )
}

function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  // misc. hooks
  const { t, i18n } = useTranslation()
  
  // selectors
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, today, activity.id))
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))
  
  // calculations
  const secondsTarget = activity.params.seconds
  const timeTarget = Duration.fromObject({seconds: secondsTarget}).shiftTo('hours', 'minutes', 'seconds')
  let timeLeft = timeTarget.minus(weeklyTime)
  timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
  const timeExpr = getPreferedExpression(timeLeft, t)
  const description = t('weeklyActivities.timeLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit})

  return(
    weekCompleted?
      null
      :
      <WeeklyListItem 
        name={activity.name}
        description={description}
        id={activity.id}
        checkboxStatus={isChecked} 
        onCheckboxPress={onCheckboxPress} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
      /> 
  )
}

function SelectWeekliesItemCompleted({ activity, today, isSelected, onPress }){
  const { t, i18n } = useTranslation()
  
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, today, activity.id))
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))

  const timeExpr = getPreferedExpression(weeklyTime, t)
  const description = t('weeklyActivities.timedCompleted', {unit: timeExpr.value, expression: timeExpr.localeUnit})

  return(
    weekCompleted?
      <WeeklyListItem 
        name={activity.name}
        description={description}
        id={activity.id}
        checkboxStatus={'checked'} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
        checkboxColor='grey'
        onCheckboxPress={()=>{}}
      /> 
      :
      null
  )
}


// TODO: atm it just shows as done days with a entry that has completed==true
// intended: show as done days that has tracked time > 0 
const WeekView = ({ activityId, date, todayChecked }) => {
  // selectors
  const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, date, activityId))
  const activity = useSelector( state => selectActivityById(state, activityId) )

  const daysDone = (
    todayChecked=='checked'?
      [ ...daysDoneList, date.weekday ]
    : 
      daysDoneList
  )

  return (
    <BaseWeekView dayOfWeek={date.weekday} daysDone={daysDone} daysLeft={[]} />
  )
}

function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const seconds = activity.params.seconds
  const { value, unit } = getPreferedExpression(seconds, t)
  return t('activityHandler.activityTypes.doNSecondsEachWeek.frequencyString', {expressionValue: value, expressionUnit: unit})
}

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  WeekView,
  isWeekCompleted,
  getFrequencyString,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { weeklyTime } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityByIdAndDate(state, activityId, date)
  const secondsTarget = activity.params.seconds

  return weeklyTime.as('seconds') >= secondsTarget
}