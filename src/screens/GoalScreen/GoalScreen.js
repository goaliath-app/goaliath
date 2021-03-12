import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Header } from '../../components';

const GoalScreen = ({ route, navigation }) => (
  <View>
    <Header title={route.params.goalName} left='back' navigation={navigation}/>
    <Text>Goal name: {route.params.goalName}</Text>
  </View>
)

export default GoalScreen;