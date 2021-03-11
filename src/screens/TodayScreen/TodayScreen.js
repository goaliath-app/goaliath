import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, IconButton, List } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';

const data = [
  {title: 'Anki'},
  {title: 'Cure Dolly', description: 'Dedicated 2 of 4 hours'},
  {title: 'Genki', description: 'Dedicated 0 of 1 hour'}
]

const renderItem = ({ item }) => (
  <DailyActivityListItem 
    activityName={item.title} 
    description={item.description} />
)

const DailyActivityListItem = ({ activityName, description }) => {
  const navigation = useNavigation();

  return (  
    <List.Item
      title={activityName}
      description={description}
      onPress={() => navigation.navigate('ActivityDetail')}
    />
  );
}

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <FlatList
        data={data}
        renderItem={renderItem}
      />
    </View>
  );
}

export default HomeScreen;