import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList, Pressable } from 'react-native';
import { List, Switch, Appbar, Menu, Text, Card, Paragraph } from 'react-native-paper';
import { Header, ThreeDotsMenu } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { selectAllActivities, selectGoalById, toggleActivity } from '../../redux'

const data = [
  {name: 'Study Anki', repeatMode: 'daily', active: true},
  {name: 'Watch Shirokuma Cafe', repeatMode: 'weekly', active: false},
]

const Activity = ({ name, active, id, toggleActivity }) => {
  const navigation = useNavigation();

  return (
    <List.Item
     onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}
      title={
        <View style={{width: '100%' }}>
          <Text>
            {name}
          </Text>
        </View>
      }
      right={() => (
        <Pressable onPress={() => {}}>
          <Switch
            onValueChange={() => toggleActivity({id: id})} 
            value={active}
          />
        </Pressable>
      )}
    />
        
  );
}

const GoalScreen = ({ activities, goal, navigation, toggleActivity }) => {
  const menuItems = (
    <>
    <Menu.Item onPress={() => {}} title='Edit goal' 
      onPress={() => {
        navigation.navigate('GoalForm', { id: goal.id })
      }}
    />
    <Menu.Item onPress={() => {}} title='Delete goal' />
    </>
  )

  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      id={item.id}
      toggleActivity={toggleActivity} />
  )
  //const { goalId, goalName, goalMotivation } = route.params
  const headerButtons = (
    <>
    <Appbar.Action icon='plus' color='white' onPress={() => {
        navigation.navigate('ActivityForm', { goalId: goal.id })
      }}
    />
    <ThreeDotsMenu menuItems={menuItems}/>
    </>
  )

  return (
    <View style={{height: '100%', justifyContent: 'space-between'}}>
      <View>
        <Header title={goal.name} left='back' navigation={navigation} buttons={headerButtons}/>
        <FlatList data={activities} renderItem={renderItem} />
      </View>
      {goal.motivation?
        <Card>
          <Card.Content>        
            <Paragraph>{goal.motivation}</Paragraph>
          </Card.Content>
        </Card> : <></>}
    </View>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { goalId } = ownProps.route.params
  const activities = selectAllActivities(state)
  const goal = selectGoalById(state, goalId)
  const thisGoalActivities = activities.filter(activity => {
    return activity.goalId == goalId
  })
  return { activities: thisGoalActivities, goal: goal }
};

const actionsToProps = {
  toggleActivity,
}

export default connect(mapStateToProps, actionsToProps)(GoalScreen);