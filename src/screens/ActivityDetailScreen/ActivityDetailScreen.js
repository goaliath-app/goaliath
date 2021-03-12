import React from 'react';
import { View } from 'react-native'
import { Button } from 'react-native-paper';
import { Header } from '../../components';

const ActivityDetailScreen = ({ navigation }) => (
  <View>
    <Header title='Activity Details' left='back' navigation={navigation}/>
    <Button onPress={() => navigation.push('ActivityDetail')}>Go Deeper</Button>
  </View>
)

export default ActivityDetailScreen;