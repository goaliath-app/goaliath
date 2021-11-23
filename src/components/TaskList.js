import React from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native'
import { List, Portal, Dialog, Divider, Paragraph, Title } from 'react-native-paper'
import { getToday } from '../util'
import { toggleTask, getTodaySelector, deleteTodayTask } from '../redux'
import { useTranslation } from 'react-i18next'
import { ActivityListItemColors } from '../styles/Colors'
import Checkbox from './Checkbox'
import { FlatList } from 'react-native';
import { DeleteDialog } from '../components'
import { Context } from '../../App'


const TaskList = ({ tasks }) => (
    <FlatList
      data={tasks}
      renderItem={({ item }) => <TaskListItem task={item} />}
    />
  )

export default TaskList

const TaskListItem = ({ task }) => {
  const [ isLongPressDialogVisible, setLongPressDialogVisible ] = React.useState(false)
  const dispatch = useDispatch()
  const today = useSelector(getTodaySelector)
  const { t, i18n } = useTranslation()
  const { showSnackbar } = React.useContext(Context);

  return(
    <View style={{ backgroundColor: ActivityListItemColors.listItemBackground }}>
      <List.Item
        left={() => (
          <View>
            <Checkbox 
              color='black'
              uncheckedColor='black'
              status={task.completed? 'checked' : 'unchecked'}
              onPress={() => {dispatch(toggleTask(today, task.id))}}
            />
          </View>
        )}
        title={task.name}
        description={t('today.oneTimeTaskDescription')}
        onPress={()=>{}}
        onLongPress={() => setLongPressDialogVisible(true)}
      />

      {/* Long press menu */}
      <Portal>
        <Dialog visible={isLongPressDialogVisible} onDismiss={() => {setLongPressDialogVisible(false)}}>
            <Dialog.Content>
              <Title>{task.name}</Title>
              <Paragraph style={{marginBottom: 15}}>{t("taskList.longPressMenu.paragraph")}</Paragraph>
              <Divider />
              <List.Item title={t("taskList.longPressMenu.delete")} onPress={() => {
                setLongPressDialogVisible(false)
                showSnackbar(t("taskList.longPressMenu.deleteSnackbar"))
                dispatch(deleteTodayTask(task.id))
              }} />
              <Divider />
            </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  )
}