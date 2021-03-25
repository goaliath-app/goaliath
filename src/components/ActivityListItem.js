import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Checkbox, IconButton, Text } from 'react-native-paper'
import { DateTime } from 'luxon'
import { getTodayTime, isActivityRunning, getPreferedExpression, roundValue } from '../util'
import { toggleCompleted, startTimer, stopTimer } from '../redux'

const ActivityListItem = ({ 
  timeGoal,    // number of seconds of the time goal for this activity or null if it is not a timed activity
  name,        // name of the activity
  repeatMode,      // 'daily' or 'weekly'
  weeklyTime,    // time spent this week (just used in 'weekly' repeatMode activities)
  completed,   // boolean value
  timesPerWeek, // number of days that the activity should be completed each week
  weeklyTimes, // number of times that the activity has been done this week (counting today)
  intervals, 
  archived,
  id,
  toggleCompleted,
  startTimer,
  stopTimer
}) => {
  React.useEffect(() => {
    if (isActivityRunning(intervals)) {
      const intervalId = setInterval(() => {
        setTodayTime(getTodayTime(intervals))    
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [intervals])

  function onPressPlay(){
    startTimer(id)
  }

  function onPressPause(){
    stopTimer(id)
  }

  const current = isActivityRunning(intervals)
  const [todayTime, setTodayTime] = React.useState(getTodayTime(intervals))


  let leftSlot, rightSlot, description;

  if(timeGoal==undefined && completed){
    leftSlot = (
      <Checkbox 
      status='checked'
      onPress={() => {
        toggleCompleted({date: DateTime.now(), id: id})
      }}/>
    )
  }else if(timeGoal==undefined && !completed){
    leftSlot = (
      <Checkbox 
      status='unchecked' 
      onPress={() => {
        toggleCompleted({date: DateTime.now(), id: id})
      }}  />
    )
  }else if(timeGoal!==undefined && current && !completed){
    leftSlot = <IconButton icon={require('../../assets/pause-outlined.png')} onPress={onPressPause} />
  }else if(timeGoal!==undefined && current && completed){
    leftSlot = <IconButton icon={require('../../assets/pause.png')} onPress={onPressPause} />
  }else if(timeGoal!==undefined && completed){
    leftSlot = (
      <IconButton 
        icon={require('../../assets/play.png')} 
        onPress={onPressPlay}  
      />)
  }else{
    leftSlot = <IconButton icon={require('../../assets/play-outlined.png')} onPress={onPressPlay} />
  }

  if((repeatMode == 'daily' || repeatMode == 'select') && timeGoal!==undefined){
    const expression = getPreferedExpression(timeGoal)
    description = `Goal: ${expression.value} ${expression.unit}`
  }else if(repeatMode=='weekly' && timeGoal==undefined){
    description = `Done ${weeklyTimes} of ${timesPerWeek} days`
  }else if(repeatMode=='weekly' && timeGoal!==undefined){
    const expression = getPreferedExpression(timeGoal)
    description = `Done ${roundValue(weeklyTime.as(expression.unit))} of ${expression.value} ${expression.unit}`
  }

  if(todayTime.as('seconds') > 0){
    rightSlot = <Text style={styles.timeLabel}>{todayTime.toFormat('hh:mm:ss')}</Text>
  }

  const navigation = useNavigation();

  return (
    archived? <></> : 
    <List.Item
      left={() => leftSlot}
      title={name}
      description={description}
      right={() => rightSlot}
      onPress={() => navigation.navigate('ActivityDetail', {activityId: id, showLog: true})}
    />
  );
}

const styles = StyleSheet.create({
  iconButton: {
    margin: 0,
  },
  timeLabel: {
    margin: 'auto',
    marginRight: 12
  },
  playIcon: {
    height: 20,
    width: 18,
    margin: 'auto',
    marginRight: 10,
    marginLeft: 10,
  },
  pauseIcon: {
    height: 17.5,
    width: 17.5,
    margin: 'auto',
    marginRight: 10,
    marginLeft: 10,
  },
})

const actionsToProps = {
  toggleCompleted,
  startTimer,
  stopTimer
}

export default connect(null, actionsToProps)(ActivityListItem);