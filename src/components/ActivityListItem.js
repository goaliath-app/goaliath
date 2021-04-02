import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Checkbox, IconButton, Text, ProgressBar } from 'react-native-paper'
import { DateTime } from 'luxon'
import { getTodayTime, isActivityRunning, getPreferedExpression, roundValue } from '../util'
import { toggleCompleted, startTimer, stopTimer } from '../redux'
import PlayFilledIcon from '../../assets/play-filled'
import PlayOutlinedIcon from '../../assets/play-outlined'
import PauseFilledIcon from '../../assets/pause-filled'
import PauseOutlinedIcon from '../../assets/pause-outlined'

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
  stopTimer,
  disabled,
  date
}) => {
  function update(){
    const currentTime = getTodayTime(intervals)
    setTodayTime(currentTime)
    if(timeGoal && currentTime.as('seconds') >= timeGoal && !completed){
      toggleCompleted({date: DateTime.now(), id: id})
    }
  }

  React.useEffect(() => {
    update()
    if (isActivityRunning(intervals)) {
      const intervalId = setInterval(() => {
        update()
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [intervals, completed, timeGoal])

  function onPressPlay(){
    if(disabled) return
    startTimer(id)
  }

  function onPressPause(){
    if(disabled) return
    stopTimer(id)
  }

  const current = isActivityRunning(intervals)
  const [todayTime, setTodayTime] = React.useState(getTodayTime(intervals))


  let leftSlot, rightSlot, description;

  if(!timeGoal && completed){
    leftSlot = (
      <View style={styles.checkboxView}>
        <Checkbox 
          color='black'
          status='checked'
          onPress={() => {
            if(disabled) return
            toggleCompleted({date: DateTime.now(), id: id})
        }}/>
      </View>
    )
  }else if(!timeGoal && !completed){
    leftSlot = (
      <View style={styles.checkboxView}>
        <Checkbox 
          color='black'
          uncheckedColor='black'
          status='unchecked' 
          onPress={() => {
            if(disabled) return
            toggleCompleted({date: DateTime.now(), id: id})
        }}  />
      </View>
    )
  }else if(timeGoal && current && !completed){
    leftSlot = <IconButton icon={() => <PauseOutlinedIcon />} onPress={onPressPause} />
  }else if(timeGoal && current && completed){
    leftSlot = <IconButton icon={() => <PauseFilledIcon />} onPress={onPressPause} />
  }else if(timeGoal && completed){
    leftSlot = (
      <IconButton 
        icon={() => <PlayFilledIcon />} 
        onPress={onPressPlay}  
      />)
  }else{
    leftSlot = <IconButton icon={() => <PlayOutlinedIcon />} onPress={onPressPlay} />
  }

  if((repeatMode == 'daily' || repeatMode == 'select') && timeGoal){
    const expression = getPreferedExpression(timeGoal)
    description = `Goal: ${expression.value} ${expression.unit}`
  }else if(repeatMode=='weekly' && !timeGoal){
    description = `Done ${weeklyTimes} of ${timesPerWeek} days`
  }else if(repeatMode=='weekly' && timeGoal){
    const expression = getPreferedExpression(timeGoal)
    description = `Done ${roundValue(weeklyTime.as(expression.unit))} of ${expression.value} ${expression.unit}`
  }

  if(todayTime.as('seconds') > 0){
    rightSlot = <Text style={styles.timeLabel}>{todayTime.toFormat('hh:mm:ss')}</Text>
  }

  const navigation = useNavigation();

  const progress = Math.min(todayTime.as('seconds') / timeGoal, 1)

  return (
    archived? <></> : 
    <View>
      <List.Item
        style={{ backgroundColor: current? '#E6FBF9':'white' }}
        left={() => leftSlot}
        title={name}
        description={description}
        right={() => rightSlot}
        onPress={() => {
          navigation.navigate('ActivityDetail', {activityId: id, date: date})
        }}
      />
      {current?
        <ProgressBar progress={progress} />  
      : <></> }
    </View>
  );
}

const styles = StyleSheet.create({
  checkboxView: {
    padding: 6
  },
  iconButton: {
    margin: 0,
  },
  timeLabel: {
    alignSelf: 'center',
    marginRight: 12,
    fontSize: 15,
  },
})

const actionsToProps = {
  toggleCompleted,
  startTimer,
  stopTimer
}

export default connect(null, actionsToProps)(ActivityListItem);