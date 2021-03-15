import React from 'react';
import { connect } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch, Appbar, Text } from 'react-native-paper';
import { Header } from '../../components'
import { selectAllGoals, toggleGoal } from '../../redux/GoalsSlice'


const GoalListItem = ({ name, activated, toggleGoal }) => {
  const navigation = useNavigation();

  return (
    <List.Item 
      title={
        <View style={{width: '100%'}}>
          <Text 
            onPress={() => navigation.navigate('Goal', { headerTitle: name, goalName: name })}>
              {name}
          </Text>
        </View>}
       right={() => <Switch value={activated} onValueChange={ () => toggleGoal({id: 0}) }/>}
    />
  );
}



const GoalsScreen = ({ navigation, goals, toggleGoal }) => {
  const renderItem = ({ item }) => (
    <GoalListItem
      name={item.name}
      activated={item.activated} 
      toggleGoal={toggleGoal}/>
  )

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

const actionsToProps = {
  toggleGoal,
}

export default connect(mapStateToProps, actionsToProps)(GoalsScreen);