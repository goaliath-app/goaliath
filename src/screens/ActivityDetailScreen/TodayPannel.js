import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import { 
  Button, List, Checkbox, Divider, Paragraph, TextInput, withTheme, Portal, 
  Dialog, Title, Caption, IconButton
} from 'react-native-paper';
import { TimeInput } from '../../components';
import { getTodayTime, isActivityRunning, isToday, startOfDay } from '../../util'
import { DateTime, Duration } from 'luxon';
import { useTranslation } from 'react-i18next'
import { 
  setRepetitions, toggleCompleted, upsertEntry, startTodayTimer, stopTodayTimer,
  selectEntryByActivityIdAndDate 
} from './../../redux'
import { usesRepetitions, getTimeGoal } from '../../activityHandler'
import Notifications from '../../notifications';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faArrowUpRightFromSquare } from '@fortawesome/free-regular-svg-icons'
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';





export const TodayPannelModal = withTheme(({ 
  date, activity, entry, theme, timerDisabled=false, visible=true, onDismiss=()=>{}
}) => {
  const dayStartHour = useSelector(state => state.settings.dayStartHour)
  const navigation = useNavigation()

  return (
    <Portal>
      {/* { visible ? 
        <View style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: theme.colors.neutral0, opacity: 0.2 }} />
      : null } */}
      <Dialog visible={visible} onDismiss={onDismiss} style={{marginHorizontal: 15}}>
        <Dialog.Content style={{margin: 0, padding: 0, paddingRight: 0, paddingTop: 18}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}} >
            <View>
              <Title>{activity.name}</Title>
              <Caption>Japanese</Caption>
            </View>
            <IconButton 
              style={{marginTop: 0, marginRight: 10, height: 50, width: 50}}
              icon={
                () => <IonIcon size={30} name={"md-open-outline"}/>
              } 
              onPress={() => { 
                onDismiss()    
                navigation.navigate('ActivityDetail', {activityId: activity.id, date: date.toISO()})}
              }/>
            
          </View>
          <Divider style={{marginRight: 25}}/>
          <View style={{height:10}} />
          <TodayPannel 
            timerDisabled={timerDisabled}
            entry={entry}
            date={date}
            dayStartHour={dayStartHour}
            activity={activity}
          /> 
        </Dialog.Content>
      </Dialog>
    </Portal>
  )
})


const TodayPannel = withTheme(({ timerDisabled=false, entry, date, dayStartHour, activity, theme }) => {
  
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
              onPress={() => {dispatch(toggleCompleted({date: date, id: entry.id}))} }
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
            keyboardType='numeric' 
            underlineColor='transparent'
            selectionColor='transparent'
            />
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
    </View>
  )
})

  export default TodayPannel;