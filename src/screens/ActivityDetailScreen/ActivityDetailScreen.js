import React from 'react';
import { View } from 'react-native'
import { connect, useDispatch } from 'react-redux';
import { Appbar, Paragraph, Menu, Title, Divider, List, Card, Button } from 'react-native-paper';
import { DateTime } from 'luxon'
import { useTranslation } from 'react-i18next'
import { 
  Header, ThreeDotsMenu, DeleteDialog, HelpIcon, DeleteActivityDialog,
  BottomScreenPadding,
} from '../../components';
import { useNavigation } from '@react-navigation/native';
import { 
  selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, toggleCompleted, startTodayTimer, 
  stopTodayTimer, upsertEntry, archiveActivity, restoreActivity
} from '../../redux'
import { isToday, isFuture } from '../../util'
import { GeneralColor, HeaderColor } from '../../styles/Colors';
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StatsPannel, MoveToGoalDialog } from '../../components'

const ArchivedWarning = ({ activity }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigation = useNavigation()

  return (
    activity.archived?
      <>
      <Card style={{ marginHorizontal: 20, marginVertical: 10, backgroundColor: 'aliceblue', alignItems: 'center' }}>
        <Card.Content>
          <Title>{t("activityDetail.archivedWarning")}</Title>
        </Card.Content>
        <Card.Actions style={{alignSelf: 'center'}}>
          <Button onPress={ () => {
            dispatch(restoreActivity(activity.id))
            navigation.goBack()
          }}>{t("activityDetail.restoreButton")}</Button>
        </Card.Actions>
      </Card>
      <Divider />
      </>
    : null
  )
}

// TODO: use selectActivityByIdAndDate instead of selectActivityById
const ActivityDetailScreen = ({ 
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
}) => {
  const { t, i18n } = useTranslation()

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
    date && !dateIsToday || activity.archived ?
    null
    :
    <>
      <Appbar.Action icon='pencil' color={HeaderColor.icon} onPress={() => {
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
  )

  return(
    <View style={{flex:1,backgroundColor: GeneralColor.screenBackground}} >
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />
      <KeyboardAwareScrollView style={{ backgroundColor: GeneralColor.background, flex: 1 }}>
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
}


const mapStateToProps = (state, ownProps) => {
  const { 
    activityId,  // id of the activity to show
    date         // (optional) iso string datetime of the log entry to show
  } = ownProps.route.params
  const dateTime = date?DateTime.fromISO(date):null
  let activity = selectActivityById(state, activityId)
  const activityGoalId = activity.goalId
  const goal = selectGoalById(state, activityGoalId)
  let entry 
  if(dateTime){
    entry = selectEntryByActivityIdAndDate(state, activityId, dateTime)
    activity = { ...activity, ...entry }  // use entry data to override possible overlapping values.
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