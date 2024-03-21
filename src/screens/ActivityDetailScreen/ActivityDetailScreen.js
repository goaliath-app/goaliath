import React from 'react';
import { View, ScrollView } from 'react-native'
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  Appbar, Paragraph, Title, Divider, List, Button, withTheme,
  Text
} from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import {
  Header, HelpIcon, DeleteActivityDialog,
  BottomScreenPadding,
} from '../../components';
import { useNavigation } from '@react-navigation/native';
import {
  selectActivityById, selectGoalById, selectEntryByActivityIdAndDate,
  restoreActivity, selectTutorialState, selectGoalByIdAndDate,
  selectActivityByIdAndDate, getTodaySelector,
} from '../../redux'
import { isToday, isFuture, deserializeDate } from '../../time'
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StatsPannel, MoveToGoalDialog, InfoCard } from '../../components'
import tutorialStates from '../../tutorialStates'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SelfManagedThreeDotsMenu } from '../../components/ThreeDotsMenu';
import { LoadingContainer, FullScreenActivityIndicator } from '../../components/Loading'
import { dueToday, dueThisWeek, usesSelectWeekliesScreen } from '../../activityHandler';


const Tab = createMaterialTopTabNavigator();

const ActivityDetailTabs = withTheme(({
  activity, goal, theme, date
}) => {
  const { t, i18n } = useTranslation()

  return (
    <Tab.Navigator 
      screenOptions={{
        lazy: true
      }} 
      sceneContainerStyle={{flex:1, overflow: 'visible'}} 
      style={{backgroundColor: theme.colors.activityDetailsScreenBackground}}
    >
      <Tab.Screen name="Details" options={{tabBarLabel: t('activityDetail.detailsTabLabel')}} >
        {() => <ActivityDetails activity={activity} goal={goal} date={date} />}
      </Tab.Screen>
      <Tab.Screen name="Stats" options={{ tabBarLabel: t('activityDetail.statsTabLabel') }} >
        {() => (
          <LoadingContainer LoadingComponent={() => (
              <View style={{flex:1, backGroundColor: theme.colors.activityDetailsScreenBackground}}>
                <FullScreenActivityIndicator/>
              </View>)} 
          >
            <ScrollView style={{flex: 1, backgroundColor: theme.colors.activityDetailsScreenBackground}}>
              <StatsPannel activityId={activity.id} bypassLoading />
            </ScrollView>
          </LoadingContainer>
        )}
      </Tab.Screen>
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

const ActivityDetailScreen = React.memo(withTheme(({ 
  navigation,
  theme,
  route
}) => {
  const { 
    activityId,    // id of the activity to show
    date: isoDate  // (optional) iso string datetime of the log entry to show
  } = route.params

  const date = isoDate ? deserializeDate(isoDate) : null
  
  let activity, goal
  if(date){
    activity = useSelector(state => selectActivityByIdAndDate(state, activityId, date), shallowEqual)
    goal = useSelector(state => selectGoalByIdAndDate(state, activity.goalId, date), shallowEqual)
  }else{
    activity = useSelector(state => selectActivityById(state, activityId), shallowEqual)
    goal = useSelector(state => selectGoalById(state, activity.goalId), shallowEqual)
  }

  const dayStartHour = useSelector(state => state.settings.dayStartHour)

  const { t, i18n } = useTranslation()

  const tutorialState = useSelector(selectTutorialState)

  const dateIsToday = date?isToday(date, dayStartHour):false

  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog
  const [moveToGoalDialogVisible, setMoveToGoalDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog

  // items that appear in the three dots menu
  const menuItems = [
    {
      title: t('activityDetail.threeDotsMenu.deleteActivity'),
      onPress: () => setDeleteDialogVisible(true)
    },
    {
      title: t('activityDetail.threeDotsMenu.changeGoal'),
      onPress: () => setMoveToGoalDialogVisible(true)
    }
  ]

  const headerButtons =  (
    date && !dateIsToday || activity.archived ? null :
    tutorialState == tutorialStates.Finished ? (
      <>
        <Appbar.Action icon='pencil' color={theme.colors.headerContent} onPress={() => {
          navigation.navigate('ActivityForm', { activityId: activity.id })
        }}
        style={{ height: 48, width: 48 }}
        />
        <SelfManagedThreeDotsMenu items={menuItems} />
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

      <ActivityDetailTabs activity={activity} goal={goal} date={date} />

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
}), (prevProps, nextProps) => {
  return true
})


// TODO: use selectActivityByIdAndDate instead of selectActivityById
const ActivityDetails = withTheme(({ 
  activity,
  goal,
  date,
  theme,
}) => {

  let entry
  if(date){
    entry = useSelector(state => selectEntryByActivityIdAndDate(state, activity.id, date))
  }else{
    entry = useSelector(state => null)
  }

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
      : 
      null
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
        <TodayStatusCard date={date} activityId={activity.id} />
      }

      <BottomScreenPadding />
    </KeyboardAwareScrollView>
  )
})

const TodayStatusCard = withTheme(({
  date,
  activityId,
  theme,
}) => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()

  const today = useSelector(getTodaySelector)

  if(!date){
    date = today
  }

  const entry = useSelector(state => selectEntryByActivityIdAndDate(state, activityId, date))
  const isDueToday = useSelector(state => dueToday(state, activityId, date))
  const isDueThisWeek = useSelector(state => dueThisWeek(state, activityId, date))
  const isWeekly = useSelector(state => usesSelectWeekliesScreen(state, activityId))

  let text, showButton
  if( isDueToday ){
    text = t('activityDetail.todayStatusCard.dueToday')
    showButton = true 
  }else if( entry && !entry.archived ){
    text = t('activityDetail.todayStatusCard.chosenToday')
    showButton = true
  }else if( isDueThisWeek && isWeekly ){
    text = t('activityDetail.todayStatusCard.dueThisWeek')
    showButton = true 
  }else{
    text = t('activityDetail.todayStatusCard.notDue')
    showButton = false
  }

  return(
    <InfoCard
      extraContent={
        <View style={{flex:1, alignItems: 'center'}}>
          <Text style={{fontSize: 16, flex: 1}}>{text}</Text>
          { showButton ?
            <Button style={{marginTop: 10}} onPress={ () => {
              navigation.navigate('Today')
            }}>{t('activityDetail.todayStatusCard.goToToday')}</Button>
          : null }
        </ View>
      }
    />
  )
})


export default ActivityDetailScreen;