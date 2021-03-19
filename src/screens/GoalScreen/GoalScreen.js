import React from 'react';
import { View, FlatList } from 'react-native';
import { List, Switch, Appbar, Menu } from 'react-native-paper';
import { Header, ThreeDotsMenu } from '../../components';
import { useNavigation } from '@react-navigation/native';

const data = [
  {name: 'Study Anki', period: 'daily', activated: true},
  {name: 'Watch Shirokuma Cafe', period: 'weekly', activated: false},
]

const Activity = ({ name, period, activated }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={name}
      description={period}
      right={() => <Switch value={activated}/>}
      onPress={() => navigation.navigate('ActivityDetail', { activityName: name})}
    />
  );
}

const renderItem = ({ item }) => (
  <Activity
    name={item.name}
    activated={item.activated}
    period={item.period} />
)

const GoalScreen = ({ route, navigation }) => {
  const menuItems = (
    <>
    <Menu.Item onPress={() => {}} title='Edit goal' />
    <Menu.Item onPress={() => {}} title='Delete goal' />
    </>
  )

  const headerButtons = (
    <>
      <Appbar.Action icon='plus' color='white' onPress={() => navigation.navigate('NewActivity')} />
      <ThreeDotsMenu menuItems={menuItems}/>
    </>
  )

  return (
    <View>
      <Header title={route.params.goalName} left='back' navigation={navigation} buttons={headerButtons}/>
      <FlatList data={data} renderItem={renderItem} />
    </View>
  )
}

export default GoalScreen;