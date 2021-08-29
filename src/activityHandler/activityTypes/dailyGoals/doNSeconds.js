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
import { ActivityListItem } from '../../../components'



const DoNSecondsTodayListItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const activity = useSelector((state) => selectActivityById(state, activityId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)

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

  let leftSlot

  if(isActivityRunning(entry.intervals)){
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
    <ActivityListItem
      activity={activity}
      entry={entry}
      date={date}
      left={()=>leftSlot}
    />
  )
}

function renderTodayScreenItem( activity, date ){
  return <DoNSecondsTodayListItem activityId={activity.id} date={date} />
}

export default { renderTodayScreenItem }