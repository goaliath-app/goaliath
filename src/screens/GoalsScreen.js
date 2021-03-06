import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Appbar, Divider, Switch, Menu } from 'react-native-paper';
import { Text, Paragraph, Portal, Snackbar, Dialog, Button } from 'react-native-paper'

import { Header, InfoCard, ThreeDotsMenu, DeleteGoalDialog, BottomScreenPadding } from '../components'

import { selectAllGoals, toggleGoal } from '../redux'
import { hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import { useSelector } from 'react-redux'
import { selectAllActiveActivitiesByGoalIdAndDate, getTodaySelector } from '../redux';


const GoalListItem = ({ name, active, id }) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)

  const navigation = useNavigation();

  const today= useSelector(getTodaySelector)
  const activities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, id, today))

  const dispatch = useDispatch();

  return (
    <View>
      <List.Item 
        onPress={() => navigation.navigate('Goal', { goalId: id })}
        onLongPress={() => setLongPressDialogVisible(true)}
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch 
            value={active} 
            onValueChange={ () => dispatch(toggleGoal(id)) }
          />
        )}
        description={t('goals.goalDescription', {activitiesNumber: activities.length})}
      />
      <Divider />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("goals.longPressMenu.edit")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('GoalForm', { id: id } )
              }} />
              <Divider />
              <List.Item title={t("goals.longPressMenu.archive")} onPress={() => {
                setLongPressDialogVisible(false)
                setDeleteDialogVisible(true)
              }} />
              <Divider />
              <List.Item title={t("goals.longPressMenu.add")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('ActivityForm', { goalId: id } )
              }} />
              <Divider />
              <List.Item title={t("goals.longPressMenu.viewArchivedActivities")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate("ArchivedActivities", { goalId: id })
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>

      <DeleteGoalDialog 
        visible={isDeleteDialogVisible} 
        onDismiss={() => {setDeleteDialogVisible(false)}} 
        goalId={id} />
    </View>
  );
}

const GoalsScreen = ({ navigation, goals }) => {
  const { t, i18n } = useTranslation()
  const [menuVisible, setMenuVisible] = React.useState(false);
  
  const renderItem = ({ item }) => (
    <GoalListItem
      id={item.id}
      name={item.name}
      active={item.active} 
      motivation={item.motivation} 
    />
  )

  const menuItems = (
    <>
    <Menu.Item title={t("goals.menu.viewArchived")} 
      onPress={() => {
        setMenuVisible(false)
        navigation.navigate('ArchivedGoals')
      }}
    />
    </>
  )
      
  return(
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('goals.headerTitle')} left='hamburger' navigation={navigation} 
        buttons={
        <>
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color="white"/>
          <ThreeDotsMenu 
            menuItems={menuItems} 
            openMenu= {() => setMenuVisible(true)} 
            closeMenu= {() => setMenuVisible(false)} 
            visible={menuVisible} 
          />
        </>
        }/>
      {hasSomethingToShow(goals)?
        <FlatList data={goals} renderItem={renderItem} ListFooterComponent={BottomScreenPadding} />
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