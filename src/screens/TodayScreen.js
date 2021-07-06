import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard } from '../components';
import { updateLogs } from '../redux'
import { extractActivityLists, getToday, hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import { Paragraph, Portal, Dialog, Button, TextInput, Appbar } from 'react-native-paper';


const TodayScreen = ({ todaysActivities, navigation, updateLogs }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )
  
  const { t, i18n } = useTranslation()
  const [ addTaskDialogVisible, setAddTaskDialogVisible ] = React.useState(false)
  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('today.headerTitle')} left='hamburger' navigation={navigation}
        buttons={
          <Appbar.Action icon='plus' onPress={() => setAddTaskDialogVisible(true)} />
        }
      />
      {hasSomethingToShow(todaysActivities)?
      <ActivityList data={todaysActivities} />
      :
      <InfoCard content={t('today.infoContent')} />
      }
      <AddTaskDialog visible={addTaskDialogVisible} setVisible={setAddTaskDialogVisible} addTask={()=>{}} />
    </View>
  );
}

const AddTaskDialog = ({visible, setVisible, addTask}) => {
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
          <Button onPress={() => {close()}}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const { dayActivities } = extractActivityLists(state, getToday(dayStartHour))
  return { todaysActivities: dayActivities }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
