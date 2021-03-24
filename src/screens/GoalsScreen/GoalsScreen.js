import React from 'react';
import { connect } from 'react-redux';
import { FlatList, View, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch, Appbar, Text } from 'react-native-paper';
import { Header } from '../../components'
import { selectAllGoals, toggleGoal } from '../../redux'


const GoalListItem = ({ name, active, toggleGoal, id, motivation }) => {
  const navigation = useNavigation();

  return (
    <List.Item 
      onPress={() => navigation.navigate('Goal', { headerTitle: name, goalName: name, goalId: id, goalMotivation: motivation})}
      title={
        <View style={{width: '100%'}}>
          <Text>
              {name}
          </Text>
        </View>}
       right={() => (
        <Pressable onPress={() => {}}>
          <Switch onStartShouldSetResponder={()=>{true}} value={active} onValueChange={ () => toggleGoal({id: id}) }/>
        </Pressable>
       )}
    />
  );
}



const GoalsScreen = ({ navigation, goals, toggleGoal }) => {
  const renderItem = ({ item }) => (
    <GoalListItem
      id={item.id}
      name={item.name}
      active={item.active} 
      toggleGoal={toggleGoal}
      motivation={item.motivation} />
  )

  return(
    <View>
      <Header 
        title='Goals' left='hamburger' navigation={navigation} 
        buttons={
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} />
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