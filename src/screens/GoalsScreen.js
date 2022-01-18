import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Appbar, Divider, Switch, Menu, Portal, Dialog, withTheme, Title } from 'react-native-paper';
import { 
  Header, InfoCard, ThreeDotsMenu, DeleteGoalDialog, BottomScreenPadding, 
  SpeechBubble, IconHighlighter, ViewHighlighter,
} from '../components'
import { hasSomethingToShow, isBetween } from '../util'
import { useTranslation } from 'react-i18next'
import { 
  selectAllActiveActivitiesByGoalIdAndDate, getTodaySelector, selectAllGoals, 
  toggleGoal, selectTutorialState, setTutorialState,
} from '../redux';
import tutorialStates from '../tutorialStates'


const GoalListItem = ({ theme, name, active, id }) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)

  const tutorialState = useSelector(selectTutorialState)

  const navigation = useNavigation();

  const today= useSelector(getTodaySelector)
  const activities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, id, today))

  const dispatch = useDispatch();

  const amIHighlighted = (
    tutorialState >= tutorialStates.GoalScreenIntroduction 
    && tutorialState < tutorialStates.ActivitiesInTodayScreen 
    && id == 0
  )

  return (
    <View>
      <ViewHighlighter active={amIHighlighted}>
        <List.Item 
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
            />
          )}
          description={t('goals.goalDescription', {activitiesNumber: activities.length})}
        />
        <Divider />
      </ViewHighlighter>

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

const GoalsScreen = withTheme(({ theme, navigation, goals }) => {
  const { t, i18n } = useTranslation()
  const [menuVisible, setMenuVisible] = React.useState(false);

  const dispatch = useDispatch();
  const tutorialState = useSelector(selectTutorialState)
  
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
    <View style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Header 
        title={t('goals.headerTitle')} navigation={navigation} 
        buttons={
        <>
        {
          tutorialState < tutorialStates.FirstGoalCreation ?
            <Appbar.Action icon='plus' color={theme.colors.onPrimary} style={{opacity: 0.5}} />
          : tutorialState == tutorialStates.FirstGoalCreation ?
            <IconHighlighter highlightStyle={{backgroundColor: theme.colors.onPrimary}}>
              <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color={theme.colors.onPrimary} />
            </IconHighlighter>
          : tutorialState > tutorialStates.FirstGoalCreation && tutorialState < tutorialStates.ActivitiesInTodayScreen ?
            <Appbar.Action icon='plus' color={theme.colors.onPrimary} style={{opacity: 0.5}} />
          : // tutorialState > ActivitiesInTodayScreen 
            <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color={theme.colors.onPrimary} />
        }
        { tutorialState == tutorialStates.Finished ?
          <ThreeDotsMenu 
            menuItems={menuItems} 
            openMenu= {() => setMenuVisible(true)} 
            closeMenu= {() => setMenuVisible(false)} 
            visible={menuVisible} 
          />
          :
          <Appbar.Action icon='dots-vertical' color={theme.colors.onPrimary} style={{opacity: 0.5}} />
        }
        </>
        }/>
      { isBetween(tutorialStates.GoalsScreenIntroduction, tutorialState, tutorialStates.FirstGoalCreation) ?
      <SpeechBubble
        speeches={[
          {id: 0, text: t('tutorial.GoalsScreenIntroduction.1')},
          {id: 1, text: t('tutorial.GoalsScreenIntroduction.2')},
          {id: 2, text: t('tutorial.GoalsScreenIntroduction.3')},
          {id: 3, text: t('tutorial.FirstGoalCreation.1'), 
            onTextEnd: () => dispatch(setTutorialState(tutorialStates.FirstGoalCreation))}
        ]}
        bubbleStyle={{height: 80}}
      />
      : null}
      { tutorialState >= tutorialStates.GoalScreenIntroduction && tutorialState < tutorialStates.ActivitiesInTodayScreen ?
      <SpeechBubble
        speeches={[
          {id: 0, text: t('tutorial.AfterFirstGoalCreation.1')},
        ]}
        bubbleStyle={{height: 80}}
      />
      : null} 
      { tutorialState >= tutorialStates.ActivitiesInTodayScreen
      && tutorialState < tutorialStates.Finished ?
      <SpeechBubble
        speeches={[
          {id: 0, text: t('tutorial.ActivitiesInTodayScreen.1')},
        ]}
        bubbleStyle={{height: 80}}
      />
      : null}

      {hasSomethingToShow(goals)?
        <FlatList data={goals} renderItem={renderItem} ListFooterComponent={BottomScreenPadding} />
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