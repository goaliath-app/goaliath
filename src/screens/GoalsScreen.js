import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { List, Appbar, Divider, Switch, Menu, Portal, Dialog } from 'react-native-paper';
import { Header, InfoCard, ThreeDotsMenu, DeleteGoalDialog, BottomScreenPadding, SpeechBubble } from '../components'
import { hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import { 
  selectAllActiveActivitiesByGoalIdAndDate, getTodaySelector, selectAllGoals, 
  toggleGoal, selectTutorialState, setTutorialState,
} from '../redux';


const GoalListItem = ({ name, active, id }) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)

  const tutorialState = useSelector(selectTutorialState)

  const navigation = useNavigation();

  const today= useSelector(getTodaySelector)
  const activities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, id, today))

  const dispatch = useDispatch();

  return (
    <View>
      <List.Item 
        onPress={() => navigation.navigate('Goal', { goalId: id })}
        onLongPress={
          tutorialState == 'Finished' ? () => setLongPressDialogVisible(true) : () => {}
        }
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch 
            disabled={ tutorialState != 'Finished' }
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
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('goals.headerTitle')} navigation={navigation} 
        buttons={
        <>
        {
          [ 'FirstGoalCreation', 'AfterFirstGoalCreation', 
          'GoalScreenIntroduction', 'ActivitiesInTodayScreen', 
          'ChooseWeekliesIntroduction', 'OneTimeTasksIntroduction', 
          'TutorialEnding', 'Finished' ].includes(tutorialState) ?
          <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color="white"/>
          :
          <Appbar.Action icon='plus' color="white" style={{opacity: 0.5}} />
        }
        { tutorialState == 'Finished' ?
          <ThreeDotsMenu 
            menuItems={menuItems} 
            openMenu= {() => setMenuVisible(true)} 
            closeMenu= {() => setMenuVisible(false)} 
            visible={menuVisible} 
          />
          :
          <Appbar.Action icon='dots-vertical' color={'white'} style={{opacity: 0.5}} />
        }
        </>
        }/>
      {tutorialState=='GoalsScreenIntroduction' || tutorialState=='FirstGoalCreation'?
      <SpeechBubble
        speeches={[
          {id: 0, text: t('tutorial.GoalsScreenIntroduction.1')},
          {id: 1, text: t('tutorial.GoalsScreenIntroduction.2')},
          {id: 2, text: t('tutorial.GoalsScreenIntroduction.3')},
          {id: 3, text: t('tutorial.GoalsScreenIntroduction.4'),
            onTextEnd: () => dispatch(setTutorialState('FirstGoalCreation'))},
          {id: 0, text: t('tutorial.FirstGoalCreation.1')}
        ]}
        bubbleStyle={{height: 80}}
      />
      : null}
      {tutorialState=='AfterFirstGoalCreation' || tutorialState=='GoalScreenIntroduction'?
      <SpeechBubble
        speeches={[
          {id: 0, text: t('tutorial.AfterFirstGoalCreation.1'), 
            onTextEnd: () => dispatch(setTutorialState('GoalScreenIntroduction'))},
          {id: 1, text: t('tutorial.GoalScreenIntroduction.1')}
        ]}
        bubbleStyle={{height: 80}}
      />
      : null} 
      {tutorialState=='ActivitiesInTodayScreen'?
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
        tutorialState=='Finished'?
          <InfoCard title={t('goals.infoTitle')} paragraph={t('goals.infoContent')} /> : null
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