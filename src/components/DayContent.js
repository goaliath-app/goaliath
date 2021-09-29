import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ActivityList } from '../components'
import { SelectWeekliesListItem, SelectTasksListItem, TaskList, DeleteDialog } from '../components';
import { updateLogs, areWeekliesSelectedToday, getTodayTasks, areTasksAddedToday, deleteTodayTask, selectEntriesByDay } from '../redux'
import { getTodaySelector } from '../util'
import { areThereWeeklyActivities, areTherePendingWeeklyActivities } from '../activityHandler'
import { useTranslation } from 'react-i18next'

const DayContent = ({ date }) => {
  // setup hooks
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  useFocusEffect(
    React.useCallback(() => {
      if(timeStatus == 'today'){
        dispatch(updateLogs())
      }
    }, [timeStatus])
  )

  // selectors
  const today      = useSelector(getTodaySelector)
  const entryList  = useSelector((state) => selectEntriesByDay(state, date))
  const taskList   = useSelector(getTodayTasks)
  const tasksAdded = useSelector(areTasksAddedToday)
  const areWeekliesSelectedTodayResult = useSelector(areWeekliesSelectedToday)
  const areTherePendingWeeklyActivitiesResult = useSelector((state) => areTherePendingWeeklyActivities(state, date))
  const areThereWeeklyActivitiesResult = useSelector(areThereWeeklyActivities) 

  
  // state hooks
  const [ selectedTask, setSelectedTask] = React.useState()
  
  // compute values
  const timeStatus = (
    today.toISO() == date.toISO() ? 'today' :
    today > date ? 'past' :
    'future'
  )

  const weekliesSelector = (
    timeStatus != 'today' ? 'hidden' :
    areWeekliesSelectedTodayResult? 'checked' :
    areTherePendingWeeklyActivitiesResult? 'unchecked' :
    areThereWeeklyActivitiesResult? 'allcompleted' :
    'hidden'
  )

  const tasksSelector = (
    timeStatus != 'today' ? 'hidden' :
    tasksAdded ? 'checked' :
    'unchecked'
  )
  
  const completedActivities = entryList.filter(entry => entry.completed)
  const pendingActivities   = entryList.filter(entry => !entry.completed)

  const completedTasks = taskList.filter(task => task.completed)
  const pendingTasks = taskList.filter(task => !task.completed)

  

  
  return (
    <View>
      <ScrollView>
        <ActivityList data={pendingActivities} date={date} />
        <TaskList tasks={ pendingTasks } onTaskPress={task => {setSelectedTask(task)}} />
        { weekliesSelector=='unchecked' ?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        { tasksSelector == 'unchecked' ?
          <SelectTasksListItem checked={false} onPress={() => {navigation.navigate('AddTasks')}}/>
          : <></> 
        }
        <ActivityList data={completedActivities} date={date} />
        <TaskList tasks={ completedTasks } onTaskPress={task => {setSelectedTask(task)}} />
        { weekliesSelector == 'checked' ?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
        { weekliesSelector == 'allcompleted' ?
        <SelectWeekliesListItem checked={true} navigation={navigation} color='grey'/>
        : <></> }
        { tasksSelector == 'checked' ?
          <SelectTasksListItem checked={true} onPress={() => {navigation.navigate('AddTasks')}}/>
          : <></> }
      </ScrollView>
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

export default DayContent
