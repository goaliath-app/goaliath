import React from 'react';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch } from 'react-native-paper';
import { Header } from '../../components'

const data = [
  {name: 'Japanese', activated: true},
  {name: 'Beautiful garden', activated: false},
]

const GoalListItem = ({ name, activated }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={name}
      right={() => <Switch value={activated}/>}
      onPress={() => navigation.navigate('Goal', { headerTitle: name, goalName: name })}
    />
  );
}

const renderItem = ({ item }) => (
  <GoalListItem
    name={item.name}
    activated={item.activated} />
)

const GoalsScreen = ({ navigation }) => (
  <View>
    <Header title='Goals' left='hamburger' navigation={navigation}/>
    <FlatList data={data} renderItem={renderItem} />
  </View>
)

export default GoalsScreen;