import React from 'react';
import { Text } from 'react-native-paper';

const GoalScreen = ({ route }) => (
  <Text >Goal name: {route.params.goalName}</Text>
)

export default GoalScreen;