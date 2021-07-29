import React from 'react';
import { connect } from 'react-redux';
import { addTodayTask, tasksAddedToday } from '../redux'
import { useTranslation } from 'react-i18next'
import { Paragraph, Portal, Dialog, Button, TextInput } from 'react-native-paper';


const AddTaskDialog = ({visible, setVisible, addTodayTask, tasksAddedToday }) => {
  const { t, i18n } = useTranslation()

  const [taskName, setTaskName] = React.useState('')

  function close(){
    setVisible(false)
    setTaskName('')
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => {close()}}>
        <Dialog.Title>Add One Time Task</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Use it as a reminder. It will appear just in this day.</Paragraph>
          <TextInput 
            // error={nameInputError} 
            mode='outlined' 
            label='Task Name'
            value={taskName} 
            onChangeText={(value) => {
              //setNameInputError(false)
              setTaskName(value)
            }} 
          />
          {/* <HelperText style={{paddingLeft:15}} type="error" visible={nameInputError}>
          {t('goalForm.nameError')}
          </HelperText> */}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {close()}}>Cancel</Button>
          <Button onPress={() => {
            tasksAddedToday()
            addTodayTask(taskName)
            close()
          }}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const actionsToProps = {
  addTodayTask,
  tasksAddedToday,
}

export default connect(null, actionsToProps)(AddTaskDialog)