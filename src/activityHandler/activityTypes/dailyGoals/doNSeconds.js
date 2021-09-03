import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, IconButton, Text } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import { getTodayTime, isActivityRunning, getPreferedExpression, roundValue, getTodaySelector } from '../../../util'
import { toggleCompleted, stopTodayTimer, startTodayTimer, selectActivityById, selectEntryByActivityIdAndDate } from '../../../redux'
import PlayFilledIcon from '../../../../assets/play-filled'
import PlayOutlinedIcon from '../../../../assets/play-outlined'
import PauseFilledIcon from '../../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../../assets/pause-outlined'
import { useTranslation } from 'react-i18next'
import { ActivityListItemColors } from '../../../styles/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { ActivityListItem, DoubleProgressBar } from '../../../components'

// addEntryThunk to add the repetitions field to entries of this activity type
function addEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(createOrUnarchiveEntry(date, activityId, { repetitions: 0 }))
  }
}

const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()

  // selector hooks
  const activity = useSelector((state) => selectActivityById(state, activityId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)

  // state
  const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

  // compute values
  const secondsGoal = activity.params.dailyGoal.params.seconds
  const progress = Math.min(todayTime.as('seconds') / secondsGoal, 1)
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
      leftSlot = <IconButton icon={() => <PauseOutlinedIcon />} onPress={onPressPause} />
    }
  }else{
    if(entry.completed){
      leftSlot = <IconButton icon={() => <PlayFilledIcon />} onPress={onPressStart} />
    }else{
      leftSlot = <IconButton icon={() => <PlayOutlinedIcon />} onPress={onPressStart} />
    }
  }

  return(
    <View>
      <ActivityListItem
        activity={activity}
        entry={entry}
        date={date}
        left={()=>leftSlot}
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

export default { TodayScreenItem }