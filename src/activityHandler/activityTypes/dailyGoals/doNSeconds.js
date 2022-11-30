import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { 
  getTodayTime, isActivityRunning, getPreferedExpression, secondsToUnit,
 } from '../../../util'
import { toggleCompleted, stopTodayTimer, startTodayTimer, selectEntryByActivityIdAndDate, selectActivityByIdAndDate, getTodaySelector } from '../../../redux'
import PlayFilledIcon from '../../../../assets/play-filled'
import PlayOutlinedIcon from '../../../../assets/play-outlined'
import PauseFilledIcon from '../../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../../assets/pause-outlined'
import { ActivityListItemColors } from '../../../styles/Colors'
import { ActivityListItem, DoubleProgressBar } from '../../../components'
import { useTranslation } from 'react-i18next'
import Notifications from '../../../notifications';

// addEntryThunk to add the repetitions field to entries of this activity type
function addEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(createOrUnarchiveEntry(date, activityId))
  }
}

const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()

  const { t, i18n } = useTranslation()

  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
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
    if(date.toISO() == todayDate.toISO()){
      dispatch(stopTodayTimer( activityId ))
    }
    //Dismiss notifications
    Notifications.timerStoped(activityId)
  }

  function onPressStart(){
    //Start Timer
    if(date.toISO() == todayDate.toISO()){
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
  }, [entry.intervals, entry.completed, secondsGoal])


  // get the correct left component
  let leftSlot

  if(timerIsRunning){
    if(entry.completed){
      leftSlot = <IconButton icon={() => <PauseFilledIcon />} onPress={onPressPause} />
    }else{
      leftSlot = <IconButton icon={() => <PauseOutlinedIcon />} 
                    onLongPress={() => {dispatch(toggleCompleted({date: date, id: activityId}));
                                        dispatch(stopTodayTimer( activityId ))}}
                    onPress={onPressPause} />
    }
  }else{
    if(entry.completed){
      leftSlot = <IconButton icon={() => <PlayFilledIcon />} onPress={onPressStart} />
    }else{
      leftSlot = <IconButton icon={() => <PlayOutlinedIcon />} 
                    onLongPress={() => dispatch(toggleCompleted({date: date, id: activityId}))}
                    onPress={onPressStart} />
    }
  }

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
          firstColor={ActivityListItemColors.progressBarSecondColor} 
          backgroundColor={ActivityListItemColors.progressBarBackground} 
          firstProgress={progress} 
        />
        : null }
    </View>
  )
}

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