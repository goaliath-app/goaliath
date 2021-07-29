import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard, SelectWeekliesListItem, SelectTasksListItem, TaskList, AddTaskDialog } from '../components';
import { updateLogs, areWeekliesSelectedToday, getTodayTasks, areTasksAddedToday } from '../redux'
import { extractActivityList, getToday, hasSomethingToShow, areThereWeeklyActivities } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';


const TodayScreen = ({ entryList, taskList, navigation, updateLogs, weekliesSelector, tasksAdded, addTodayTask, tasksAddedToday }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )
  
  console.log('tasksAdded:', tasksAdded)
  console.log('taskList', taskList)

  const completedActivities = entryList.filter(activity => activity.completed)
  const pendingActivities   = entryList.filter(activity => !activity.completed)

  const completedTasks = taskList.filter(task => task.completed)
  const pendingTasks = taskList.filter(task => !task.completed)

  const { t, i18n } = useTranslation()
  const [ addTaskDialogVisible, setAddTaskDialogVisible ] = React.useState(false)
  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      {hasSomethingToShow(entryList) || weekliesSelector != 'hidden'?
      <View>
        <ActivityList data={pendingActivities} />
        <TaskList tasks={ pendingTasks } />
        {weekliesSelector=='unchecked'?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        {tasksAdded?
          <></> 
          : <SelectTasksListItem checked={false} onPress={() => setAddTaskDialogVisible(true)}/>
        }
        <ActivityList data={completedActivities} />
        <TaskList tasks={ completedTasks } />
        {weekliesSelector=='checked'?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
        {tasksAdded?
          <SelectTasksListItem checked={true} onPress={() => setAddTaskDialogVisible(true)}/>
          : <></> }
      </View>
      :
      <InfoCard content={t('today.infoContent')} />
      }
      <AddTaskDialog visible={addTaskDialogVisible} setVisible={setAddTaskDialogVisible} />
    </View>
  );
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const entryList = extractActivityList(state, getToday(dayStartHour))
  const weekliesSelector = (
    areThereWeeklyActivities(state)?  
      (areWeekliesSelectedToday(state)?
       'checked'
       :
       'unchecked')
      :
      'hidden'
  )
  const tasksAdded = areTasksAddedToday(state)
  const taskList = getTodayTasks(state)
  
  return { entryList, weekliesSelector, tasksAdded, taskList }
}

const actionsToProps = {
  updateLogs,
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
