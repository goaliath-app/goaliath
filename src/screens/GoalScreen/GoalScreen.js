import React from 'react';
import { View, FlatList } from 'react-native';
import { List, Switch, Appbar } from 'react-native-paper';
import { Header } from '../../components';

const data = [
  {name: 'Study Anki', activated: true},
  {name: 'Watch Shirokuma Cafe', activated: false},
]

const Activity = ({ name, activated }) => {
  return (
    <List.Item
      title={name}
      right={() => <Switch value={activated}/>}
    />
  );
}

const renderItem = ({ item }) => (
  <Activity
    name={item.name}
    activated={item.activated} />
)

const GoalScreen = ({ route, navigation }) => {
  const headerButtons = (
    <>
    <Appbar.Action icon='pencil' color='white'/>
    <Appbar.Action icon='plus' color='white' onPress={() => navigation.navigate('NewActivity')}/>
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