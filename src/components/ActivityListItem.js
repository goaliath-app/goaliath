import React from 'react';
import { StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Checkbox, IconButton, Text } from 'react-native-paper'
import { DateTime } from 'luxon'

function isActivityRunning(intervals){
  const lastInterval = intervals.slice(-1)[0]
  if(lastInterval?.startDate && !lastInterval?.endDate){
    return true
  }else{
    return false
  }
}

function getTodayTime(intervals){
  console.log(intervals)
  if(!intervals) {return -1}
  let todayTime = 0
  for(let interval of intervals){
    console.log('una iteracion')
    if(interval.startDate && interval.endDate){
      console.log('dif entre dos')
      const startDate = DateTime.fromISO(interval.startDate)
      const endDate = DateTime.fromISO(interval.endDate)
      todayTime += Math.floor(endDate.diff(startDate, 'seconds').get('seconds'))
    }else if(interval.startDate && !interval.endDate){
      console.log('dif entre uno y ahora')
      const startDate = DateTime.fromISO(interval.startDate)
      todayTime -= Math.floor(startDate.diffNow("seconds").get('seconds'))  // this returns a negative number
    }
  }
  console.log(todayTime)
  return todayTime
}

const ActivityListItem = ({ 
  timeGoal,    // number of seconds of the time goal for this activity or null if it is not a timed activity
  weeklyTimeGoal, // number of seconds
  name,        // name of the activity
  repeatMode,      // 'daily' or 'weekly'
  weeklyTime,    // time spent this week (just used in 'weekly' repeatMode activities)
  completed,   // boolean value
  weeklyTimesObjective, // number of days that the activity should be completed each week
  weeklyTimes, // number of times that the activity has been done this week (counting today)
  intervals
}) => {
    const current = isActivityRunning(intervals)
    const todayTime = getTodayTime(intervals)

    let leftSlot, rightSlot, description;

    if(timeGoal==undefined && completed){
      leftSlot = <Checkbox status='checked' />
    }else if(timeGoal==undefined && !completed){
      leftSlot = <Checkbox status='unchecked' />
    }else if(timeGoal!==undefined && current && !completed){
      leftSlot = <Image source={require('../../assets/pause-outlined.png')} style={styles.pauseIcon} />
    }else if(timeGoal!==undefined && current && completed){
      leftSlot = <Image source={require('../../assets/pause.png')} style={styles.pauseIcon} />
    }else if(timeGoal!==undefined && completed){
      leftSlot = <Image source={require('../../assets/play.png')} style={styles.playIcon} />
    }else{
      leftSlot = <Image source={require('../../assets/play-outlined.png')} style={styles.playIcon} />
    }

    if(repeatMode == 'daily' && timeGoal!==undefined){
      description = `Time goal: ${timeGoal} seconds`
    }else if(repeatMode=='weekly' && timeGoal==undefined){
      description = `Done ${weeklyTimes} of ${weeklyTimesObjective} days`
    }else if(repeatMode=='weekly' && timeGoal!==undefined){
      description = `Dedicated ${weeklyTime} of ${weeklyTimeGoal} total seconds`
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
      <List.Item
        left={() => leftSlot}
        title={name}
        description={description}
        right={() => rightSlot}
        onPress={() => navigation.navigate('ActivityDetail', {activityId: '0'})}
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

export default ActivityListItem;