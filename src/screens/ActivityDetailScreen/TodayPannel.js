import * as Notifications from 'expo-notifications';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import { Button, List, Checkbox, Divider, Paragraph, TextInput } from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning, isToday, startOfDay } from '../../util'
import { DateTime, Duration } from 'luxon';
import { useTranslation } from 'react-i18next'
import { TodayPannelColor } from '../../styles/Colors';
import { setRepetitions } from './../../redux'
import { usesRepetitions } from '../../activityHandler'

const TodayPannel = ({ entry, toggleCompleted, startTodayTimer, stopTodayTimer, upsertEntry, date, dayStartHour, activity }) => {
    React.useEffect(() => {
      if (isActivityRunning(entry.intervals)) {
        const intervalId = setInterval(() => {
          setTodayTime(getTodayTime(entry.intervals))    
        }, 1000)
        return () => clearInterval(intervalId)
      }
    }, [entry.intervals])

    const { t, i18n } = useTranslation()
  
    function onPressPlay(){
      //Start timer
      startTodayTimer(entry.id)
      //Send notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.timer.title'),
          body: t('notifications.timer.body', {activityName: activity.name}),
          priority: 'max',
          sticky: true
        },
        trigger: null,
      });
    }
  
    function onPressPause(){
      stopTodayTimer(entry.id)
    }
  
    const [todayTime, setTodayTime] = React.useState(getTodayTime(entry.intervals))

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
      upsertEntry({date: date, entry: {...entry, intervals: [newInterval]}})
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
                onPress={() => {toggleCompleted({date: date, id: entry.id})} }
              />
            </View>
          )}
        />
        {showRepetitions ?
          <View>
            <List.Item title={t('todayPannel.repetitions')} />
            <View style={{ alignItems:'center' }}>
              <TextInput
              style={{fontSize: 50, textAlign: 'center', margin: 10, width: '30%', backgroundColor: TodayPannelColor.textInputBackground}} 
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
          regularColor={activityRunning? TodayPannelColor.activityRunning : TodayPannelColor.regularColor}
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
  }

  export default TodayPannel