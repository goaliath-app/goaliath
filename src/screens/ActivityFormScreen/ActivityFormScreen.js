import React from 'react';
import { connect } from 'react-redux'
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { Appbar, TextInput, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, TimeInput } from '../../components';
import { createActivity, updateActivity, selectActivityById } from '../../redux'
import { GeneralColor } from '../../styles/Colors';
import NumberOfWeeklyDaysInput from './NumberOfWeeklyDaysInput'
import ActivityTypeSelector from './ActivityTypeSelector'
import WeekdaySelector from './WeekdaySelector'
import TimeGoal from './TimeGoal'



const ActivityFormScreen = ({ navigation, createActivity, updateActivity, goalId=null, activity=null }) => {
  if(activity){
    goalId = activity.goalId
  }

  const { t, i18n } = useTranslation()
  
  const [name, setName] = React.useState(activity?.name?activity.name:'');
  const [repeatMode, setRepeatMode] = React.useState(activity?.repeatMode?activity.repeatMode:'daily');  // 'daily', 'select' or 'weekly'
  const [goal, setGoal] = React.useState(activity?.goal?activity.goal:'check');  // 'time' or 'check'

  const [timeGoal, setTimeGoal] = React.useState(activity?.timeGoal?activity.timeGoal:0);

  const [weekDays, setWeekDays] = React.useState(activity?.weekDays?activity.weekDays:{
    '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false
  })
  const [timesPerWeek, setTimesPerWeek] = React.useState(activity?.timesPerWeek?String(activity.timesPerWeek):'1')

  const [nameInputError, setNameInputError] = React.useState(false)
  const [weekDaysError, setWeekDaysError] = React.useState(false)
  const [timeInputError, setTimeInputError] = React.useState(false)

  const validate = ( newActivity ) => {
    const { name, repeatMode, goal, goalId, timeGoal, weekDays } = newActivity
    let error = false
    if(!name){
      setNameInputError(true)
      error = true
    }
    if(goal == 'time' && !timeGoal){
      setTimeInputError(true)
      error = true
    }
    if(repeatMode == 'select'){
      let aDayIsSelected = false
      for(let day in weekDays){
        if (weekDays[day] == true){ aDayIsSelected = true }
      }
      if(!aDayIsSelected){
        setWeekDaysError(true)
        error = true
      }
    }
    if(error){
      return false
    }else{
      setTimeInputError(false)
      setNameInputError(false)
      setWeekDaysError(false)
      return true
    }
  }

  const headerButtons = (
    <Appbar.Action icon='check' onPress={() => {
        Keyboard.dismiss()
        
        const newActivity = { 
          name, repeatMode, goal, timeGoal: goal=='time'?timeGoal:0, 
          weekDays, timesPerWeek: Number.parseInt(timesPerWeek), goalId: goalId }
        if(validate(newActivity)){
          if(activity){
            updateActivity({...newActivity, id: activity.id})
          }else{
            createActivity(newActivity)
          }
          navigation.goBack()
        }
      }} 
    /> 
  )

  return(
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}
    >
      <Header 
        title={activity?.name?activity.name:t('activityForm.headerTitle')} 
        left='back' navigation={navigation} 
        buttons={headerButtons}
      />
      <ScrollView style={{flexGrow: 0}} overScrollMode='never' >
        <TextInput 
          error={nameInputError} 
          style={{paddingHorizontal: 15, paddingTop: 10, fontSize: 16, height: 55, backgroundColor: GeneralColor.textInputBackground}} 
          mode= 'outlined' 
          label={t('activityForm.nameInputLabel')}
          value={name} 
          onChangeText={name => {
            setName(name)
            setNameInputError(false)
          }} 
        />
        <HelperText style={{paddingLeft:25}} type="error" visible={nameInputError}>
          {t('activityForm.errors.noName')}
        </HelperText>
        <ActivityTypeSelector repeatMode={repeatMode} setRepeatMode={setRepeatMode}/>
        <WeekdaySelector state={repeatMode} weekDays={weekDays} setWeekDays={setWeekDays} setWeekDaysError={setWeekDaysError}/>
        <HelperText style={{textAlign: 'center', borderTopWidth: 1, borderTopColor: GeneralColor.helperTextBorderTopColor, marginHorizontal: 25 }} type="error" visible={weekDaysError}>
        {t('activityForm.errors.noDaysSelected')}
        </HelperText>
        <TimeGoal goal={goal} setGoal={(value) => {
          setGoal(value)
          }} />
        
        {goal=='time'?
          <TimeInput
            value={timeGoal}
            onValueChange={ (value) => {
              setTimeGoal(value)
              setTimeInputError(false)
            }}
          />
        : null }
        {goal=='check' && repeatMode == 'weekly'?
          <NumberOfWeeklyDaysInput timesPerWeek={timesPerWeek} setTimesPerWeek={setTimesPerWeek} />
        : null }
        <HelperText style={{textAlign: 'center', borderTopWidth: 1, borderTopColor: GeneralColor.helperTextBorderTopColor, marginHorizontal: 35}} type="error" visible={timeInputError}>
          {t('activityForm.errors.noTime')}
        </HelperText>
      </ScrollView>
      
   
    </KeyboardAvoidingView>
  )
}

const actionsToProps = {
  createActivity,
  updateActivity
}

const mapStateToProps = (state, ownProps) => {
  const activityId = ownProps.route.params.activityId
  const activity = selectActivityById(state, activityId)
  if(activity){
    return { activity: activity, goalId: activity.goalId }
  }else{
    if(!ownProps.route.params.goalId){
      throw "Navigated to ActivityFormScreen without providing activityId nor goalId. At least one is required."
    }
    return { goalId: ownProps.route.params.goalId }
  }
}

export default connect(mapStateToProps, actionsToProps)(ActivityFormScreen);
