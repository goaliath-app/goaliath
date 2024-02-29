import React from 'react';
import { useSelector } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import Animated, { Layout } from 'react-native-reanimated'
import {
  SelectWeekliesListItem, SelectTasksListItem, InfoCard,
  TaskListItem, BottomScreenPadding
} from '../components';
import {
  areWeekliesSelectedToday, areTasksAdded, selectAllTasksByDate
} from '../redux'
import {
  areThereWeeklyActivities, areTherePendingWeeklyActivities
} from '../activityHandler'
import { TodayScreenItem } from '../activityHandler'
import { selectVisibleActivities } from '../redux/selectors';
import { getToday } from '../util';
import { Paragraph, Text } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';


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

const NoActivitiesWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.noActivitiesInfoCard.title')}
        extraContent={
          <Paragraph style={{overflow: 'visible'}}>
            <Text>{t('today.noActivitiesInfoCard.contentBeforeIcon')}</Text>
            {/* If you know a better way of properly aligning the icon to
            the text, PLEASE let me know (already tried all the obviuous
            ways I knew) */}
            <View style={{width: 20, alignItems: 'center'}}>
              <View style={{position: 'absolute', top: -13}}>
                <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} />
              </View>
            </View>
            <Text>{t('today.noActivitiesInfoCard.contentAfterIcon')}</Text>
          </Paragraph>}
          // This is not properly aligned:
          // extraContent={<Paragraph style={{overflow: 'visible'}}>Go to the Goals <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} /> section to plan your daily actions</Paragraph>}
      />
    </View>
  )
})

const NoActiveActivitiesWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.noActiveActivitiesInfoCard.title')}
        paragraph={t('today.noActiveActivitiesInfoCard.content')} />
    </View>
  )
})

const NothingForTodayWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.nothingForTodayInfoCard.title')}
        paragraph={t('today.nothingForTodayInfoCard.content')} />
    </View>
  )
})

function dayContentSelector(state, date){
  const dayStartHour = state.settings.dayStartHour
  const visibleActivities = selectVisibleActivities(state, date)

  let todayScreenState;
  if(visibleActivities.length != 0){
    todayScreenState = 'normal'
  } else if (areTherePendingWeeklyActivities(state, date)) {
    todayScreenState = 'only-weekly-activities'
  } else if (selectAllActivities(state).length == 0) {
    todayScreenState = 'no-activities'
  } else if (selectAllActiveActivities(state).length == 0) {
    todayScreenState = 'no-active-activities'
  } else {
    todayScreenState = 'nothing-for-today'
  }

  return {
    dayStartHour,
    visibleActivities,
    todayScreenState,
    today: getToday(dayStartHour),
    taskList: selectAllTasksByDate(state, date),
    tasksAdded: areTasksAdded(state, date),
    areWeekliesSelectedTodayResult: areWeekliesSelectedToday(state),
    areTherePendingWeeklyActivitiesResult: areTherePendingWeeklyActivities(state, date),
    areThereWeeklyActivitiesResult: areThereWeeklyActivities(state)
  }
}

const DayContent = ({ date }) => {
  const {
    taskList,
    visibleActivities,
    todayScreenState,
    today,
    tasksAdded,
    areWeekliesSelectedTodayResult,
    areTherePendingWeeklyActivitiesResult,
    areThereWeeklyActivitiesResult,
  } = useSelector(state => dayContentSelector(state, date))

  const timeStatus = (
    today.toISO() == date.toISO() ? 'today' :
    today > date ? 'past' :
    'future'
  )

  return (
    <Animated.View style={{flex: 1}} layout={Layout.delay(100)}>
      <ScrollView style={{flex: 1}}>
        { timeStatus == 'past' && visibleActivities.length == 0 && taskList.length == 0 ? <EmptyPastWarning /> : null }
        { timeStatus == 'future' ? <FutureWarning /> : null }
        { timeStatus == 'today' && todayScreenState=='no-activities' ? <NoActivitiesWarning /> : null }
        { timeStatus == 'today' && todayScreenState=='no-active-activities' ? <NoActiveActivitiesWarning /> : null }
        { timeStatus == 'today' && todayScreenState=='nothing-for-today' ? <NothingForTodayWarning/> : null }

        <DayContentList
          date={date}
          visibleActivities={visibleActivities}
          taskList={taskList}
          tasksAdded={tasksAdded}
          areWeekliesSelectedTodayResult={areWeekliesSelectedTodayResult}
          areTherePendingWeeklyActivitiesResult={areTherePendingWeeklyActivitiesResult}
          areThereWeeklyActivitiesResult={areThereWeeklyActivitiesResult}
          timeStatus={timeStatus}
        />
        <BottomScreenPadding />
      </ScrollView>
    </Animated.View>
  );
}

const DayContentList = withTheme(({
  theme,
  date,
  visibleActivities,
  taskList,
  tasksAdded,
  areWeekliesSelectedTodayResult,
  areTherePendingWeeklyActivitiesResult,
  areThereWeeklyActivitiesResult,
  timeStatus
}) => {
    // setup hooks
    const navigation = useNavigation()

    const weekliesSelectorItem = (
        timeStatus == 'today' && areThereWeeklyActivitiesResult
      ?
        [{
          type: 'raw',
          completed: areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult,
          item: <SelectWeekliesListItem
                  date={date}
                  checked={areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult}
                  navigation={navigation}
                  disabled={timeStatus != 'today'}
                  { ...(areTherePendingWeeklyActivitiesResult ? {} : {color: theme.colors.completedWeekliesSelector})}
                  key='selectWeekliesItem'
                />
        }]
        : []
    )

    const tasksSelectorItem = (
      timeStatus == 'today' ?
        [{
          type: 'raw',
          completed: tasksAdded,
          item: <SelectTasksListItem
                  checked={tasksAdded}
                  onPress={() => {navigation.navigate('AddTasks')}}
                  key='tasksSelectorItem'
                />
        }]
        : []
    )

    const activityItems = visibleActivities.map(item => ({ type: 'activity', id: item.id, completed: false }))
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
        return <TodayScreenItem activityId={item.id} date={date} key={'activity'+item.id} />
      } else if (item.type == 'task'){
        return <TaskListItem task={item.item} date={date} key={'task'+item.item.name}/>
      } else if (item.type == 'raw'){
        return item.item
      }
    }

    return (
      <View>
        { listItems.map(item => renderItem(item)) }
      </View>
    )
})

export default DayContent
