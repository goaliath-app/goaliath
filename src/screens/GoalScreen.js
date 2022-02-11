import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { View, FlatList, Pressable, ScrollView } from 'react-native';
import { List, Switch, Appbar, Menu, Paragraph, Divider, Button, Card,
  Title, Portal, Dialog, withTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { 
  Header, ThreeDotsMenu, DeleteGoalDialog, InfoCard, DeleteActivityDialog, 
  MoveToGoalDialog, BottomScreenPadding, SpeechBubble, IconHighlighter,
} from '../components';
import { selectAllActivities, selectGoalById, toggleActivity, restoreGoal, 
  setActivity, selectTutorialState, setTutorialState } from '../redux'
import { hasSomethingToShow, isBetween } from '../util'
import { getFrequencyString } from '../activityHandler'
import tutorialStates from '../tutorialStates'
import Color from 'color'

const Activity = withTheme(({ name, active, id, activity, goal, theme }) => {
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
        style={{paddingTop: 5}}
        onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}
        onLongPress={
          tutorialState == tutorialStates.Finished ? () => setLongPressDialogVisible(true) : () => {}
        }
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch
            disabled={ goal.archived || tutorialState != tutorialStates.Finished }
            onValueChange={() => dispatch(toggleActivity(id))} 
            value={active}
            style={{ height: 48, width: 48 }}
          />
        )}
        description={frequencyString} 
      />
      <Divider />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} 
          onDismiss={() => {setLongPressDialogVisible(false)}}
          style={{backgroundColor: theme.colors.dialogBackground}}>
          <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Content>
              <Divider />
              <List.Item title={t("goal.longPressMenu.edit")} onPress={() => {
                setLongPressDialogVisible(false)
                navigation.navigate('ActivityForm', { activityId: id } )
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

const ArchivedWarning = ({ goal }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigation = useNavigation()

  return (
    goal.archived?
      <InfoCard
        title={t("goal.archivedWarning")}
        extraContent={
          <Button style={{marginTop: 10}} onPress={ () => {
            dispatch(restoreGoal(goal.id))
            navigation.goBack()
          }}>{t("goal.restoreButton")}</Button>
        }
        style={{alignItems: 'center'}}
        />

    : null
  )
}

const GoalScreen = withTheme(({ activities, goal, navigation, theme }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)
  const [motivationCollapsed, setMotivationCollapsed] = React.useState(true)

  const dispatch = useDispatch()

  const tutorialState = useSelector(selectTutorialState)

  const { t, i18n } = useTranslation()

  const menuItems = (
    <>
      <Menu.Item onPress={() => {
        setMenuVisible(false)
        setDeleteDialogVisible(true)
        }} title={t('goal.threeDotsMenu.deleteGoal')}  />
      <Menu.Item onPress={() => {
        setMenuVisible(false)
        navigation.navigate("ArchivedActivities", { goalId: goal.id })
        }} title={t('goal.threeDotsMenu.viewArchivedActivities')}  />
    </>
  )

  const headerButtons = (
    goal.archived? null :
      <>
        { tutorialState == tutorialStates.Finished ?
          <Appbar.Action icon='pencil' color={theme.colors.headerContent} onPress={() => {
              setMenuVisible(false)
              navigation.navigate('GoalForm', { id: goal.id } )
            }}
            style={{ height: 48, width: 48 }}
          />
          :
          <Appbar.Action icon='pencil' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
        }

        { tutorialState <= tutorialStates.SampleActivityCreated ? 
          <Appbar.Action icon='plus' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
          : 
          <Appbar.Action icon='plus' color={theme.colors.headerContent} onPress={() => {
            navigation.navigate('ActivityForm', { goalId: goal.id })
          }}
          style={{ height: 48, width: 48 }}
        />
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
  )

  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      id={item.id}
      activity={item}
      goal={goal} />
  )

  const headerIcon = (
    tutorialState >= tutorialStates.ActivitiesInTodayScreen
    && tutorialState < tutorialStates.Finished ?
      'highlightedBack'
    : 'back'
  )

  return (
    <>
      <View style={{flex: 1, backgroundColor: theme.colors.goalScreenBackground}}>
        <Header title={goal.name} left={headerIcon} navigation={navigation} buttons={headerButtons}/>
        {/* ArchivedWarning only shows if the goal is archived */}
        <ArchivedWarning goal={goal}/>
        <View style={{ flex: 1 }}>
          <View style={{flexShrink: 1}}>
            { tutorialState == tutorialStates.GoalScreenIntroduction ?
              <SpeechBubble
                speeches={[
                  {id:0, text: t('tutorial.GoalScreenIntroduction.2')},
                  {id:1, text: t('tutorial.GoalScreenIntroduction.3')},
                  {id:2, text: t('tutorial.GoalScreenIntroduction.4')},
                  {id:3, text: t('tutorial.GoalScreenIntroduction.5')},
                  {id:4, text: t('tutorial.GoalScreenIntroduction.6')},
                  {id:5, text: t('tutorial.GoalScreenIntroduction.7'),
                    onNextPress: () => {
                      dispatch(setActivity({
                        archived: false,
                        active: true,
                        name: t('tutorial.sampleActivity.name', {goalName: goal.name}), 
                        description: t('tutorial.sampleActivity.description'),
                        goalId: goal.id, 
                        type: 'doFixedDays', 
                        params: { 
                          daysOfWeek: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true },
                          dailyGoal: {
                            type: 'doNSeconds',
                            params: { 
                              seconds: 600
                            }
                          }
                        }
                      }))
                      dispatch(setTutorialState(tutorialStates.SampleActivityCreated))
                    },
                  },
                ]}
                bubbleStyle={{height: 80}}
              />
              : null
            }
            {
              isBetween( tutorialStates.SampleActivityCreated, tutorialState, tutorialStates.AddNewActivityHighlight) ?
              <SpeechBubble
                speeches={[
                  {id:6, text: t('tutorial.GoalScreenIntroduction.8')},
                  {id:7, text: t('tutorial.GoalScreenIntroduction.9'),
                    onTextEnd: () => dispatch(setTutorialState(tutorialStates.AddNewActivityHighlight)),
                    onNextPress: () => dispatch(setTutorialState(tutorialStates.ActivitiesInTodayScreen))},
                ]}
                bubbleStyle={{height: 80}}
              /> : null
            }
            {
              tutorialState >= tutorialStates.ActivitiesInTodayScreen
              && tutorialState < tutorialStates.Finished ?
              <SpeechBubble
                speeches={[
                  {id:7, text: t('tutorial.ActivitiesInTodayScreen.0')},
                ]}
                bubbleStyle={{height: 80}}
              /> : null
            }
            {hasSomethingToShow(activities)?
              <FlatList data={activities} renderItem={renderItem} ListFooterComponent={BottomScreenPadding} />
              :
              tutorialState==tutorialStates.Finished && !goal.archived?
                <InfoCard title={t('goal.infoTitle')} paragraph={t('goal.infoContent')} /> : null
            } 
          </View>
          {goal.motivation?
          <View style={{ flexGrow: 1 }} >
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: -1 , borderTopWidth: 1,  borderColor: Color(theme.colors.onSurface).alpha(0.3).string() }}>
              <Pressable 
                onPress={()=> setMotivationCollapsed(!motivationCollapsed)} 
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
              >
                <Title style={{ padding: 7, fontSize: 18}}>{t('goal.motivation')}</Title>
                <FontAwesomeIcon icon={motivationCollapsed? faAngleUp : faAngleDown } size={20}/> 
              </Pressable>
            </View>
            {motivationCollapsed? null:
              <View >
                <ScrollView style={{ flexGrow: 0}}>
                  <Paragraph 
                    style={{padding: 15, paddingTop: 0}}
                  >
                    {goal.motivation}
                  </Paragraph>
                </ScrollView>
              </View>}
          </View>
          :
          <></>}
        </View>
      </View>

      <DeleteGoalDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)} 
        onDelete={() => navigation.goBack()}
        goalId={goal.id}
      />
    </>
  )
})

const mapStateToProps = (state, ownProps) => {
  const { goalId } = ownProps.route.params
  const activities = selectAllActivities(state)
  const goal = selectGoalById(state, goalId)
  const thisGoalActivities = activities.filter(activity => {
    return activity.goalId == goalId && !activity.archived
  })
  return { activities: thisGoalActivities, goal: goal }
};

export default connect(mapStateToProps)(GoalScreen);