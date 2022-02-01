import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { List, Portal, Dialog, Divider, Paragraph, Title, withTheme } from 'react-native-paper'
import { toggleTask, deleteTask, selectAllTasksByDate } from '../redux'
import { useTranslation } from 'react-i18next'
import Checkbox from './Checkbox'
import { StylishListItem } from '../components'


const TaskList = ({ date, show="all" }) => {
  const allTasks   = useSelector(state => selectAllTasksByDate(state, date))
  const completedTasks = allTasks.filter(task => task.completed)
  const pendingTasks = allTasks.filter(task => !task.completed)

  const filteredTasks = (
    show == "completed" ? completedTasks :
    show == "pending" ? pendingTasks :
    allTasks
  )

  return (
    filteredTasks.map(task => <TaskListItem date={date} task={task} />)
  )
}

export default TaskList

const TaskListItem = withTheme(({ date, task, theme }) => {
  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  return(
    <View style={{ backgroundColor: 'transparent' }}>
      <StylishListItem
        left={() => (
          <View>
            <Checkbox 
              color={theme.colors.todayCompletedIcon}
              uncheckedColor={theme.colors.todayDueIcon}
              status={task.completed? 'checked' : 'unchecked'}
              onPress={() => {dispatch(toggleTask(date, task.id))}}
            />
          </View>
        )}
        title={task.name}
        description={t('today.oneTimeTaskDescription')}
        onPress={() => setLongPressDialogVisible(true)}
        onLongPress={() => setLongPressDialogVisible(true)}
      />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
          <Dialog.Content>
            <Title>{task.name}</Title>
            <Paragraph style={{marginBottom: 15}}>{t("taskList.longPressMenu.paragraph")}</Paragraph>
            <Divider />
            <List.Item title={t("taskList.longPressMenu.deleteTitle")} onPress={() => {
              setLongPressDialogVisible(false)
              dispatch(deleteTask(date, task.id))
              }}
              description={t("taskList.longPressMenu.deleteDescription")} />
            <Divider />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  )
})