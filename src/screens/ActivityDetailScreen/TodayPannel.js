import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import {
  Button, List, Checkbox, Divider, Paragraph, TextInput, withTheme, Portal,
  Dialog, Title, Caption, IconButton
} from 'react-native-paper';
import { TimeInput, SelfManagedThreeDotsMenu } from '../../components';
import { isActivityRunning } from '../../util'
import { getTodayTime, isToday, startOfDay, serializeDate } from '../../time';
import { DateTime, Duration } from 'luxon';
import { useTranslation } from 'react-i18next'
import {
  setRepetitions, toggleCompleted, upsertEntry, startTodayTimer, stopTodayTimer
} from './../../redux'
import { usesRepetitions, getTimeGoal } from '../../activityHandler'
import Notifications from '../../notifications';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';




export const TodayPannelModal = withTheme(({ 
  date, activity, goal, entry, theme, timerDisabled=false, visible=true, onDismiss=()=>{}
}) => {
  const dayStartHour = useSelector(state => state.settings.dayStartHour)
  const navigation = useNavigation()
  const { t, i18 } = useTranslation()

  const menuItems = [
    {
      title: t('activityListItem.longPressMenu.edit'),
      onPress: () => {
        onDismiss()
        navigation.navigate('ActivityForm', { activityId: activity.id } )
      }
    },
    {
      title: t('activityListItem.longPressMenu.viewGoal'),
      onPress: () => {
        onDismiss()
        navigation.navigate('Goal', { goalId: activity.goalId } )
      }
    }
  ]

  return (
    <Portal>
      {/* { visible ? 
        <View style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: theme.colors.neutral0, opacity: 0.2 }} />
      : null } */}
      <Dialog visible={visible} 
        onDismiss={onDismiss} 
        style={{marginHorizontal: 15, marginTop: 0, backgroundColor: theme.colors.dialogBackground}}>
        <Dialog.Content style={{margin: 0, padding: 0, paddingRight: 0, paddingTop: 0, paddingLeft: 0}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}} >
              <View style={{margin: 18}}>
                <Title>{activity.name}</Title>
                <Caption>{goal.name}</Caption>
              </View>
            <View style={{flexDirection: 'row', marginTop: 8}}>
              <IconButton 
                style={{marginRight: 0, height: 50, width: 50}}
                icon={
                () => <IonIcon color={theme.colors.onSurface} size={30} name={"open-outline"}/>
                } 
                onPress={() => { 
                  onDismiss()    
                  navigation.navigate('ActivityDetail', {activityId: activity.id, date: serializeDate(date)})}
                }/>
              <SelfManagedThreeDotsMenu items={menuItems} color={theme.colors.onSurface} size={30} />
            </View>
          </View>
          <Divider style={{marginHorizontal: 25}}/>
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
      startDate: serializeDate(DateTime.now().minus({seconds})), 
      endDate: serializeDate(DateTime.now())
    }:{
      startDate: serializeDate(startOfDay(date, dayStartHour)),
      endDate: serializeDate(date.plus({seconds}))
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