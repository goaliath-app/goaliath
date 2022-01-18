import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Switch, Divider, Portal, Dialog, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { selectAllGoals, toggleGoal, restoreGoal } from '../redux'
import { Header, InfoCard, } from '../components'


const ArchivedGoalListItem = ({ name, active, id }) => {
  const { t, i18 } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)

  return (
    <View>
      <List.Item 
        onPress={() => navigation.navigate('Goal', { goalId: id })}
        onLongPress={() => setLongPressDialogVisible(true)}
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

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("archivedGoalsScreen.longPressMenu.restore")} onPress={() => {
                dispatch(restoreGoal(id))
                setLongPressDialogVisible(false)
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const ArchivedGoalsScreen = withTheme(({ theme, navigation }) => {
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
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header 
        title={t("archivedGoalsScreen.title")} left='back' navigation={navigation} 
      />
      {archivedGoals.length > 0?
        <FlatList data={archivedGoals} renderItem={renderItem} />
      :
        <InfoCard title={t("archivedGoalsScreen.empty")} />
      }
    </View>
  )
})

export default ArchivedGoalsScreen;