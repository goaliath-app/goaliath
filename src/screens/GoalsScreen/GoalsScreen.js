import React from 'react';
import { connect } from 'react-redux';
import { FlatList, View, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch, Appbar } from 'react-native-paper';
import { Header, InfoCard } from '../../components'
import { selectAllGoals, toggleGoal } from '../../redux'
import { hasSomethingToShow } from '../../util'
import { useTranslation } from 'react-i18next'


const GoalListItem = ({ name, active, toggleGoal, id }) => {
  const navigation = useNavigation();

  return (
    <List.Item 
      onPress={() => navigation.navigate('Goal', { goalId: id })}
      title={name}
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
    
  const { t, i18n } = useTranslation()
    
  const infoContent = t('goals.infoContent')
  
  return(
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header 
        title={t('goals.headerTitle')} left='hamburger' navigation={navigation} 
        buttons={
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} />
        }/>
      {hasSomethingToShow(goals)?
        <FlatList data={goals} renderItem={renderItem} />
      :
        <InfoCard content={infoContent} />
      }
      
      
    </View>
  )
}

const mapStateToProps = (state) => {
  const goals = selectAllGoals(state)
  const goalsToShow = goals.filter(goal => {
    return !goal.archived
  })
  return { goals: goalsToShow }
};

const actionsToProps = {
  toggleGoal,
}

export default connect(mapStateToProps, actionsToProps)(GoalsScreen);