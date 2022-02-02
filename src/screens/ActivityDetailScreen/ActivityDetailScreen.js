import React from 'react';
import { View, ScrollView } from 'react-native'
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
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
import { SelfManagedThreeDotsMenu } from '../../components/ThreeDotsMenu';
import { LoadingContainer, FullScreenActivityIndicator } from '../../components/Loading'


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

  const date = isoDate ? DateTime.fromISO(isoDate) : null
  
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