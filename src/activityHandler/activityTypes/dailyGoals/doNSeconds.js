import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native'
import { IconButton, withTheme } from 'react-native-paper'
import { isActivityRunning } from '../../../util'
import {
  getTodayTime, serializeDate, getPreferedExpression, secondsToUnit, patata
} from '../../../time';
import { toggleCompleted, stopTodayTimer, startTodayTimer, selectEntryByActivityIdAndDate, 
  selectActivityByIdAndDate, getTodaySelector, selectGoalById } from '../../../redux'
import PlayFilledIcon from '../../../../assets/play-filled'
import PlayOutlinedIcon from '../../../../assets/play-outlined'
import PauseFilledIcon from '../../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../../assets/pause-outlined'
import { ActivityListItem, DoubleProgressBar } from '../../../components'
import { useTranslation } from 'react-i18next'
import Notifications from '../../../notifications';

const TodayScreenItem = withTheme(({ theme, activityId, date }) => {
  const dispatch = useDispatch()

  const { t, i18n } = useTranslation()

  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const goal = useSelector((state) => selectGoalById(state, activity.goalId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)

  // state
  const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

  // compute values
  const secondsGoal = activity.params.dailyGoal.params.seconds
  const secondsDedicated = todayTime.as('seconds')
  const progress = Math.min(secondsDedicated / secondsGoal, 1)
  const timerIsRunning = isActivityRunning(entry.intervals)
  const secondsRemaining = secondsGoal - secondsDedicated
  const { value: timeGoalValue, unit, localeUnit } = getPreferedExpression(secondsGoal, t)
  const currentTimeValue = secondsToUnit(secondsDedicated, unit)
  const description = t(
    'activityHandler.dailyGoals.doNSeconds.listItemDescription', 
    { currentTimeValue, timeGoalValue, unit: localeUnit }
  )
 
  // function definitions
  function onPressPause(){
    //Stop timer
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
    if(currentTime.as('seconds') >= secondsGoal && !entry.completed){
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
  }, [
    entry.intervals.length == 0 || entry.intervals, entry.completed, secondsGoal, timerIsRunning
  ])


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
            firstColor={theme.colors.progressBarToday} 
            backgroundColor={theme.colors.progressBarBackground} 
            firstProgress={progress} 
          />
          : null }
      />
      
    </View>
  )
})

function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const seconds = activity.params.dailyGoal.params.seconds
  const { value, localeUnit } = getPreferedExpression(seconds, t)
  return t('activityHandler.dailyGoals.doNSeconds.frequencyString', { value, unit: localeUnit })
}

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)

  if(!entry){
    return 0
  }else if(entry.completed){
    return 1
  }else{
    const dedicatedTime = getTodayTime(entry.intervals)
    const dedicatedSeconds = dedicatedTime.as('seconds')
    const secondsGoal = activity.params.dailyGoal.params.seconds

    if(secondsGoal == 0){
      return 1
    }else{
      return Math.min(1, dedicatedSeconds / secondsGoal)
    }
  }
}

function getTimeGoal(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)

  return (
    activity?.params.dailyGoal?.params.seconds != null ? 
      activity.params.dailyGoal.params.seconds 
      : null
  )
}

export default { 
  TodayScreenItem, 
  getFrequencyString, 
  getDayActivityCompletionRatio,
  getTimeGoal, 
}