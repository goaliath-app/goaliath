import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import { Button, List, Checkbox, Divider, Paragraph, TextInput, withTheme } from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning, isToday, startOfDay } from '../../util'
import { DateTime, Duration } from 'luxon';
import { useTranslation } from 'react-i18next'
import { setRepetitions, toggleCompleted, upsertEntry, startTodayTimer, stopTodayTimer } from './../../redux'
import { usesRepetitions, getTimeGoal } from '../../activityHandler'
import Notifications from '../../notifications';

const TodayPannel = withTheme(({ timerDisabled=false, entry, date, dayStartHour, activity, theme }) => {
  console.log("TODAYPANNEL DATE", date)
  
  React.useEffect(() => {
    if (isActivityRunning(entry.intervals)) {
      const intervalId = setInterval(() => {
        setTodayTime(getTodayTime(entry.intervals))    
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [entry.intervals])

  const { t, i18n } = useTranslation()
  
  const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

  const secondsGoal = useSelector( state => getTimeGoal(state, activity.id, date) )
  const secondsRemaining = secondsGoal - todayTime.as('seconds')

  function onPressPlay(){
    if(!timerDisabled){
      //Start timer
      dispatch(startTodayTimer(entry.id))
      //Send timer notifications
      Notifications.timerStarted(activity, entry, secondsRemaining, t)
    }
  }

  function onPressPause(){
    if(!timerDisabled){
      //Stop timer
      dispatch(stopTodayTimer(entry.id))
      //Dismiss notifications
      Notifications.timerStoped(activity.id)
    }
  }

  const dispatch = useDispatch()

  const showRepetitions = useSelector(state => usesRepetitions(state, entry.id, date))
  
  function updateTotalTime(seconds){
    const newInterval = dateIsToday?{
      startDate: DateTime.now().minus({seconds}).toISO(), 
      endDate: DateTime.now().toISO()
    }:{
      startDate: startOfDay(date, dayStartHour).toISO(),
      endDate: date.plus({seconds}).toISO()
    }
    dispatch(upsertEntry({date: date, entry: {...entry, intervals: [newInterval]}}))
  }

  const dateIsToday = isToday(date, dayStartHour)
  const activityRunning = isActivityRunning(entry.intervals)

  let seconds, minutes, hours
  seconds = String(todayTime.seconds).padStart(2, '0')
  minutes = String(todayTime.minutes).padStart(2, '0')
  hours = String(todayTime.hours).padStart(2, '0')
  
  return(
    <View>
      <List.Item
        title={t('todayPannel.title')}
        right={() => (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Paragraph style={{marginRight: 6}}>{t('todayPannel.checkboxLabel')}</Paragraph>
            <Checkbox 
              status={entry.completed? 'checked':'unchecked'} 
              onPress={() => {useDispatch(toggleCompleted({date: date, id: entry.id}))} }
            />
          </View>
        )}
      />
      {showRepetitions ?
        <View>
          <List.Item title={t('todayPannel.repetitions')} />
          <View style={{ alignItems:'center' }}>
            <TextInput
            style={{fontSize: 50, textAlign: 'center', margin: 10, width: '30%', backgroundColor: 'transparent'}} 
            value={String(entry.repetitions.length)} 
            onChangeText={(value) => {
              parseInt(value)
              value = value<1000?value:999
              value = value>0?value:0
              dispatch(setRepetitions({ date, id: entry.id, repetitions: value }))
            }}
            selectTextOnFocus={true}
            keyboardType='numeric' />
          </View>
          <List.Item title={t('todayPannel.time')} />
        </View>
      : null }
      <TimeInput 
        regularColor={activityRunning? theme.colors.activityDetailTimeInputRunning : theme.colors.onSurface}
        value={todayTime.as('seconds')} 
        onValueChange={(value) => { 
          setTodayTime(
            Duration
              .fromObject({ seconds: value })
              .shiftTo('hours', 'minutes', 'seconds')
          ) 
          updateTotalTime(value)
        }} 
        />
      {dateIsToday?
        (activityRunning?
          <Button onPress={onPressPause}>{t('todayPannel.stopButton')}</Button>
          :
          <Button 
            onPress={onPressPlay}
            >
              {t('todayPannel.startButton')}</Button>)
          : null
        }
      <Divider />
    </View>
  )
})

  export default TodayPannel;