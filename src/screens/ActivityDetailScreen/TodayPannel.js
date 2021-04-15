import React from 'react';
import { View } from 'react-native'
import { Button, List, Checkbox, Divider } from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning, isToday, startOfDay } from '../../util'
import { DateTime } from 'luxon';

const TodayPannel = ({ entry, toggleCompleted, startTimer, stopTimer, upsertEntry, date, dayStartHour }) => {
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
      const newInterval = dateIsToday?{
        startDate: DateTime.now().minus({seconds}).toISO(), 
        endDate: DateTime.now().toISO()
      }:{
        startDate: startOfDay(date, dayStartHour).toISO(),
        endDate: date.plus({seconds}).toISO()
      }
      upsertEntry({date: date, entry: {...entry, intervals: [newInterval]}})
    }
  
    function setHours(value){
      value==''?
      setTodayTime(todayTime.set({hours: 0})) : value>=23?
      setTodayTime(todayTime.set({hours: 23})) :
      setTodayTime(todayTime.set({hours: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
    function setMinutes(value){
      value==''?
      setTodayTime(todayTime.set({minutes: 0})) : value>=59?
      setTodayTime(todayTime.set({minutes: 59})) :
      setTodayTime(todayTime.set({minutes: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
    function setSeconds(value){
      value==''?
      setTodayTime(todayTime.set({seconds: 0})) : value>=59?
      setTodayTime(todayTime.set({seconds: 59})) :
      setTodayTime(todayTime.set({seconds: value}))
      updateTotalTime(todayTime.as('seconds'))
    }
  
    const dateIsToday = isToday(date, dayStartHour)

    let seconds, minutes, hours
    seconds = String(todayTime.seconds).padStart(2, '0')
    minutes = String(todayTime.minutes).padStart(2, '0')
    hours = String(todayTime.hours).padStart(2, '0')
  
    return(
      <View>
        <List.Item
          title='Today'
          right={() => <Checkbox status={entry.completed? 'checked':'unchecked'} onPress={() => {toggleCompleted({date: date, id: entry.id})} }/>}
        />
        <TimeInput seconds={seconds} minutes={minutes} hours={hours} setHours={setHours} setMinutes={setMinutes} setSeconds={setSeconds} />
        {dateIsToday?
          (isActivityRunning(entry.intervals)?
            <Button onPress={onPressPause}>Stop Timer</Button>
          :
            <Button onPress={onPressPlay}>Start Timer</Button>)
        : null
        }
        <Divider />
      </View>
    )
  }

  export default TodayPannel