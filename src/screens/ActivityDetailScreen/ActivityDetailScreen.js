import React from 'react';
import { View, KeyboardAvoidingView, ScrollView } from 'react-native'
import { connect } from 'react-redux';
import { Paragraph, Menu, Title, Divider, List } from 'react-native-paper';
import { DateTime } from 'luxon'
import { useTranslation } from 'react-i18next'
import { Header, ThreeDotsMenu, DeleteDialog, HelpIcon, ActivityBarChartPicker, ActivityCalendarHeatmap } from '../../components';
import { 
  selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, toggleCompleted, startTodayTimer, 
  stopTodayTimer, upsertEntry, archiveActivity 
} from '../../redux'
import { isToday, isFuture } from '../../util'
import { GeneralColor } from '../../styles/Colors';
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'

import { GenericStats, StatsPannel } from '../../components'

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
  const dateIsToday = date?isToday(date, dayStartHour):false
  const dateIsFuture = date?isFuture(date, dayStartHour):false
  const dateTitle = date?date.toFormat('d MMMM yyyy'):null

  const [menuVisible, setMenuVisible] = React.useState(false);  // sets the visibility of the threeDotsMenu
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog

  const { t, i18n } = useTranslation()

  // items that appear in the three dots menu
  const menuItems = (
    <>
    <Menu.Item title={t('activityDetail.threeDotsMenu.editActivity')} 
      onPress={() => {
        setMenuVisible(false)
        navigation.navigate('ActivityForm', { activityId: activity.id })
      }} 
    />
    <Menu.Item onPress={() => {
      setDeleteDialogVisible(true)
      setMenuVisible(false)
    }} title={t('activityDetail.threeDotsMenu.deleteActivity')}  />
    </>
  )

  const headerButtons =  (
    date && !dateIsToday?
    null
    :
    <ThreeDotsMenu 
      menuItems={menuItems} 
      openMenu={() => setMenuVisible(true)} 
      closeMenu={() => setMenuVisible(false)} 
      visible={menuVisible} 
    />
  )

  return(
    <KeyboardAvoidingView style={{flex:1,backgroundColor: GeneralColor.screenBackground}} >
      <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />
      <ScrollView style={{ backgroundColor: GeneralColor.background, flex: 1 }}>
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
      </ScrollView>

      <DeleteDialog 
        visible={deleteDialogVisible} 
        setVisible={setDeleteDialogVisible}
        onDelete={() => {
          archiveActivity(activity.id)
          setDeleteDialogVisible(false)
          navigation.goBack()
        }}
        title={t('activityDetail.deleteDialog.title')}
        body={t('activityDetail.deleteDialog.body')}
      />
    </KeyboardAvoidingView>
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