import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Appbar, Divider, Switch } from 'react-native-paper';
import { Header, InfoCard } from '../components'
import { selectAllGoals, toggleGoal } from '../redux'
import { hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';


const GoalListItem = ({ name, active, id }) => {
  const navigation = useNavigation();

  const dispatch = useDispatch();

  return (
    <View>
      <List.Item 
        onPress={() => navigation.navigate('Goal', { goalId: id })}
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch 
            value={active} 
            onValueChange={ () => dispatch(toggleGoal(id)) }
          />
        )}
      />
      <Divider />
    </View>
  );
}

const GoalsScreen = ({ navigation, goals }) => {
  const { t, i18n } = useTranslation()
  
  const renderItem = ({ item }) => (
    <GoalListItem
      id={item.id}
      name={item.name}
      active={item.active} 
      motivation={item.motivation} 
    />
  )
      
  return(
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('goals.headerTitle')} left='hamburger' navigation={navigation} 
        buttons={
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} />
        }/>
      {hasSomethingToShow(goals)?
        <FlatList data={goals} renderItem={renderItem} />
      :
        <InfoCard content={t('goals.infoContent')} />
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

export default connect(mapStateToProps)(GoalsScreen);