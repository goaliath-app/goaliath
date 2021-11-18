import React from 'react';
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { Card, Title, Paragraph } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { ActivityList } from '../components'
import { SelectWeekliesListItem, SelectTasksListItem, TaskList, DeleteDialog } from '../components';
import { 
  updateLogs, areWeekliesSelectedToday, getTodayTasks, areTasksAddedToday, 
  deleteTodayTask, selectEntriesByDay, getTodaySelector 
} from '../redux'
import { areThereWeeklyActivities, areTherePendingWeeklyActivities } from '../activityHandler'
import { useTranslation } from 'react-i18next'
import { getToday } from '../util'

const FutureWarning = () => {
  const { t, i18n } = useTranslation()

  return (
      <Card style={{ marginHorizontal: 20, marginVertical: 10, backgroundColor: 'aliceblue', alignItems: 'center' }}>
        <Card.Content>
          <Title>{t("dayContent.futureWarningTitle")}</Title>
          <Paragraph>{t("dayContent.futureWarningSubtitle")}</Paragraph>
        </Card.Content>
      </Card>
  )
}

const DayContent = ({ date }) => {
  
  // setup hooks
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  // selectors
  // using getToday because on day change getTodaySelector was still returning the previous day
  const today      = getToday(useSelector(state => state.settings.dayStartHour))
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
        { timeStatus == 'future' ? <FutureWarning /> : null }
        <ActivityList data={pendingActivities} date={date} />
        <TaskList tasks={ pendingTasks } onTaskPress={task => {setSelectedTask(task)}} />
        { weekliesSelector=='unchecked' ?
        <SelectWeekliesListItem date={date} checked={false} navigation={navigation}/>
        : <></> }
        { tasksSelector == 'unchecked' ?
          <SelectTasksListItem checked={false} onPress={() => {navigation.navigate('AddTasks')}}/>
          : <></> 
        }
        <ActivityList data={completedActivities} date={date} />
        <TaskList tasks={ completedTasks } onTaskPress={task => {setSelectedTask(task)}} />
        { weekliesSelector == 'checked' ?
        <SelectWeekliesListItem date={date} checked={true} navigation={navigation}/>
        : <></> }
        { weekliesSelector == 'allcompleted' ?
        <SelectWeekliesListItem date={date} checked={true} navigation={navigation} color='grey'/>
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
