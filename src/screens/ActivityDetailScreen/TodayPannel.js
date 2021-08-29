import React from 'react';
import { View } from 'react-native'
import { Button, List, Checkbox, Divider, Paragraph } from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning, isToday, startOfDay } from '../../util'
import { DateTime, Duration } from 'luxon';
import { useTranslation } from 'react-i18next'
import { TodayPannelColor } from '../../styles/Colors';

const TodayPannel = ({ entry, toggleCompleted, startTodayTimer, stopTodayTimer, upsertEntry, date, dayStartHour }) => {
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
      startTodayTimer(entry.id)
    }
  
    function onPressPause(){
      stopTodayTimer(entry.id)
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