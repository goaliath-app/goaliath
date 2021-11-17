import React from 'react';
import { useSelector } from 'react-redux';
import { View, FlatList } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import { Header, InfoCard } from '../components';
import { selectAllActivities, selectGoalById } from '../redux'
import { GeneralColor } from '../styles/Colors';
import { getFrequencyString } from '../activityHandler'

const Activity = ({ name, active, id, activity, goal }) => {
  const navigation = useNavigation();
  const { t, i18 } = useTranslation();

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))

  return (
    <View>
      <List.Item
        style={{paddingTop: 5}}
        onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}
        title={name}
        right={() => (
          <Switch
            disabled={true}
            value={active}
          />
        )}
        description={frequencyString} 
      />
      <Divider />
    </View>
  );
}

const ArchivedActivitiesScreen = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  const { goalId } = route.params

  const goal = useSelector((state) => selectGoalById(state, goalId))
  const allActivities = useSelector(selectAllActivities)
  const thisGoalArchivedActivities = allActivities.filter(activity => {
    return activity.goalId == goalId && activity.archived
  })
  
  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      id={item.id}
      activity={item}
      goal={goal} />
  )

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t("archivedActivitiesScreen.title", {goalName: goal.name})} left='back' navigation={navigation} />
      <View style={{ flex: 1 }}>
        {thisGoalArchivedActivities.length > 0?
          <FlatList data={thisGoalArchivedActivities} renderItem={renderItem} />
          :
          <InfoCard content={t("archivedActivitiesScreen.empty")} />
        } 
      </View>
    </View>
  )
}

export default ArchivedActivitiesScreen