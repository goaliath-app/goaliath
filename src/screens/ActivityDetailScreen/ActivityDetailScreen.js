import React from 'react';
import { Button } from 'react-native-paper';

const ActivityDetailScreen = ({ navigation }) => (
  <Button onPress={() => navigation.push('ActivityDetail')}>Go Deeper</Button>
)

export default ActivityDetailScreen;