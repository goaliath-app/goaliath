import React from 'react';
import { FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Text, List, Switch } from 'react-native-paper';

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

const GoalsScreen = () => (
    <FlatList
    data={data}
    renderItem={renderItem}
  />
)

export default GoalsScreen;