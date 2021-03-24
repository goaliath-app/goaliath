import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList } from 'react-native';
import { List, Switch, Appbar, Menu, Text, Card, Paragraph } from 'react-native-paper';
import { Header, ThreeDotsMenu } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { selectAllActivities, toggleActivity } from '../../redux'

const data = [
  {name: 'Study Anki', repeatMode: 'daily', active: true},
  {name: 'Watch Shirokuma Cafe', repeatMode: 'weekly', active: false},
]

const Activity = ({ name, repeatMode, active, id, toggleActivity }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={
        <View style={{width: '100%' }}>
          <Text onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}>
            {name}
          </Text>
        </View>
      }
      description={repeatMode}
      right={() => (
        <Switch
          onValueChange={() => toggleActivity({id: id})} 
          value={active}/>)}
    />
  );
}

const GoalScreen = ({ activities, route, navigation, toggleActivity }) => {
  const menuItems = (
    <>
    <Menu.Item onPress={() => {}} title='Edit goal' 
      onPress={() => {
        navigation.navigate('GoalForm', { id: goalId })
      }}
    />
    <Menu.Item onPress={() => {}} title='Delete goal' />
    </>
  )

  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      repeatMode={item.repeatMode}
      id={item.id}
      toggleActivity={toggleActivity} />
  )
  const { goalId, goalName, goalMotivation } = route.params
  const headerButtons = (
    <>
    <Appbar.Action icon='plus' color='white' onPress={() => {
        navigation.navigate('ActivityForm', { goalId: goalId })
      }}
    />
    <ThreeDotsMenu menuItems={menuItems}/>
    </>
  )

  return (
    <View style={{height: '100%', justifyContent: 'space-between'}}>
      <View>
        <Header title={goalName} left='back' navigation={navigation} buttons={headerButtons}/>
        <FlatList data={activities} renderItem={renderItem} />
      </View>
      {goalMotivation?
        <Card>
          <Card.Content>        
            <Paragraph>{goalMotivation}</Paragraph>
          </Card.Content>
        </Card> : <></>}
    </View>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { goalId } = ownProps.route.params
  const activities = selectAllActivities(state)
  const thisGoalActivities = activities.filter(activity => {
    return activity.goalId == goalId
  })
  return { activities: thisGoalActivities }
};

const actionsToProps = {
  toggleActivity,
}

export default connect(mapStateToProps, actionsToProps)(GoalScreen);