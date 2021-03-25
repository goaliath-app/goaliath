import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Button, List, Checkbox, Divider, Appbar, Menu } from 'react-native-paper';
import { Header, TimeInput, ThreeDotsMenu } from '../../components';
import { selectActivityById, selectGoalById, selectTodayEntryByActivityId, toggleCompleted, startTimer, stopTimer, upsertTodaysEntry } from '../../redux'
import { getTodayTime, isActivityRunning } from '../../util'
import { DateTime } from 'luxon';


const data = {
  goal: 'Japanese', frecuency: 'Daily', weekHours: 3, weekTimes: 2, hours: 5, times: 4, previousScreen: ''
}

const ActivityDetailScreen = ({ activity, goal, entry, navigation, toggleCompleted, stopTimer, startTimer, upsertTodaysEntry }) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuItems = (
    <>
    <Menu.Item title='Edit activity'
      onPress={() => {
        closeMenu()
        navigation.navigate('ActivityForm', { activityId: activity.id })
      }} 
    />
    <Menu.Item onPress={() => {}} title='Delete activity' />
    </>
  )
  const headerButtons = (previousScreen) => {
    if(previousScreen=='Goal'){
      return <Appbar.Action icon='pencil' color='white' />
    } else {return <ThreeDotsMenu menuItems={menuItems} openMenu= {openMenu} closeMenu= {closeMenu} visible={visible} />}
  }

  return(
    <View>
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons(data.previousScreen)} />
      <BasicActivityInfo activity={activity} goal={goal} />
 
    {entry?
      <TodayPannel entry={entry} toggleCompleted={toggleCompleted} startTimer={startTimer} stopTimer={stopTimer} upsertTodaysEntry={upsertTodaysEntry} /> : null}
      {/* delayed until we start working on daily and weekly screens 
      <WeekStats />
      <GenericStats /> 
      */}
    </View>
  )
}

const BasicActivityInfo = ({ activity, goal }) => {
  let frequency 
  switch(activity.repeatMode){
    case 'weekly':
      if(activity.goal=='check'){
        frequency = `${activity.timesPerWeek} days per week.`
      }else{
        frequency = `${activity.timeGoal} seconds per week.`
      }
      break
    case 'select':
      let days = ''
      const labels = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'}
      for (let day in activity.weekDays){
        if (activity.weekDays[day]){
          days = `${days} ${labels[day]}`
        }
      }
      if(activity.goal=='check'){
        frequency = `Do on ${days}`
      }else{
        frequency = `${activity.timeGoal} seconds on ${days}`
      }
      break
    case 'daily':
      if(activity.goal=='check'){
        frequency = "Every day."
      }else{
        frequency = `${activity.timeGoal} seconds every day.`
      }
      break
    default:
      frequency = 'ERROR'
  }

  return (
    <View>
      <List.Item
        title={'Goal: ' + goal.name}
      />
      <List.Item
        title={'Frequency: ' + frequency}
      />
      <Divider />
    </View>
  )
}

const TodayPannel = ({ entry, toggleCompleted, startTimer, stopTimer, upsertTodaysEntry }) => {
  console.log(entry)
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
    setTodayTime(value*3600 + todayTime % 3600)
    updateTotalTime(value*3600 + todayTime % 3600)
  }
  function setMinutes(value){
    setTodayTime((Math.floor(todayTime/3600)*3600) + value*60 + todayTime % 60)
    updateTotalTime((Math.floor(todayTime/3600)*3600) + value*60 + todayTime % 60)
  }
  function setSeconds(value){
    setTodayTime(value + Math.floor(todayTime/60)*60)
    updateTotalTime(value + Math.floor(todayTime/60)*60)
  }

  let seconds, minutes, hours
  seconds = String(todayTime % 60).padStart(2, '0')
  minutes = String(Math.floor(todayTime / 60) % 60).padStart(2, '0')
  hours = String(Math.floor(todayTime / 3600)).padStart(2, '0')

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

const GenericStats = () => (
  <View>
    <List.Item title='Stats' />
    <List.Item
      left={() => <List.Icon icon="clock-outline" />}
      title={data.hours + ' total hours dedicated'}
    />
    <List.Item
      left={() => <List.Icon icon="check-circle-outline" />}
      title={data.times + ' days completed'}
    />
    <Divider />
  </View>
)

const WeekStats = () => (
  <View>
    <List.Item title='This Week' />
    <List.Item
      left={() => <List.Icon icon="clock-outline" />}
      title={data.weekHours + ' total hours dedicated'}
    />
    <List.Item
      left={() => <List.Icon icon="check-circle-outline" />}
      title={data.weekTimes + ' days completed'}
    />
    <Divider />
  </View>
)

const mapStateToProps = (state, ownProps) => {
  const activityId = ownProps.route.params.activityId
  const activity = selectActivityById(state, activityId)
  const activityGoalId = activity.goalId
  const goal = selectGoalById(state, activityGoalId)
  const showLog = ownProps.route.params.showLog
  let entry 
  if(showLog){
    entry = selectTodayEntryByActivityId(state, activityId)
  }
      
  return { activity, goal, entry }
}

const actionToProps = {
  toggleCompleted,
  stopTimer,
  startTimer,
  upsertTodaysEntry
}

export default connect(mapStateToProps, actionToProps)(ActivityDetailScreen);