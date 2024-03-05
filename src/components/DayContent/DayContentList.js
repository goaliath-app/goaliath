import React from 'react';
import { View } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import {
  SelectWeekliesListItem, SelectTasksListItem, TaskListItem, BottomScreenPadding
} from '../../components';
import { TodayScreenItem } from '../../activityHandler'

export const DayContentList = withTheme(({
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
