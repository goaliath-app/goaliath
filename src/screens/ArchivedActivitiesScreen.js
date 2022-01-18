import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList } from 'react-native';
import { List, Switch, Divider, Portal, Dialog, withTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import { Header, InfoCard } from '../components';
import { selectAllActivities, selectGoalById, restoreActivity } from '../redux'
import { getFrequencyString } from '../activityHandler'

const Activity = ({ name, active, id, activity, goal }) => {
  const navigation = useNavigation();
  const { t, i18 } = useTranslation();
  const dispatch = useDispatch();

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))

  return (
    <View>
      <List.Item
        style={{paddingTop: 5}}
        onLongPress={() => setLongPressDialogVisible(true)}
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

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("archivedActivitiesScreen.longPressMenu.restore")} onPress={() => {
                dispatch(restoreActivity(activity.id))
                setLongPressDialogVisible(false)
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const ArchivedActivitiesScreen = withTheme(({ theme, route, navigation }) => {
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
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header title={t("archivedActivitiesScreen.title", {goalName: goal.name})} left='back' navigation={navigation} />
      <View style={{ flex: 1 }}>
        {thisGoalArchivedActivities.length > 0?
          <FlatList data={thisGoalArchivedActivities} renderItem={renderItem} />
          :
          <InfoCard title={t("archivedActivitiesScreen.empty")} />
        } 
      </View>
    </View>
  )
})

export default ArchivedActivitiesScreen;