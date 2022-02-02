import React from 'react';
import { View, ScrollView } from 'react-native'
import { connect, useDispatch, useSelector } from 'react-redux';
import { Appbar, Paragraph, Menu, Title, Divider, List, Card, Button, withTheme } from 'react-native-paper';
import { DateTime } from 'luxon'
import { useTranslation } from 'react-i18next'
import { 
  Header, ThreeDotsMenu, DeleteDialog, HelpIcon, DeleteActivityDialog,
  BottomScreenPadding,
} from '../../components';
import { useNavigation } from '@react-navigation/native';
import { 
  selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
  restoreActivity, selectTutorialState, selectGoalByIdAndDate, 
  selectActivityByIdAndDate
} from '../../redux'
import { isToday, isFuture } from '../../util'
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StatsPannel, MoveToGoalDialog, InfoCard } from '../../components'
import tutorialStates from '../../tutorialStates'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const ActivityDetailTabs = withTheme(({ 
  activity, goal, entry, theme, date
}) => {
  console.log("Rendering ACTIVITYDETAIL TABS")
  return (
    <Tab.Navigator>
      <Tab.Screen name="Details" component={() => (
        <ActivityDetails activity={activity} goal={goal} entry={entry} date={date} />
      )} />
      <Tab.Screen name="Stats" component={() => (
        <ScrollView style={{flex: 1, backgroundColor: theme.colors.activityDetailsScreenBackground}}>
          <StatsPannel activityId={activity.id} />
        </ScrollView>)} />
    </Tab.Navigator>
  );
})

const ArchivedWarning = ({ activity }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigation = useNavigation()

  return (
    activity.archived?
      <>
      <InfoCard 
        title={t("activityDetail.archivedWarning")} 
        extraContent={
          <Button style={{marginTop: 10}} onPress={ () => {
            dispatch(restoreActivity(activity.id))
            navigation.goBack()
          }}>{t("activityDetail.restoreButton")}</Button>
        }
        style={{alignItems: 'center'}}
      />
      <Divider />
      </>
    : null
  )
}


const ActivityDetailScreen = withTheme(({ 
  navigation,
  theme,
  route
}) => {
  console.log("RENDERING ACTIVITYDETAIL SCREEN")
  const { 
    activityId,    // id of the activity to show
    date: isoDate  // (optional) iso string datetime of the log entry to show
  } = route.params

  const date = isoDate ? DateTime.fromISO(isoDate) : null
  
  let activity, goal, entry
  if(date){
    activity = useSelector(state => selectActivityByIdAndDate(state, activityId, date))
    goal = useSelector(state => selectGoalByIdAndDate(state, activity.goalId, date))
    entry = useSelector(state => selectEntryByActivityIdAndDate(state, activityId, date))
  }else{
    activity = useSelector(state => selectActivityById(state, activityId))
    goal = useSelector(state => selectGoalById(state, activity.goalId))
    entry = useSelector(state => null)
  }

  const dayStartHour = useSelector(state => state.settings.dayStartHour)

  const { t, i18n } = useTranslation()

  const tutorialState = useSelector(selectTutorialState)

  const dateIsToday = date?isToday(date, dayStartHour):false

  const [menuVisible, setMenuVisible] = React.useState(false);  // sets the visibility of the threeDotsMenu
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog
  const [moveToGoalDialogVisible, setMoveToGoalDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog

  // items that appear in the three dots menu
  const menuItems = (
    <>
      <Menu.Item onPress={() => {
        setDeleteDialogVisible(true)
        setMenuVisible(false)
      }} title={t('activityDetail.threeDotsMenu.deleteActivity')}  />
      <Menu.Item onPress={() => {
        setMoveToGoalDialogVisible(true)
        setMenuVisible(false)
      }} title={t('activityDetail.threeDotsMenu.changeGoal')}  />
    </>
  )

  const headerButtons =  (
    date && !dateIsToday || activity.archived ? null :
    tutorialState == tutorialStates.Finished ? (
      <>
        <Appbar.Action icon='pencil' color={theme.colors.headerContent} onPress={() => {
          navigation.navigate('ActivityForm', { activityId: activity.id })
        }}
        style={{ height: 48, width: 48 }}
        />
        <ThreeDotsMenu 
          menuItems={menuItems} 
          openMenu={() => setMenuVisible(true)} 
          closeMenu={() => setMenuVisible(false)} 
          visible={menuVisible} 
        />
      </>
    ) : (
      <>
        <Appbar.Action icon='pencil' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
        <Appbar.Action icon='dots-vertical' color={theme.colors.headerContent} style={{opacity: 0.5, height: 48, width: 48}} />
      </> 
    )
  )

  return(
    <View style={{flex:1,backgroundColor: theme.colors.activityDetailsScreenBackground}} >
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />

      <ActivityDetailTabs activity={activity} goal={goal} entry={entry} date={date} />

      <DeleteActivityDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onDelete={() => {
          navigation.goBack()
        }}
        activityId={activity.id}
      />

      <MoveToGoalDialog 
        visible={moveToGoalDialogVisible} 
        setVisible={setMoveToGoalDialogVisible} 
        activityId={activity.id} 
      />
    </View>
  )
})


// TODO: use selectActivityByIdAndDate instead of selectActivityById
const ActivityDetails = withTheme(({ 
  activity,
  goal,
  entry,
  date,
  theme,
}) => {
  console.log("RENDERING ACTIVITYDETAILS")

  const dayStartHour = useSelector(state => state.settings.dayStarthour)

  const { t, i18n } = useTranslation()

  const dispatch = useDispatch()

  const dateIsToday = date?isToday(date, dayStartHour):false
  const dateIsFuture = date?isFuture(date, dayStartHour):false
  const monthLabel = date?t('units.monthNames.' + date.toFormat('MMMM').toLowerCase()):null
  const dateTitle = ( date ? 
    t('calendar.dayView.header', 
      {month: monthLabel, day: date.toFormat('d'), year: date.toFormat('yyyy')}) 
    : null
  )

  return(
    <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: theme.colors.activityDetailsScreenBackground }}>
      <ArchivedWarning activity={activity} />
      {date && !dateIsToday? 
      <>
      <List.Item 
        title={<Title>{dateTitle}</Title>} 
        right={() => ( dateIsFuture?null:
          <View style={{alignSelf: 'center', paddingRight: 12}}>
            <HelpIcon dialogContent={
              <Paragraph>{t('activityDetail.helpIconText')}</Paragraph>
            }/>
          </View>
        )}
      />
      <Divider />
      </>
      : null
      }
      <BasicActivityInfo activity={activity} goal={goal} />
      {dateIsToday?
      <TodayPannel 
        entry={entry} 
        date={date} 
        dayStartHour={dayStartHour}
        activity={activity}
      /> 
      : 
        entry?
        <TodayPannel 
          entry={entry} 
          date={date} 
          dayStartHour={dayStartHour} 
          activity={activity}
        />
        :
        null
      }

      <BottomScreenPadding />
    </KeyboardAwareScrollView>
  )
})


export default ActivityDetailScreen;