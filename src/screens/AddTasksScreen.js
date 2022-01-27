
import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import { Header } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, Paragraph, TextInput, Subheading, IconButton, withTheme } from 'react-native-paper';
import { addTodayTask, tasksAddedToday } from '../redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const AddTasksScreen = ({ theme, navigation, addTodayTask, tasksAddedToday }) => {
  const { t, i18n } = useTranslation()

  const [taskNames, setTaskNames] = React.useState({0: ''})
  const [scrollViewRef, setScrollViewRef] = React.useState()

  const headerButtons = (
    <Appbar.Action
      icon='check'
      onPress={() => {
        Object.keys(taskNames).forEach(key => {
          if (taskNames[key] !== '') {
            addTodayTask(taskNames[key])
          }
        })
        tasksAddedToday()
        navigation.goBack()
      }}
      style={{ height: 48, width: 48 }}
    />
  )

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.addTasksScreenBackground}}>
    <Header 
      title={t('addTasks.title')}
      left='back' 
      navigation={navigation}
      buttons={headerButtons}
    />
    <View style={{flex: 1, paddingHorizontal: 14}}>
      <Paragraph style={{paddingVertical: 10}}>{t('addTasks.description')}</Paragraph>
      <KeyboardAwareScrollView overScrollMode='never' style={{flex: 1}}
        onContentSizeChange={()=>{if(scrollViewRef) scrollViewRef.scrollToEnd()}} 
        ref={r => setScrollViewRef(r)}>
        {
          Object.keys(taskNames).map((key, index) => {
            return (
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                <Subheading>{parseInt(key)+1}.</Subheading>
                <TextInput
                  style={{flex: 1, marginLeft: 14, height: 48, backgroundColor: 'transparent'}}
                  id={key}
                  value={taskNames[key]}
                  onChangeText={(text) => {
                    let newTaskNames = {...taskNames, [key]: text}
                    if(taskNames[parseInt(key) + 1] == undefined){
                      newTaskNames = {...newTaskNames, [parseInt(key) + 1]: ''}
                    }
                    setTaskNames(newTaskNames)
                  }}
                  placeholder={t('addTasks.placeholder')}
                />
                {taskNames[key] !== ''?
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    let newTaskNames = {...taskNames}
                    delete newTaskNames[key]
                    Object.keys(newTaskNames).forEach((k) => {
                      if(k > key){
                        newTaskNames[k-1] = newTaskNames[k]
                        delete newTaskNames[k]
                      }
                    })
                    setTaskNames(newTaskNames)
                  }}
                  style={{ height: 48, width: 48 }}
                /> :
                <IconButton
                  icon="close"
                  size={20}
                  color='transparent'
                  style={{ height: 48, width: 48 }}
                /> 
                }
              </View>
            )
          })
        }
      </KeyboardAwareScrollView>
    </View>
  </View>
  )
}


const mapStateToProps = (state) => {
  return {}
}

const actionsToProps = {
  addTodayTask,
  tasksAddedToday,
}

export default withTheme(connect(mapStateToProps, actionsToProps)(AddTasksScreen));
