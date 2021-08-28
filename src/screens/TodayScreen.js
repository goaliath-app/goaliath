import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard, SelectWeekliesListItem, SelectTasksListItem, TaskList, DeleteDialog } from '../components';
import { updateLogs, areWeekliesSelectedToday, getTodayTasks, areTasksAddedToday, deleteTodayTask } from '../redux'
import { extractActivityList, getToday, hasSomethingToShow, areThereWeeklyActivities } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';


const TodayScreen = ({ entryList, taskList, navigation, updateLogs, weekliesSelector, tasksAdded, deleteTodayTask }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  const { t, i18n } = useTranslation()
  const [ selectedTask, setSelectedTask] = React.useState()
  

  const completedActivities = entryList.filter(fullEntry => fullEntry.entry.completed)
  const pendingActivities   = entryList.filter(fullEntry => !fullEntry.entry.completed)

  const completedTasks = taskList.filter(task => task.completed)
  const pendingTasks = taskList.filter(task => !task.completed)

  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      {hasSomethingToShow(entryList) || weekliesSelector != 'hidden'?
      <View>
        <ActivityList data={pendingActivities} />
        <TaskList tasks={ pendingTasks } onTaskPress={task => {setSelectedTask(task)}} />
        {weekliesSelector=='unchecked'?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        {tasksAdded?
          <></> 
          : <SelectTasksListItem checked={false} onPress={() => {navigation.navigate('AddTasks')}}/>
        }
        <ActivityList data={completedActivities} />
        <TaskList tasks={ completedTasks } onTaskPress={task => {setSelectedTask(task)}} />
        {weekliesSelector=='checked'?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
        {tasksAdded?
          <SelectTasksListItem checked={true} onPress={() => {navigation.navigate('AddTasks')}}/>
          : <></> }
      </View>
      :
      <InfoCard content={t('today.infoContent')} />
      }
      <DeleteDialog 
        visible={selectedTask} 
        setVisible={(value) => setSelectedTask(null)}
        onDelete={() => {
          deleteTodayTask(selectedTask.id)
          setSelectedTask(null)
        }}
        title={'Delete "'+selectedTask?.name+'"'}
        body={'This is a One Time Task. Do you want to delete it?'}
      />
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
  deleteTodayTask,
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
