import React from 'react';
import { View } from 'react-native'
import { useSelector } from 'react-redux';
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
import { selectAllActivities, selectEntryByActivityIdAndDate } from '../../redux';
import { DayContentList } from './DayContentList';

// data fetch
function dayContentSelector(state, date){
  const dayStartHour = state.settings.dayStartHour
  const visibleActivities = selectVisibleActivities(state, date)

  const visibleActivitiesAndEntries = visibleActivities.map(activity => {
    const entry = selectEntryByActivityIdAndDate(state, activity.id, date)
    return {activity, entry}
  })

  let todayScreenState;
  if(visibleActivitiesAndEntries.length != 0){
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
    visibleActivitiesAndEntries,
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
    visibleActivitiesAndEntries,
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

  const listHeaderComponent = (
    timeStatus == 'past' && visibleActivitiesAndEntries.length == 0 && taskList.length == 0 ? <EmptyPastWarning />
    : timeStatus == 'future' ? <FutureWarning />
    : timeStatus == 'today' && todayScreenState=='no-activities' ? <NoActivitiesWarning />
    : timeStatus == 'today' && todayScreenState=='no-active-activities' ? <NoActiveActivitiesWarning />
    : timeStatus == 'today' && todayScreenState=='nothing-for-today' ? <NothingForTodayWarning/>
    : null
  )

  return (
    <View style={{flex: 1}}>
      <DayContentList
        listHeaderComponent={listHeaderComponent}
        listFooterComponent={BottomScreenPadding}
        date={date}
        visibleActivitiesAndEntries={visibleActivitiesAndEntries}
        taskList={taskList}
        tasksAdded={tasksAdded}
        areWeekliesSelectedTodayResult={areWeekliesSelectedTodayResult}
        areTherePendingWeeklyActivitiesResult={areTherePendingWeeklyActivitiesResult}
        areThereWeeklyActivitiesResult={areThereWeeklyActivitiesResult}
        timeStatus={timeStatus}
      />
    </View>
  );
}

export default DayContent;
