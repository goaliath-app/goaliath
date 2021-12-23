import React from 'react';
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { Card, Title, Paragraph } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { ActivityList, BottomScreenPadding } from '../components'
import { SelectWeekliesListItem, SelectTasksListItem, TaskList, DeleteDialog } from '../components';
import { 
  areWeekliesSelectedToday, areTasksAdded, selectEntriesByDay, selectTutorialState
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

const EmptyPastWarning = () => {
  const { t, i18n } = useTranslation()

  return (
      <Card style={{ marginHorizontal: 20, marginVertical: 10, backgroundColor: 'aliceblue', alignItems: 'center' }}>
        <Card.Content>
          <Title>{t("dayContent.emptyPastWarningTitle")}</Title>
          <Paragraph>{t("dayContent.emptyPastWarningSubtitle")}</Paragraph>
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
  const tasksAdded = useSelector(state => areTasksAdded(state, date))
  const areWeekliesSelectedTodayResult = useSelector(areWeekliesSelectedToday)
  const areTherePendingWeeklyActivitiesResult = useSelector((state) => areTherePendingWeeklyActivities(state, date))
  const areThereWeeklyActivitiesResult = useSelector(areThereWeeklyActivities)
  const tutorialState = useSelector(selectTutorialState)

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
  
  const completedActivities = entryList.filter(entry => !entry.archived && entry.completed)
  const pendingActivities   = entryList.filter(entry => !entry.archived && !entry.completed)

  return (
    <ScrollView style={{flex: 1}}>
      { timeStatus == 'past' && completedActivities.length == 0 && pendingActivities.length == 0 ? <EmptyPastWarning /> : null }
      { timeStatus == 'future' ? <EmptyPastWarning /> : null }
      <ActivityList data={pendingActivities} date={date} />
      <TaskList date={date} show='pending' />
      { weekliesSelector=='unchecked' ?
      <SelectWeekliesListItem date={date} checked={false} navigation={navigation}/>
      : <></> }
      { tasksSelector == 'unchecked' && ['OneTimeTasksIntroduction', 'TutorialEnding','Finished'].includes(tutorialState)?
        <SelectTasksListItem checked={false} onPress={() => {navigation.navigate('AddTasks')}}/>
        : <></> 
      }
      <ActivityList data={completedActivities} date={date} />
      <TaskList date={date} show='completed' />
      { weekliesSelector == 'checked' && ['OneTimeTasksIntroduction', 'TutorialEnding','Finished'].includes(tutorialState)?
      <SelectWeekliesListItem date={date} checked={true} navigation={navigation}/>
      : <></> }
      { weekliesSelector == 'allcompleted' ?
      <SelectWeekliesListItem date={date} checked={true} navigation={navigation} color='grey'/>
      : <></> }
      { tasksSelector == 'checked' ?
        <SelectTasksListItem checked={true} onPress={() => {navigation.navigate('AddTasks')}}/>
        : <></> }
      <BottomScreenPadding />  
    </ScrollView>
  );
}

export default DayContent
