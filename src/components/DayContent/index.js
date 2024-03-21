import React from 'react';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native'
import {
  BottomScreenPadding
} from '../../components';
import {
  areWeekliesSelectedToday, areTasksAdded, selectAllTasksByDate
} from '../../redux'
import {
  areThereWeeklyActivities, areTherePendingWeeklyActivities
} from '../../activityHandler'
import { selectVisibleActivities } from '../../redux/selectors';
import { getToday, serializeDate } from '../../time';
import { EmptyPastWarning, FutureWarning, NoActivitiesWarning, NothingForTodayWarning, NoActiveActivitiesWarning } from './warnings'
import { selectAllActiveActivities } from '../../redux/selectors';
import { selectAllActivities } from '../../redux';
import { DayContentList } from './DayContentList';
import Animated, { Layout } from 'react-native-reanimated'

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

export const DayContent = ({ date }) => {
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
    serializeDate(today) == serializeDate(date) ? 'today' :
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

export default DayContent;
