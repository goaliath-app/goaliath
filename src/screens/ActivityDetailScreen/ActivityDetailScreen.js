import React from 'react';
import { View } from 'react-native'
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
  toggleCompleted, startTodayTimer, stopTodayTimer, upsertEntry, 
  archiveActivity, restoreActivity, selectTutorialState, selectGoalByIdAndDate, 
  selectActivityByIdAndDate
} from '../../redux'
import { isToday, isFuture } from '../../util'
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StatsPannel, MoveToGoalDialog, InfoCard } from '../../components'
import tutorialStates from '../../tutorialStates'

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

// TODO: use selectActivityByIdAndDate instead of selectActivityById
const ActivityDetailScreen = withTheme(({ 
  activity,           // activity object to show on the screen (see ActivitySlice)
  goal,               // the goal object to witch the activity belongs (see GoalsSlice)
  entry,              // the entry of the daily log to show, if one. (see LogsSlice)
  navigation,         // navigation prop 
  toggleCompleted,    // function to call when the user changes the activity completion state
  stopTodayTimer,          // function to call when the user stops the activity timer
  startTodayTimer,         // function to call when the user starts the activity timer
  upsertEntry,  // function to call when needed to modify the activity entry
  archiveActivity,     // function to call when the activity is archived (deleted)
  date,
  dayStartHour,
  theme,
}) => {
  const { t, i18n } = useTranslation()

  const tutorialState = useSelector(selectTutorialState)

  const dateIsToday = date?isToday(date, dayStartHour):false
  const dateIsFuture = date?isFuture(date, dayStartHour):false
  const monthLabel = date?t('units.monthNames.' + date.toFormat('MMMM').toLowerCase()):null
  const dateTitle = ( date ? 
    t('calendar.dayView.header', 
      {month: monthLabel, day: date.toFormat('d'), year: date.toFormat('yyyy')}) 
    : null
  )

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
        <Appbar.Action icon='pencil' color={theme.colors.headerContent} style={{opacity: 0.5}} />
        <Appbar.Action icon='dots-vertical' color={theme.colors.headerContent} style={{opacity: 0.5}} />
      </> 
    )
  )

  return(
    <View style={{flex:1,backgroundColor: theme.colors.activityDetailsScreenBackground}} >
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />
      <KeyboardAwareScrollView style={{ flex: 1 }}>
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
          toggleCompleted={toggleCompleted} 
          startTodayTimer={startTodayTimer} 
          stopTodayTimer={stopTodayTimer} 
          upsertEntry={upsertEntry} 
          date={date} 
          dayStartHour={dayStartHour}
          activity={activity}
        /> 
        : 
          entry?
          <TodayPannel 
            entry={entry} 
            toggleCompleted={toggleCompleted} 
            startTodayTimer={()=>{}} 
            stopTodayTimer={()=>{}} 
            upsertEntry={upsertEntry} 
            date={date} 
            dayStartHour={dayStartHour} 
            activity={activity}
          />
          :
          null
        }

        <StatsPannel activityId={activity.id} />

        <BottomScreenPadding />
      </KeyboardAwareScrollView>

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


const mapStateToProps = (state, ownProps) => {
  const { 
    activityId,  // id of the activity to show
    date         // (optional) iso string datetime of the log entry to show
  } = ownProps.route.params

  const dateTime = date ? DateTime.fromISO(date) : null
  
  let activity, goal, entry
  if(dateTime){
    activity = selectActivityByIdAndDate(state, activityId, dateTime)
    goal = selectGoalByIdAndDate(state, activity.goalId, dateTime)
    entry = selectEntryByActivityIdAndDate(state, activityId, dateTime)
  }else{
    activity = selectActivityById(state, activityId)
    goal = selectGoalById(state, activity.goalId)
  }
  
  const { dayStartHour } = state.settings

  return { activity, goal, entry, date: dateTime, dayStartHour }
}

const actionToProps = {
  toggleCompleted,
  stopTodayTimer,
  startTodayTimer,
  upsertEntry,
  archiveActivity
}

export default connect(mapStateToProps, actionToProps)(ActivityDetailScreen);