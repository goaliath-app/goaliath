import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {
  selectEntryByActivityIdAndDate, toggleCompleted,
  stopTodayTimer, startTodayTimer, selectActivityByIdAndDate, getWeeklyStats,
  getTodaySelector, isActiveSelector, archiveOrDeleteEntry, getPeriodStats, selectGoalById,
} from '../../redux'
import { isActivityRunning, roundValue } from '../../util'
import { serializeDate, getTodayTime, getPreferedExpression } from '../../time';
import { WeeklyListItem } from '../../components'
import { useTranslation } from 'react-i18next';
import Duration from 'luxon/src/duration.js'
import { View } from 'react-native'
import { IconButton, withTheme } from 'react-native-paper'
import PlayFilledIcon from '../../../assets/play-filled'
import PlayOutlinedIcon from '../../../assets/play-outlined'
import PauseFilledIcon from '../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../assets/pause-outlined'
import { ActivityListItem, DoubleProgressBar } from '../../components'
import Notifications from '../../notifications';

const TodayScreenItem = withTheme(({ theme, activityId, date }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const goal = useSelector((state) => selectGoalById(state, activity.goalId))
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
  const secondsRemaining = secondsGoal - totalTime.as('seconds')

  // function definitions
  function onPressPause(){
    //Stop Timer
    if(serializeDate(date) == serializeDate(todayDate)){
      dispatch(stopTodayTimer( activityId ))
    }
    //Dismiss notifications
    Notifications.timerStoped(activityId)
  }

  function onPressStart(){
    //Start Timer
    if(serializeDate(date) == serializeDate(todayDate)){
     dispatch(startTodayTimer( activityId ))
    }
    //Send timer notifications
    Notifications.timerStarted(activity, entry, secondsRemaining, t)
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
      leftSlot = () => <IconButton icon={() => <PauseFilledIcon />} onPress={onPressPause} />
    }else{
      leftSlot = () => <IconButton icon={() => <PauseOutlinedIcon />} 
                    onLongPress={() => {dispatch(toggleCompleted({date: date, id: activityId}));
                                        dispatch(stopTodayTimer( activityId ))}}
                    onPress={onPressPause} />
    }
  }else{
    if(entry.completed){
      leftSlot = () => <IconButton icon={() => <PlayFilledIcon />} onPress={onPressStart} />
    }else{
      leftSlot = () => <IconButton icon={() => <PlayOutlinedIcon />} 
                    onLongPress={() => dispatch(toggleCompleted({date: date, id: activityId}))}
                    onPress={onPressStart} />
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
        goal={goal}
        entry={entry}
        date={date}
        left={leftSlot}
        leftTooltipText={t('tooltips.playIcon')}
        leftTooltipName={'StartTimerActivityListItemTooltip'}
        leftTooltipKey={'StartTimerActivityListItemTooltip'+activityId}
        description={description}
        bottom={ timerIsRunning? 
          () => <DoubleProgressBar 
            height={4}
            firstColor={theme.colors.progressBarWeek} 
            secondColor={theme.colors.progressBarToday} 
            backgroundColor={theme.colors.progressBarBackground} 
            firstProgress={weeklyProgress} 
            secondProgress={totalProgress} 
          />
          : null }
      />
      
    </View>
  )
})

function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  // misc. hooks
  const { t, i18n } = useTranslation()
  
  // selectors
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))
  
  // calculations
  const description = useSelector(state => getWeekProgressString(state, activity.id, today, t))
  
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

const SelectWeekliesItemCompleted = withTheme(({ activity, today, theme, isSelected, onPress }) => {
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
        checkboxColor={theme.colors.completedCheckbox}
      /> 
      :
      null
  )
})

function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const seconds = activity.params.seconds
  const { value, localeUnit } = getPreferedExpression(seconds, t)
  return t('activityHandler.activityTypes.doNSecondsEachWeek.frequencyString', {expressionValue: value, expressionUnit: localeUnit})
}

function getWeekProgressString(state, activityId, date, t){
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  //selectors
  const { loggedTime } = getPeriodStats(state, date.startOf('week'), date, activity.id)
  
  // calculations
  const secondsTarget = activity.params.seconds
  const timeTarget = Duration.fromObject({seconds: secondsTarget}).shiftTo('hours', 'minutes', 'seconds')
  let timeLeft = timeTarget.minus(loggedTime)
  timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
  const timeExpr = getPreferedExpression(timeLeft, t)
  return (timeExpr.value==0? t('activityHandler.activityTypes.doNSecondsEachWeek.completed') : t('activityHandler.activityTypes.doNSecondsEachWeek.secondsLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit}))

}

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)

  if(!entry){
    return 0
  }else if(entry.completed){
    return 1
  }else{
    const todaySeconds = getTodayTime(entry.intervals).as('seconds')
    const weeklySecondsGoal = activity.params.seconds

    if((weeklySecondsGoal / 7) == 0){
      return 1
    }else{
      return Math.min(1, todaySeconds / (weeklySecondsGoal / 7) )
    }
  }
}

function updateEntryThunk( activityId, date ){
  return function(dispatch, getState){
    const state = getState()
    const isActive = isActiveSelector(state, activityId, date)
      
    // if activity is active and this day is one of the selected days of the week
    if( !isActive ){
      dispatch( archiveOrDeleteEntry(date, activityId) )
    }
  }
}

function getWeekActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const weeklySecondsGoal = activity.params.seconds

  const weekStartDate = date.startOf('week')
  const weekEndDate = date.endOf('week')

  let secondsAccumulator = 0
  for(let day = weekStartDate; day <= weekEndDate; day = day.plus({days: 1})){
    const activity = selectActivityByIdAndDate(state, activityId, day)
    const entry = selectEntryByActivityIdAndDate(state, activityId, day)
    if( activity && entry && !entry.archived ){
      secondsAccumulator += getTodayTime(entry.intervals).as('seconds')
    }
  }

  if( weeklySecondsGoal == 0 ){
    return 1
  } else {
    return Math.min( 1, secondsAccumulator / weeklySecondsGoal )
  }
}

function getTimeGoal(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  return activity?.params.seconds != null ? activity.params.seconds : null
}

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  isWeekCompleted,
  getFrequencyString,
  getWeekProgressString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio,
  updateEntryThunk,
  getTimeGoal,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { weeklyTime } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityByIdAndDate(state, activityId, date)

  if(activity == null) return false

  const secondsTarget = activity.params.seconds

  return weeklyTime.as('seconds') >= secondsTarget
}