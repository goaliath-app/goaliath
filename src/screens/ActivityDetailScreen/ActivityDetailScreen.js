import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Button, List, Checkbox, Divider, Appbar, Menu } from 'react-native-paper';
import { Header, TimeInput, ThreeDotsMenu } from '../../components';
import { selectActivityById, selectGoalById } from '../../redux'

const data = {
  goal: 'Japanese', frecuency: 'Daily', weekHours: 3, weekTimes: 2, hours: 5, times: 4, previousScreen: ''
}

const ActivityDetailScreen = ({ activity, goal, navigation }) => {
  const menuItems = (
    <>
    <Menu.Item title='Edit activity'
      onPress={() => {
        navigation.navigate('ActivityForm', { activityId: activity.id })
      }} 
    />
    <Menu.Item onPress={() => {}} title='Delete activity' />
    </>
  )
  const headerButtons = (previousScreen) => {
    if(previousScreen=='Goal'){
      return <Appbar.Action icon='pencil' color='white'/>
    } else {return <ThreeDotsMenu menuItems={menuItems}/>}
  }

  return(
    <View>
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons(data.previousScreen)} />
      <BasicActivityInfo activity={activity} goal={goal}/>
      {/* delayed until we start working on daily and weekly screens 
      <TodayPannel />
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
        frequency = `${activity.timesPerWeek} times per week.`
      }else{
        frequency = `${activity.timeGoal} seconds per week.`
      }
      break
    case 'select':
      let days = ''
      for (let day in activity.weekDays){
        if (activity.weekDays[day]){
          days = `${days} ${day.substring(0,2)}`
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

const TodayPannel = () => (
  <View>
    <List.Item
      title='Today'
      right={() => <Checkbox status='unchecked' />}
    />
    <TimeInput />
    <Button>Start Timer</Button>
    <Divider />
  </View>
)

const GenericStats = () => (
  <View>
    <List.Item title='Stats' />
    <List.Item
      left={() => <List.Icon icon="clock-outline" />}
      title={data.hours + ' total hours dedicated'}
    />
    <List.Item
      left={() => <List.Icon icon="check-circle-outline" />}
      title={data.times + ' times completed'}
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
      title={data.weekTimes + ' times completed'}
    />
    <Divider />
  </View>
)

const mapStateToProps = (state, ownProps) => {
  const activityId = ownProps.route.params.activityId
  const activity = selectActivityById(state, activityId)
  const activityGoalId = activity.goalId
  const goal = selectGoalById(state, activityGoalId)

  return { activity, goal }
}

export default connect(mapStateToProps)(ActivityDetailScreen);