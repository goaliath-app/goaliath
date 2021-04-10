import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList, Pressable } from 'react-native';
import { List, Switch, Appbar, Menu, Card, Paragraph } from 'react-native-paper';
import { Header, ThreeDotsMenu, DeleteDialog } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { selectAllActivities, selectGoalById, toggleActivity, archiveGoal } from '../../redux'
import { frequency } from '../../util'

const data = [
  {name: 'Study Anki', repeatMode: 'daily', active: true},
  {name: 'Watch Shirokuma Cafe', repeatMode: 'weekly', active: false},
]

const Activity = ({ name, active, id, toggleActivity, activity }) => {
  const navigation = useNavigation();

  return (
    <List.Item
     onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}
      title={name}
      right={() => (
        <Pressable onPress={() => {}}>
          <Switch
            onValueChange={() => toggleActivity({id: id})} 
            value={active}
          />
        </Pressable>
      )}
      description={frequency(activity)} 
    />
        
  );
}

const GoalScreen = ({ activities, goal, navigation, toggleActivity, archiveGoal }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const menuItems = (
    <>
    <Menu.Item title='Edit goal' 
      onPress={() => {
        closeMenu()
        navigation.navigate('GoalForm', { id: goal.id } )
      }}
    />
    <Menu.Item onPress={() => {
      setMenuVisible(false)
      setDeleteDialogVisible(true)
      }} title='Delete goal' />
    </>
  )

  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      id={item.id}
      toggleActivity={toggleActivity}
      activity={item} />
  )
  //const { goalId, goalName, goalMotivation } = route.params
  const headerButtons = (
    <>
    <Appbar.Action icon='plus' color='white' onPress={() => {
        navigation.navigate('ActivityForm', { goalId: goal.id })
      }}
    />
    <ThreeDotsMenu menuItems={menuItems} openMenu= {openMenu} closeMenu= {closeMenu} visible={menuVisible} />
    </>
  )

  return (
    <>
    <DeleteDialog 
      visible={deleteDialogVisible} 
      setVisible={setDeleteDialogVisible} 
      onDelete={()=>{
        archiveGoal(goal.id)
        setDeleteDialogVisible(false)
        navigation.goBack()
      }}
      title='Delete goal?'
      body="This will delete all its activities. Can't be undone."
    />
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
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  const { goalId } = ownProps.route.params
  const activities = selectAllActivities(state)
  const goal = selectGoalById(state, goalId)
  const thisGoalActivities = activities.filter(activity => {
    return activity.goalId == goalId && !activity.archived
  })
  return { activities: thisGoalActivities, goal: goal }
};

const actionsToProps = {
  toggleActivity,
  archiveGoal
}

export default connect(mapStateToProps, actionsToProps)(GoalScreen);