import React from 'react';
import { withTheme } from 'react-native-paper'
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  SelectWeekliesListItem, SelectTasksListItem, TaskListItem
} from '../../components';
import { TodayScreenItem } from '../../activityHandler'

export const DayContentList = withTheme(({
  theme,
  date,
  visibleActivitiesAndEntries,
  taskList,
  tasksAdded,
  areWeekliesSelectedTodayResult,
  areTherePendingWeeklyActivitiesResult,
  areThereWeeklyActivitiesResult,
  timeStatus,
  listHeaderComponent,
  listFooterComponent
}) => {
    // setup hooks
    const navigation = useNavigation()

    const weekliesSelectorItem = (
        timeStatus == 'today' && areThereWeeklyActivitiesResult
      ?
        [{
          type: 'raw',
          key: 'selectWeekliesItem',
          completed: areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult,
          item: <SelectWeekliesListItem
                  date={date}
                  checked={areWeekliesSelectedTodayResult || !areTherePendingWeeklyActivitiesResult}
                  navigation={navigation}
                  disabled={timeStatus != 'today'}
                  { ...(areTherePendingWeeklyActivitiesResult ? {} : {color: theme.colors.completedWeekliesSelector})}
                />
        }]
        : []
    )

    const tasksSelectorItem = (
      timeStatus == 'today' ?
        [{
          type: 'raw',
          key: 'tasksSelectorItem',
          completed: tasksAdded,
          item: <SelectTasksListItem
                  checked={tasksAdded}
                  onPress={() => {navigation.navigate('AddTasks')}}
                />
        }]
        : []
    )
    const activityItems = visibleActivitiesAndEntries.map(item => ({ type: 'activity', id: item.activity.id, completed: item.entry.completed }))
    const taskItems = taskList.map(item => ({ type: 'task', item: item, completed: item.completed }))
    
    const listItems = [...activityItems, ...taskItems, ...weekliesSelectorItem, ...tasksSelectorItem]

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

    function renderItem({ item }){
      if (item.type == 'activity'){
        return <TodayScreenItem activityId={item.id} date={date}/>
      } else if (item.type == 'task'){
        return <TaskListItem task={item.item} date={date}/>
      } else if (item.type == 'raw'){
        return item.item
      }
    }

    return (
      <FlatList
        renderItem={renderItem}
        data={listItems}
        keyExtractor={(item, index) => item.type + '-' + (item.key ?? item.id ?? item.item?.id ?? index)}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
      />
    )
})
