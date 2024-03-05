import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { View, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import {
  List, Appbar, Divider, Switch, Menu, Portal, Dialog, withTheme,
  Text
} from 'react-native-paper';
import {
  Header, InfoCard, ThreeDotsMenu, DeleteGoalDialog, ViewHighlighter,
  useTooltip, useTooltipAnchor,
} from '../components'
import { hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import {
  selectAllActiveActivitiesByGoalIdAndDate, getTodaySelector, selectAllGoals,
  toggleGoal, selectTutorialState, selectAllActivities
} from '../redux';
import tutorialStates from '../tutorialStates'


const GoalListItem = withTheme(({ theme, name, active, id }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  const Tooltip = useTooltip('goalsListItem', 'goalListItem'+id)

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)

  const tutorialState = useSelector(selectTutorialState)

  const navigation = useNavigation();

  const today= useSelector(getTodaySelector)
  const activities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, id, today))


  const amIHighlighted = (
    tutorialState >= tutorialStates.GoalScreenIntroduction
    && tutorialState < tutorialStates.ActivitiesInTodayScreen
    && id == 0
  )

  return (

    <View>
      <Tooltip
        content={<Text style={{fontSize: 16}}>{t('tooltips.firstGoal')}</Text>}
      >
      <ViewHighlighter active={amIHighlighted} containerStyle={{width: '100%'}}>
        <List.Item
          style={{backgroundColor: theme.colors.surface}}
          onPress={() => navigation.navigate('Goal', { goalId: id })}
          onLongPress={
            tutorialState == tutorialStates.Finished ? () => setLongPressDialogVisible(true) : () => {}
          }
          title={name}
          titleNumberOfLines={2}
          right={() => (
            <Switch
              disabled={ tutorialState != tutorialStates.Finished }
              value={active}
              onValueChange={ () => dispatch(toggleGoal(id)) }
              style={{ height: 48, width: 48 }}
            />
          )}
          description={t('goals.goalDescription', {activitiesNumber: activities.length})}
        />
        <Divider />
      </ViewHighlighter>
      </Tooltip>

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible}
          onDismiss={() => {setLongPressDialogVisible(false)}}
          style={{ backgroundColor: theme.colors.dialogBackground}}>
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
})

const GoalsScreen = withTheme(({ theme, navigation, goals }) => {
  const { t, i18n } = useTranslation()
  const [menuVisible, setMenuVisible] = React.useState(false);

  const userCreatedActivities = useSelector(state => selectAllActivities(state).length > 0)
  useTooltipAnchor('leadToTodayScreen', 'leadToTodayScreen', userCreatedActivities)

  const tutorialState = useSelector(selectTutorialState)

  const renderItem = ( { item } ) => (
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
    <View style={{flex: 1, backgroundColor: theme.colors.goalsScreenBackground}}>
      <Header
        title={t('goals.headerTitle')} navigation={navigation}
        buttons={<>
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color={theme.colors.headerContent} style={{ height: 48, width: 48 }} />
          <ThreeDotsMenu
            menuItems={menuItems}
            openMenu= {() => setMenuVisible(true)}
            closeMenu= {() => setMenuVisible(false)}
            visible={menuVisible}
          />
        </>}
      />

      {hasSomethingToShow(goals)?
      <FlatList
        data={goals}
        renderItem={renderItem}
        keyExtractor={goal => goal.id}
      />
      :
        tutorialState == tutorialStates.Finished ?
          <InfoCard title={t('goals.infoTitle')} paragraph={t('goals.infoContent')} /> : null
      }
    </View>
  )
})

const mapStateToProps = (state) => {
  const goals = selectAllGoals(state)
  const goalsToShow = goals.filter(goal => {
    return !goal.archived
  })
  return { goals: goalsToShow }
};

export default connect(mapStateToProps)(GoalsScreen);