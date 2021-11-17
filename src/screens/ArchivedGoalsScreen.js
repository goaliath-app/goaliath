import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Divider, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { selectAllGoals, toggleGoal } from '../redux'
import { GeneralColor } from '../styles/Colors';
import { Header, InfoCard, } from '../components'


const ArchivedGoalListItem = ({ name, active, id }) => {
  const navigation = useNavigation();

  const dispatch = useDispatch();

  return (
    <View>
      <List.Item 
        onPress={() => navigation.navigate('Goal', { goalId: id })}
        title={name}
        right={() => (
          <Switch 
            disabled={true}
            value={active} 
            onValueChange={ () => dispatch(toggleGoal(id)) }
          />
        )}
      />
      <Divider />
    </View>
  );
}

const ArchivedGoalsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  const goals = useSelector(selectAllGoals)
  const archivedGoals = goals.filter(goal => goal.archived)
  const renderItem = ({ item }) => (
    <ArchivedGoalListItem
      id={item.id}
      name={item.name}
      active={item.active} 
      motivation={item.motivation} 
    />
  )
      
  return(
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t("archivedGoalsScreen.title")} left='back' navigation={navigation} 
      />
      {archivedGoals.length > 0?
        <FlatList data={archivedGoals} renderItem={renderItem} />
      :
        <InfoCard content={t("archivedGoalsScreen.empty")} />
      }
    </View>
  )
}

export default ArchivedGoalsScreen