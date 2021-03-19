import React from 'react';
import { View } from 'react-native'
import { Button, List, Checkbox, Divider, Appbar, Menu } from 'react-native-paper';
import { Header, TimeInput, ThreeDotsMenu } from '../../components';

const data = {
  goal: 'Japanese', frecuency: 'Daily', weekHours: 3, weekTimes: 2, hours: 5, times: 4, previousScreen: ''
}

const ActivityDetailScreen = ({ route, navigation }) => {
  const menuItems = (
    <>
    <Menu.Item onPress={() => {}} title='Edit activity' />
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
      <Header title={route.params.activityName} left='back' navigation={navigation} buttons={headerButtons(data.previousScreen)} />
      <BasicActivityInfo />
      <TodayPannel />
      <WeekStats />
      <GenericStats />
      
    </View>
  )
}

const BasicActivityInfo =() => (
  <View>
    <List.Item
      title={'Goal: ' + data.goal}
    />
    <List.Item
      title={'Frecuency: ' + data.frecuency}
    />
    <Divider />
  </View>
)
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
export default ActivityDetailScreen;