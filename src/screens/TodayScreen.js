import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard, SelectWeekliesListItem, SelectTasksListItem } from '../components';
import { updateLogs, areWeekliesSelectedToday } from '../redux'
import { extractActivityList, getToday, hasSomethingToShow, areThereWeeklyActivities } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';
import { Paragraph, Portal, Dialog, Button, TextInput, Appbar } from 'react-native-paper';


const TodayScreen = ({ entryList, navigation, updateLogs, weekliesSelector }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )
  
  const completedActivities = entryList.filter(activity => activity.completed)
  const pendingActivities   = entryList.filter(activity => !activity.completed)

  const { t, i18n } = useTranslation()
  const [ addTaskDialogVisible, setAddTaskDialogVisible ] = React.useState(false)
  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation} />
      {hasSomethingToShow(entryList) || weekliesSelector != 'hidden'?
      <View>
        <ActivityList data={pendingActivities} />
        <SelectTasksListItem checked={false} onPress={() => setAddTaskDialogVisible(true)}/>
        {weekliesSelector=='unchecked'?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        <ActivityList data={completedActivities} />
        {weekliesSelector=='checked'?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
      </View>
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
  const entryList = extractActivityList(state, getToday(dayStartHour))
  const weekliesSelector = (
    areThereWeeklyActivities(state)?  
      (areWeekliesSelectedToday(state)?
       'checked'
       :
       'unchecked')
      :
      'hidden'
  )

  return { entryList, weekliesSelector }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
