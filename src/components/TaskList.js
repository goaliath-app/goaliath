import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { List } from 'react-native-paper'
import { getToday } from '../util'
import { toggleTask } from '../redux'
import { useTranslation } from 'react-i18next'
import { ActivityListItemColors } from '../styles/Colors'
import Checkbox from './Checkbox'
import { FlatList } from 'react-native';

const TaskList = ({ tasks, onTaskPress }) => (
    <FlatList
      data={tasks}
      renderItem={({ item }) => <TaskListItem task={item} onPress={onTaskPress} />}
    />
  )

export default TaskList

const PureTaskListItem = ({ task, today, toggleTask, onPress }) => {
    const { t, i18n } = useTranslation()
    console.log('task:', task)
  
    return(
      <View style={{ backgroundColor: ActivityListItemColors.listItemBackground }}>
        <List.Item
          left={() => (
            <View>
              <Checkbox 
                color='black'
                uncheckedColor='black'
                status={task.completed? 'checked' : 'unchecked'}
                onPress={() => {toggleTask({date: today, id: task.id})}}
              />
            </View>
          )}
          title={task.name}
          // description={t('today.oneTimeTaskDescription')}
          onPress={() => onPress(task)}
        />
      </View>
    )
  }
  
  const taskListItemActionsToProps = {
    toggleTask,
  }
  
  const taskListItemMapStateToProps = (state) => {
    const dayStartHour = state.settings.dayStartHour
    const today = getToday(dayStartHour)
  
    return { today }
  }
  
  const TaskListItem = connect(taskListItemMapStateToProps, taskListItemActionsToProps)(PureTaskListItem)
