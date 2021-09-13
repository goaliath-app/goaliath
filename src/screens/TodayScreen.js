import React from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard, SelectWeekliesListItem, SelectTasksListItem, TaskList, DeleteDialog } from '../components';
import { updateLogs, areWeekliesSelectedToday, getTodayTasks, areTasksAddedToday, deleteTodayTask, selectEntriesByDay } from '../redux'
import { extractActivityList, getToday, hasSomethingToShow, getTodaySelector } from '../util'
import { areThereWeeklyActivities, areTherePendingWeeklyActivities } from '../activityHandler'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';


const TodayScreen = ({ navigation }) => {
  const dispatch = useDispatch()

  useSelector((state) => console.log('state', state))

  useFocusEffect(
    React.useCallback(() => {
      dispatch(updateLogs())
    }, [])
  )

  // selectors
  const today      = useSelector(getTodaySelector)
  const entryList  = useSelector((state) => selectEntriesByDay(state, today))
  const tasksAdded = useSelector(areTasksAddedToday)
  const taskList   = useSelector(getTodayTasks)
  const areWeekliesSelectedTodayResult = useSelector(areWeekliesSelectedToday)
  const areTherePendingWeeklyActivitiesResult = useSelector((state) => areTherePendingWeeklyActivities(state, today))
  const areThereWeeklyActivitiesResult = useSelector(areThereWeeklyActivities) 

  // compute values
  const weekliesSelector = (
    areWeekliesSelectedTodayResult? 'checked' :
    areTherePendingWeeklyActivitiesResult? 'unchecked' :
    areThereWeeklyActivitiesResult? 'allcompleted' :
    'hidden'
  )
  

  const { t, i18n } = useTranslation()
  const [ selectedTask, setSelectedTask] = React.useState()
  

  const completedActivities = entryList.filter(entry => entry.completed)
  const pendingActivities   = entryList.filter(entry => !entry.completed)

  const completedTasks = taskList.filter(task => task.completed)
  const pendingTasks = taskList.filter(task => !task.completed)

  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      {hasSomethingToShow(entryList) || weekliesSelector != 'hidden'?
      <View>
        <ActivityList data={pendingActivities} date={today} />
        <TaskList tasks={ pendingTasks } onTaskPress={task => {setSelectedTask(task)}} />
        {weekliesSelector=='unchecked'?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        {tasksAdded?
          <></> 
          : <SelectTasksListItem checked={false} onPress={() => {navigation.navigate('AddTasks')}}/>
        }
        <ActivityList data={completedActivities} date={today} />
        <TaskList tasks={ completedTasks } onTaskPress={task => {setSelectedTask(task)}} />
        {weekliesSelector=='checked'?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
        {weekliesSelector=='allcompleted'?
        <SelectWeekliesListItem checked={true} navigation={navigation} color='grey'/>
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
          dispatch(deleteTodayTask(selectedTask.id))
          setSelectedTask(null)
        }}
        title={'Delete "'+selectedTask?.name+'"'}
        body={'This is a One Time Task. Do you want to delete it?'}
      />
    </View>
  );
}

export default TodayScreen
