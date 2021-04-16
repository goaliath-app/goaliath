import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Paragraph, Menu, Subheading, Title, Divider, List } from 'react-native-paper';
import { DateTime } from 'luxon'
import { Header, ThreeDotsMenu, DeleteDialog, HelpIcon } from '../../components';
import { 
  selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, toggleCompleted, startTimer, 
  stopTimer, upsertEntry, archiveActivity 
} from '../../redux'
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { GenericStats, WeekStats } from './Stats'
import { isToday } from '../../util'

const ActivityDetailScreen = ({ 
  activity,           // activity object to show on the screen (see ActivitySlice)
  goal,               // the goal object to witch the activity belongs (see GoalsSlice)
  entry,              // the entry of the daily log to show, if one. (see LogsSlice)
  navigation,         // navigation prop 
  toggleCompleted,    // function to call when the user changes the activity completion state
  stopTimer,          // function to call when the user stops the activity timer
  startTimer,         // function to call when the user starts the activity timer
  upsertEntry,  // function to call when needed to modify the activity entry
  archiveActivity,     // function to call when the activity is archived (deleted)
  date,
  dayStartHour,
}) => {
  const dateIsToday = date?isToday(date, dayStartHour):false
  const dateTitle = date?date.toFormat('d MMMM yyyy'):null

  const [menuVisible, setMenuVisible] = React.useState(false);  // sets the visibility of the threeDotsMenu
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false)  // sets the visibility of the delete dialog
  const openMenu = () => setMenuVisible(true)
  const closeMenu = () => setMenuVisible(false)
  const openDeleteDialog = () => setDeleteDialogVisible(true)
  const closeDeleteDialog = () => setDeleteDialogVisible(false)

  // items that appear in the three dots menu
  const menuItems = (
    <>
    <Menu.Item title='Edit activity'
      onPress={() => {
        closeMenu()
        navigation.navigate('ActivityForm', { activityId: activity.id })
      }} 
    />
    <Menu.Item onPress={() => {
      openDeleteDialog()
      closeMenu()
    }} title='Delete activity' />
    </>
  )

  const headerButtons =  (
    date && !dateIsToday?
    null
    :
    <ThreeDotsMenu 
      menuItems={menuItems} openMenu= {openMenu} closeMenu= {closeMenu} visible={menuVisible} 
    />
  )


  return(
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <View>
        <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />
        {date && !dateIsToday? 
        <>
          <List.Item 
            title={<Title>{dateTitle}</Title>} 
            right={() => (
              <View style={{alignSelf: 'center', paddingRight: 12}}>
                <HelpIcon dialogContent={
                  <Paragraph>These are the details of a past activity. Even if you have modified the activity goal or frequency, here you will see them as they were this specific day.</Paragraph>
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
          <TodayPannel entry={entry} toggleCompleted={toggleCompleted} startTimer={startTimer} stopTimer={stopTimer} upsertEntry={upsertEntry} date={date} dayStartHour={dayStartHour} /> 
          : 
          entry?
            <TodayPannel entry={entry} toggleCompleted={toggleCompleted} startTimer={()=>{}} stopTimer={()=>{}} upsertEntry={upsertEntry} date={date} dayStartHour={dayStartHour} />
            :
            null
        }

        {/* future work:
        <WeekStats />
        <GenericStats /> 
        */}

      </View>

      <DeleteDialog 
        visible={deleteDialogVisible} 
        setVisible={setDeleteDialogVisible}
        onDelete={() => {
          archiveActivity(activity.id)
          closeDeleteDialog()
          navigation.goBack()
        }}
        title="Delete activity?"
        body="This can't be undone."
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
  stopTimer,
  startTimer,
  upsertEntry,
  archiveActivity
}

export default connect(mapStateToProps, actionToProps)(ActivityDetailScreen);