import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { View, FlatList, Pressable, ScrollView } from 'react-native';
import { List, Switch, Appbar, Menu, Paragraph, Divider, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { Header, ThreeDotsMenu, DeleteDialog, InfoCard } from '../components';
import { selectAllActivities, selectGoalById, toggleActivity, archiveGoal } from '../redux'
import { hasSomethingToShow } from '../util'
import { GeneralColor, GoalColor, HeaderColor } from '../styles/Colors';
import { getFrequencyString } from '../activityHandler'

const Activity = ({ name, active, id, activity }) => {
  const navigation = useNavigation();
  const { t, i18 } = useTranslation();
  const dispatch = useDispatch();

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))

  return (
    <View>
      <List.Item
        style={{paddingTop: 5}}
        onPress={() => navigation.navigate('ActivityDetail', { activityId: id })}
        title={name}
        titleNumberOfLines={2}
        right={() => (
          <Switch
            onValueChange={() => dispatch(toggleActivity(id))} 
            value={active}
          />
        )}
        description={frequencyString} 
      />
      <Divider />
    </View>
  );
}

const GoalScreen = ({ activities, goal, navigation }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)
  const [motivationCollapsed, setMotivationCollapsed] = React.useState(true)

  const dispatch = useDispatch()


  const { t, i18n } = useTranslation()

  const menuItems = (
    <>
    <Menu.Item title={t('goal.threeDotsMenu.editGoal')} 
      onPress={() => {
        setMenuVisible(false)
        navigation.navigate('GoalForm', { id: goal.id } )
      }}
    />
    <Menu.Item onPress={() => {
      setMenuVisible(false)
      setDeleteDialogVisible(true)
      }} title={t('goal.threeDotsMenu.deleteGoal')}  />
    </>
  )

  const headerButtons = (
    <>
    <Appbar.Action icon='plus' color={HeaderColor.icon} onPress={() => {
        navigation.navigate('ActivityForm', { goalId: goal.id })
      }}
    />
    <ThreeDotsMenu 
      menuItems={menuItems} 
      openMenu= {() => setMenuVisible(true)} 
      closeMenu= {() => setMenuVisible(false)} 
      visible={menuVisible} 
    />
    </>
  )

  const renderItem = ({ item }) => (
    <Activity
      name={item.name}
      active={item.active}
      id={item.id}
      activity={item} />
  )

  return (
    <>
      <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
        <Header title={goal.name} left='back' navigation={navigation} buttons={headerButtons}/>
        <View style={{ flex: 1 }}>
          <View style={{flexShrink: 1}}>
            {hasSomethingToShow(activities)?
              <FlatList data={activities} renderItem={renderItem} />
              :
              <InfoCard content={t('goal.infoContent')} />
            } 
          </View>
          {goal.motivation?
          <View style={{ flexGrow: 1 }} >
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: -1 , borderTopWidth: 1,  borderColor: GoalColor.motivationBorder }}>
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
                    style={{color: GoalColor.motivationParagraph, padding: 15, paddingTop: 0}}
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

      <DeleteDialog 
        visible={deleteDialogVisible} 
        setVisible={setDeleteDialogVisible} 
        onDelete={()=>{
          dispatch(archiveGoal(goal.id))
          setDeleteDialogVisible(false)
          navigation.goBack()
        }}
        title={t('goal.deleteDialog.title')}
        body={t('goal.deleteDialog.body')}
      />
    </>
  )
}

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