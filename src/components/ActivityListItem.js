import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Checkbox, IconButton, Text } from 'react-native-paper'
import { DateTime } from 'luxon'
import { getTodayTime, isActivityRunning } from '../util'
import { toggleCompleted, startTimer, stopTimer } from '../redux'

const ActivityListItem = ({ 
  timeGoal,    // number of seconds of the time goal for this activity or null if it is not a timed activity
  name,        // name of the activity
  repeatMode,      // 'daily' or 'weekly'
  weeklyTime,    // time spent this week (just used in 'weekly' repeatMode activities)
  completed,   // boolean value
  weeklyTimesObjective, // number of days that the activity should be completed each week
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
      delayLongPress={1000} 
      onLongPress={() => {
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

  if(repeatMode == 'daily' && timeGoal!==undefined){
    description = `Time goal: ${timeGoal} seconds`
  }else if(repeatMode=='weekly' && timeGoal==undefined){
    description = `Done ${weeklyTimes} of ${weeklyTimesObjective} days`
  }else if(repeatMode=='weekly' && timeGoal!==undefined){
    description = `Dedicated ${weeklyTime} of ${timeGoal} total seconds`
  }

  if(todayTime){
    let seconds, minutes, hours
    seconds = String(todayTime % 60).padStart(2, '0')
    minutes = String(Math.floor(todayTime / 60) % 60).padStart(2, '0')
    hours = String(Math.floor(todayTime / 3600)).padStart(2, '0')

    rightSlot = <Text style={styles.timeLabel}>{hours}:{minutes}:{seconds}</Text>
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