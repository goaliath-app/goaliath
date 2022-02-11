import React from 'react';
import { useSelector } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { 
  SelectWeekliesListItem, SelectTasksListItem, InfoCard,
  TaskListItem, BottomScreenPadding
} from '../components';
import { 
  areWeekliesSelectedToday, areTasksAdded, selectEntriesByDay, 
  selectTutorialState, selectAllTasksByDate
} from '../redux'
import { areThereWeeklyActivities, areTherePendingWeeklyActivities } from '../activityHandler'
import { useTranslation } from 'react-i18next'
import { getToday } from '../util'
import tutorialStates from '../tutorialStates'
import Animated, { Layout } from 'react-native-reanimated'
import { TodayScreenItem } from '../activityHandler'


const FutureWarning = () => {
  const { t, i18n } = useTranslation()

  return (
      <InfoCard 
        title={t("dayContent.futureWarningTitle")}
        paragraph={t("dayContent.futureWarningSubtitle")} 
      />
  )
}

const EmptyPastWarning = () => {
  const { t, i18n } = useTranslation()

  return (
    <InfoCard 
      title={t("dayContent.emptyPastWarningTitle")}
      paragraph={t("dayContent.emptyPastWarningSubtitle")} 
    />
  )
}

const DayContent = withTheme(({ theme, date }) => {
  // selectors
  // using getToday because on day change getTodaySelector was still returning the previous day
  const today      = getToday(useSelector(state => state.settings.dayStartHour))
  const entryList  = useSelector((state) => selectEntriesByDay(state, date))

  // compute values
  const timeStatus = (
    today.toISO() == date.toISO() ? 'today' :
    today > date ? 'past' :
    'future'
  )

  const completedActivities = entryList.filter(entry => !entry.archived && entry.completed)
  const pendingActivities   = entryList.filter(entry => !entry.archived && !entry.completed)

  return (
    <Animated.View style={{flex: 1}} layout={Layout.delay(100)}>
      <ScrollView style={{flex: 1}}>
        { timeStatus == 'past' && completedActivities.length == 0 && pendingActivities.length == 0 ? <EmptyPastWarning /> : null }
        { timeStatus == 'future' ? <FutureWarning /> : null }
        <DayContentList date={date} />
        <BottomScreenPadding />  
      </ScrollView>
    </Animated.View>
  );
})

const DayContentList = ({ date }) => {
    // setup hooks
    const navigation = useNavigation()
  
    // selectors
    // using getToday because on day change getTodaySelector was still returning the previous day
    const today      = getToday(useSelector(state => state.settings.dayStartHour))
    const entryList  = useSelector((state) => selectEntriesByDay(state, date))
    const taskList   = useSelector(state => selectAllTasksByDate(state, date))

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
  
    const weekliesSelectorItem = (
        timeStatus == 'today' && areThereWeeklyActivitiesResult 
      || 
        tutorialState >= tutorialStates.ChooseWeekliesIntroduction 
        && tutorialState < tutorialStates.Finished
      ?
        [{
          type: 'raw', 
          completed: areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult,
          item: <SelectWeekliesListItem 
                  date={date} 
                  checked={areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult} 
                  navigation={navigation} 
                  disabled={timeStatus != 'today'} 
                  style={
                    tutorialState == tutorialStates.ChooseWeekliesIntroduction?
                      {backgroundColor: theme.colors.todayItemHighlight} : {}
                    } 
                  { ...(areTherePendingWeeklyActivitiesResult ? {} : {color: theme.colors.completedWeekliesSelector})}
                  key='selectWeekliesItem'
                />
        }] 
        : []
    )

    const tasksSelectorItem = (
      timeStatus == 'today' && tutorialState >= tutorialStates.OneTimeTasksIntroduction ?
        [{
          type: 'raw',
          completed: tasksAdded,
          item: <SelectTasksListItem
                  checked={tasksAdded}
                  onPress={() => {navigation.navigate('AddTasks')}}
                  style={
                    tutorialState == tutorialStates.OneTimeTasksIntroduction?
                      {backgroundColor: theme.colors.todayItemHighlight} : {}
                    }
                  key='tasksSelectorItem'
                />
        }]
        : []
    )



    const activityItems = entryList.map(item => ({ type: 'activity', item: item, completed: item.completed }))
    const taskItems = taskList.map(item => ({ type: 'task', item: item, completed: item.completed }))

    let listItems = activityItems.concat(taskItems)
    listItems = listItems.concat(weekliesSelectorItem)
    listItems = listItems.concat(tasksSelectorItem)
    
    // sort items
    listItems.sort((a, b) => {
      // sort by completion
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      // then sort by type
      if(a.type == b.type) return 0
        // tasks first
      if (a.type == 'task') return -1
      if (b.type == 'task') return 1
        // then activities
      if (a.type == 'activity') return -1
      if (b.type == 'activity') return 1
        // then raw items
      if (a.type == 'raw') return -1
      if (b.type == 'raw') return 1
      return 0
    })

    function renderItem(item){
      if (item.type == 'activity'){
        return <TodayScreenItem activityId={item.item.id} date={date} key={'activity'+item.item.id} />
      } else if (item.type == 'task'){
        return <TaskListItem task={item.item} date={date} key={'task'+item.item.name}/>
      } else if (item.type == 'raw'){
        return item.item
      }
    }
    
    return (
      <View>
        {
          listItems.map(item => renderItem(item))
        }
      </View>
    )
}

export default DayContent
