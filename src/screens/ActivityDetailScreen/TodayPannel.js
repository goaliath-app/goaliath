import React from 'react';
import { View } from 'react-native'
import { Button, List, Checkbox, Divider } from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning } from '../../util'
import { DateTime } from 'luxon';

const TodayPannel = ({ entry, toggleCompleted, startTimer, stopTimer, upsertTodaysEntry }) => {
    React.useEffect(() => {
      if (isActivityRunning(entry.intervals)) {
        const intervalId = setInterval(() => {
          setTodayTime(getTodayTime(entry.intervals))    
        }, 1000)
        return () => clearInterval(intervalId)
      }
    }, [entry.intervals])
  
    function onPressPlay(){
      startTimer(entry.id)
    }
  
    function onPressPause(){
      stopTimer(entry.id)
    }
  
    const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))
    
    function updateTotalTime(seconds){
      const newInterval = {
        startDate: DateTime.now().minus({seconds}).toISO(), 
        endDate: DateTime.now().toISO()
      }
      upsertTodaysEntry({...entry, intervals: [newInterval]})
    }
  
    function setHours(value){
      setTodayTime(todayTime.set({hours: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
    function setMinutes(value){
      setTodayTime(todayTime.set({minutes: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
    function setSeconds(value){
      setTodayTime(todayTime.set({seconds: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
  
    let seconds, minutes, hours
    seconds = String(todayTime.seconds).padStart(2, '0')
    minutes = String(todayTime.minutes).padStart(2, '0')
    hours = String(todayTime.hours).padStart(2, '0')
  
    return(
      <View>
        <List.Item
          title='Today'
          right={() => <Checkbox status={entry.completed? 'checked':'unchecked'} onPress={() => {toggleCompleted({date: DateTime.now(), id: entry.id})} }/>}
        />
        <TimeInput seconds={seconds} minutes={minutes} hours={hours} setHours={setHours} setMinutes={setMinutes} setSeconds={setSeconds} />
        {isActivityRunning(entry.intervals)?
          <Button onPress={onPressPause}>Stop Timer</Button>
        :
          <Button onPress={onPressPlay}>Start Timer</Button>
        }
        <Divider />
      </View>
    )
  }

  export default TodayPannel