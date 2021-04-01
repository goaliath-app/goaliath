import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Appbar, Menu } from 'react-native-paper';
import { Header, ThreeDotsMenu, DeleteDialog } from '../../components';
import { 
  selectActivityById, selectGoalById, selectTodayEntryByActivityId, toggleCompleted, startTimer, 
  stopTimer, upsertTodaysEntry, archiveActivity 
} from '../../redux'
import BasicActivityInfo from './BasicActivityInfo'
import TodayPannel from './TodayPannel'
import { GenericStats, WeekStats } from './Stats'

const ActivityDetailScreen = ({ 
  activity,           // activity object to show on the screen (see ActivitySlice)
  goal,               // the goal object to witch the activity belongs (see GoalsSlice)
  entry,              // the entry of the daily log to show, if one. (see LogsSlice)
  navigation,         // navigation prop 
  toggleCompleted,    // function to call when the user changes the activity completion state
  stopTimer,          // function to call when the user stops the activity timer
  startTimer,         // function to call when the user starts the activity timer
  upsertTodaysEntry,  // function to call when needed to modify the activity entry
  archiveActivity     // function to call when the activity is archived (deleted)
}) => {
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
    <ThreeDotsMenu 
      menuItems={menuItems} openMenu= {openMenu} closeMenu= {closeMenu} visible={menuVisible} 
    />
  )

  return(
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <View>
        <Header title={activity.name} left='back' navigation={navigation} buttons={headerButtons} />
        <BasicActivityInfo activity={activity} goal={goal} />
  
        {entry?
          <TodayPannel entry={entry} toggleCompleted={toggleCompleted} startTimer={startTimer} stopTimer={stopTimer} upsertTodaysEntry={upsertTodaysEntry} /> 
          : null}
        {/* delayed until we start working on daily and weekly screens 
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
  const { activityId, showLog } = ownProps.route.params
  const activity = selectActivityById(state, activityId)
  const activityGoalId = activity.goalId
  const goal = selectGoalById(state, activityGoalId)
  let entry 
  if(showLog){
    entry = selectTodayEntryByActivityId(state, activityId)
  }
      
  return { activity, goal, entry }
}

const actionToProps = {
  toggleCompleted,
  stopTimer,
  startTimer,
  upsertTodaysEntry,
  archiveActivity
}

export default connect(mapStateToProps, actionToProps)(ActivityDetailScreen);