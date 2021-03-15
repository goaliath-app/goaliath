import React from 'react';
import { connect } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch, Appbar } from 'react-native-paper';
import { Header } from '../../components'
import { selectAllGoals } from '../../redux/GoalsSlice'


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

const GoalsScreen = ({ navigation, goals }) => {
  return(
    <View>
      <Header 
        title='Goals' left='hamburger' navigation={navigation} 
        buttons={
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('NewGoal')} />
        }/>
      <FlatList data={goals} renderItem={renderItem} />
    </View>
  )
}

const mapStateToProps = (state) => {
  const goals = selectAllGoals(state)
  return { goals }
};

export default connect(mapStateToProps)(GoalsScreen);