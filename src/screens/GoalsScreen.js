import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FlatList, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { 
  List, Appbar, Divider, Switch, Menu, Portal, Dialog, withTheme, IconButton,
  Text,
} from 'react-native-paper';
import { 
  Header, InfoCard, ThreeDotsMenu, DeleteActivityDialog, DeleteGoalDialog, BottomScreenPadding, 
  SpeechBubble, IconHighlighter, MoveToGoalDialog, ViewHighlighter,
} from '../components'
import { hasSomethingToShow, isBetween } from '../util'
import { useTranslation } from 'react-i18next'
import { 
  selectAllActiveActivitiesByGoalIdAndDate, getTodaySelector, selectAllGoals, 
  toggleGoal, selectTutorialState, setTutorialState, selectAllActivitiesByGoalId,
  toggleActivity,
} from '../redux';
import { getFrequencyString } from '../activityHandler'
import tutorialStates from '../tutorialStates'
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import FeatherIcon from 'react-native-vector-icons/Feather';


const Activity = withTheme(({ active, activity, name, theme }) => {
  const navigation = useNavigation();
  const { t, i18 } = useTranslation();
  const dispatch = useDispatch();

  const tutorialState = useSelector(selectTutorialState)

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)
  const [ isMoveToGoalDialogVisible, setMoveToGoalDialogVisible ] = React.useState(false)

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))

  return (
    <View>
      <List.Item
        onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
        onLongPress={
          tutorialState == tutorialStates.Finished ? () => setLongPressDialogVisible(true) : () => {}
        }
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch
            onValueChange={() => dispatch(toggleActivity(activity.id))} 
            value={active}
            style={{ height: 48, width: 48 }}
          />
        )}
        description={frequencyString} 
      />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("goal.longPressMenu.edit")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('ActivityForm', { activityId: activity.id } )
              }} />
              <Divider />
              <List.Item title={t("goal.longPressMenu.archive")} onPress={() => {
                setLongPressDialogVisible(false)
                setDeleteDialogVisible(true)
              }} />
              <Divider />
              <List.Item title={t("goal.longPressMenu.move")} onPress={() => {
                setLongPressDialogVisible(false)
                setMoveToGoalDialogVisible(true)
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>

      <DeleteActivityDialog
        visible={isDeleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        activityId={activity.id}
      />

      <MoveToGoalDialog 
        visible={isMoveToGoalDialogVisible} 
        setVisible={setMoveToGoalDialogVisible} 
        activityId={activity.id} 
      />
    </View>
  );
})

const GoalListItem = withTheme(({ name, active, id, theme, isExpanded, onExpand }) => {
  const { t, i18n } = useTranslation()

  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const [ isDeleteDialogVisible, setDeleteDialogVisible ] = React.useState(false)

  const tutorialState = useSelector(selectTutorialState)

  const navigation = useNavigation();

  const today = useSelector(getTodaySelector)
  const activities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, id, today))
  const goalActivities = useSelector((state) => selectAllActivitiesByGoalId(state, id))

  const dispatch = useDispatch();

  const amIHighlighted = (
    tutorialState >= tutorialStates.GoalScreenIntroduction 
    && tutorialState < tutorialStates.ActivitiesInTodayScreen 
    && id == 0
  )

  return (
    <View>
      <ViewHighlighter active={amIHighlighted}>
        <Collapse 
          handleLongPress={tutorialState == tutorialStates.Finished ? () => setLongPressDialogVisible(true) : () => {} }
          isExpanded={isExpanded}
          onToggle={onExpand}  
          /* TODO: replace primary95 with proper placement color */
          style={isExpanded ? {backgroundColor: theme.colors.primary95} : {}}  
        >
          <CollapseHeader>
              <List.Item
                title={name}
                titleNumberOfLines={2}
                right={() => (
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <IconButton icon={"arrow-top-right"} size={25} color={theme.colors.actionIcons} onPress={() => navigation.navigate('Goal', { goalId: id })} />
                    <Switch 
                      disabled={ tutorialState != tutorialStates.Finished }
                      value={active} 
                      onValueChange={ () => dispatch(toggleGoal(id)) }
                      style={{ height: 48, width: 48 }}
                    />
                  </View>
                )}
                description={t('goals.goalDescription', {activitiesNumber: activities.length})}
              />
          </CollapseHeader>
          <CollapseBody style={{ borderColor: theme.colors.divider, }}>
            <Divider />
            <View>
              <View style={{flexDirection: 'row', marginHorizontal: 16, justifyContent:'space-between', alignItems: 'center'}}>
                {/* TODO: add 'ACTIVITIES' string literal to i18n */}
                <Text style={{fontSize: 14}}>{'ACTIVITIES'}</Text>
                <IconButton icon={"plus"} 
                  onPress={() => navigation.navigate('ActivityForm', { goalId: id })} 
                  color={theme.colors.actionIcons} 
                  size={25} />
              </View>
              {goalActivities.map(activity => <Activity name={activity.name} activity={activity} active={activity.active} />)}
            </View>
            <Divider />
          </CollapseBody>
        </Collapse>
      </ViewHighlighter>

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

const GoalsList = withTheme(({ theme, goals }) => {
  const [expandedGoal, setExpandedGoal] = React.useState(null);

  const renderItem = ({ item }) => (
    <GoalListItem
      id={item.id}
      name={item.name}
      active={item.active} 
      motivation={item.motivation} 
      isExpanded={item.id == expandedGoal}
      onExpand={(isExpanded) => {
        if(isExpanded){
          setExpandedGoal(item.id)
        }else{
          setExpandedGoal(null)
        }
      }}
    />
  )

  return (
    <FlatList data={goals} renderItem={renderItem} ListFooterComponent={BottomScreenPadding} />
  )
})

const GoalsScreen = withTheme(({ theme, navigation, goals }) => {
  const { t, i18n } = useTranslation()
  const [menuVisible, setMenuVisible] = React.useState(false);

  const dispatch = useDispatch();
  const tutorialState = useSelector(selectTutorialState)

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
        buttons={
        <>
        {
          tutorialState < tutorialStates.FirstGoalCreation ?
            <Appbar.Action icon='plus' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
          : tutorialState == tutorialStates.FirstGoalCreation ?
            <IconHighlighter highlightStyle={{backgroundColor: theme.colors.headerContent}}>
              <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color={theme.colors.headerContent} style={{ height: 48, width: 48 }} />
            </IconHighlighter>
          : tutorialState > tutorialStates.FirstGoalCreation && tutorialState < tutorialStates.ActivitiesInTodayScreen ?
            <Appbar.Action icon='plus' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
          : // tutorialState > ActivitiesInTodayScreen 
            <Appbar.Action icon='plus' onPress={() => navigation.navigate('GoalForm')} color={theme.colors.headerContent} style={{ height: 48, width: 48 }} />
        }
        { tutorialState == tutorialStates.Finished ?
          <ThreeDotsMenu 
            menuItems={menuItems} 
            openMenu= {() => setMenuVisible(true)} 
            closeMenu= {() => setMenuVisible(false)} 
            visible={menuVisible} 
          />
          :
          <Appbar.Action icon='dots-vertical' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
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
        <GoalsList goals={goals}/>
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