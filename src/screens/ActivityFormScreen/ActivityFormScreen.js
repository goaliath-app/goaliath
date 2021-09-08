import React from 'react';
import { connect, useSelector, useDispatch } from 'react-redux'
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, Pressable, View, StyleSheet } from 'react-native';
import { Appbar, TextInput, HelperText, Subheading, Portal, Dialog, Divider, List, Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, TimeInput } from '../../components';
import { createActivity, updateActivity, selectActivityById } from '../../redux'
import { GeneralColor, ActivityFormColor } from '../../styles/Colors';
import NumberOfWeeklyDaysInput from './NumberOfWeeklyDaysInput'
import WeekdaySelector from './WeekdaySelector'


const ActivityFormScreen = ({ route, navigation }) => {

  // extract data from route params and redux
  const activityId = route.params.activityId
  const activity = useSelector(state => selectActivityById(state, activityId))
  let goalId
  
  if(activity){
    goalId = activity.goalId
  }else{
    if(!route.params.goalId){
      throw "Navigated to ActivityFormScreen without providing activityId nor goalId. At least one is required."
    }
    goalId = route.params.goalId
  }

  // misc. hooks
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()
 
  // state default values
  const initialName = activity?.name?activity.name:''
  const initialfrequencySelector = activity?.frequencySelector?activity.frequencySelector: null
  const initialSeconds = activity?.seconds?activity.seconds:0
  const initialRepetitions = activity?.repetitions?activity.repetitions:0
  const initialDaysOfWeek = activity?.weekDays?activity.weekDays:{
    '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false
  }
  const initialDays = activity?.timesPerWeek?String(activity.timesPerWeek):'1'

  const [name, setName] = React.useState(initialName)
  const [frequencySelector, setFrequencySelector] = React.useState(initialfrequencySelector)  // 'daily', 'free' or 'weekly'
  const [seconds, setSeconds] = React.useState(initialSeconds) // 'seconds'
  const [repetitions, setRepetitions] = React.useState(initialRepetitions) // 'repetitions'
  const [daysOfWeek, setDaysOfWeek] = React.useState(initialDaysOfWeek) // '1', '2', '3', '4', '5', '6', '7'
  const [days, setDays] = React.useState(initialDays) // int
 
  const [multipleTimesSwitch, setMultipleTimesSwitch] = React.useState(false)
  const [timeGoalSwitch, setTimeGoalSwitch] = React.useState(false)
  const [repetitionsGoalSwitch, setRepetitionsGoalSwitch] = React.useState(false)

  const [nameInputError, setNameInputError] = React.useState(false)
  const [daysOfWeekError, setDaysOfWeekError] = React.useState(false)
  const [timeInputError, setTimeInputError] = React.useState(false)

  const [isFrecuencyVisible, setFrequencyVisible] = React.useState(false)

//TODO: modificar las cosas
  const validate = ( newActivity ) => {
    const { name, frequencySelector, goal, seconds, weekDays } = newActivity
    let error = false
    if(!name){
      setNameInputError(true)
      error = true
    }
    if(goal == 'time' && !seconds){
      setTimeInputError(true)
      error = true
    }
    if(frequencySelector == 'daily'){
      let aDayIsSelected = false
      for(let day in daysOfWeek){
        if (daysOfWeek[day] == true){ aDayIsSelected = true }
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
          name, goalId, 
          type: frequencySelector=='daily'? 'doFixedDays'
            : frequencySelector=='free'? 'doNDaysEachWeek'
            : frequencySelector=='weekly' && repetitionsGoalSwitch? 'doNTimesEachWeek'
            : frequencySelector=='weekly' && timeGoalSwitch? 'doNSecondsEachWeek'
            : null, 
          params: type=='doFixedDays'? 
            {daysOfWeek, 
              dailyGoal: {type: timeGoalSwitch? 'doNSeconds' : 'doNTimes', params: timeGoalSwitch? seconds : repetitions}}
            : type=='doNDaysEachWeek'? {days: Number.parseInt(days), dailyGoal: {type: 'doNSeconds', params: seconds }}
            : type=='doNTimesEachWeek'? {params: repetitions}
            : type=='doNSecondsEachWeek'? {params: seconds}
            : null}

        if(validate(newActivity)){
          if(activity){
            dispatch(updateActivity({...newActivity, id: activity.id}))
          }else{
            console.log('hola', newActivity)
            dispatch(createActivity(newActivity))
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
      <ScrollView style={{flexGrow: 0}} overScrollMode='never' contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled' >
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

        <Subheading style={{marginLeft: 10}}>{t('activityForm.frequencyTitle')}</Subheading>
        <Pressable style={{borderWidth: 1, margin: 20, paddingHorizontal: 15, paddingVertical: 10}} onPress={() => setFrequencyVisible(true)}>
          <Text style={{ fontSize: 16 }}>{!frequencySelector? t('activityForm.frequencyLabel')
            :frequencySelector=='daily'? t('activityForm.dialog.dailyTitle')
            :frequencySelector=='free'? t('activityForm.dialog.freeTitle')
            :frequencySelector=='weekly'? t('activityForm.dialog.weeklyTitle')
            : null
          }</Text>
        </Pressable>

        {frequencySelector=='daily'?
          <View> 
            <WeekdaySelector 
              state='select'
              weekDays={daysOfWeek} 
              setWeekDays={setDaysOfWeek} 
              setWeekDaysError={setDaysOfWeekError}
            />
            <HelperText 
              style={{
                textAlign: 'center', 
                borderTopWidth: 1, 
                borderTopColor: GeneralColor.helperTextBorderTopColor, 
                marginHorizontal: 25 
              }} 
              type="error" 
              visible={daysOfWeekError}
            >
              {t('activityForm.errors.noDaysSelected')}
            </HelperText>

            <List.Item 
              title={t('activityForm.switch.multipleTimes')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={multipleTimesSwitch} onValueChange={() => setMultipleTimesSwitch(!multipleTimesSwitch)}/>
                </View>
              )}
            />
            {multipleTimesSwitch?
              <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
                <Text style={{alignSelf: 'center'}}>{t('activityForm.dailyRepetitions')}</Text>
                <TextInput 
                  style={{
                    marginLeft: 20,
                    fontSize: 40,
                    textAlign: 'center',
                    backgroundColor: ActivityFormColor.weeklyDaysTextInputBackground
                  }} 
                  selectTextOnFocus={true}
                  selectionColor= {ActivityFormColor.weeklyDaysTextInputSelectionColor}
                  value={repetitions}
                  onChangeText={(value) => {
                    value = value<1000?value:'999'
                    value = value>0?value:''
                    setRepetitions(value)
                  }}  
                  keyboardType='numeric' 
                />
              </View>
            : null
            }
          </View>
          : <></>        
        }

        {frequencySelector == 'free'?
          <NumberOfWeeklyDaysInput daysPerWeek={days} setDaysPerWeek={setDays} />
          : null 
        }

        {frequencySelector=='weekly'?
          <View>
            <List.Item 
              title={t('activityForm.switch.repetitionsGoal')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={repetitionsGoalSwitch} onValueChange={() => {setTimeGoalSwitch(false), setRepetitionsGoalSwitch(!repetitionsGoalSwitch)}} />
                </View>
              )}
            />
            {repetitionsGoalSwitch?
              <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
                <Text style={{alignSelf: 'center'}}>{t('activityForm.weeklyRepetitions')}</Text>
                <TextInput 
                  style={{
                    marginLeft: 20,
                    fontSize: 40,
                    textAlign: 'center',
                    backgroundColor: ActivityFormColor.weeklyDaysTextInputBackground
                  }} 
                  selectTextOnFocus={true}
                  selectionColor= {ActivityFormColor.weeklyDaysTextInputSelectionColor}
                  value={repetitions}
                  onChangeText={(value) => {
                    value = value<1000?value:'999'
                    value = value>0?value:''
                    setRepetitions(value)
                  }}  
                  keyboardType='numeric' 
                />
              </View>
              : null}
          </View>
          : null
        }
        
        {frequencySelector?
          <View>
            <List.Item 
              title={t('activityForm.switch.timeGoal')}
              right={() => (
                <View style={{ marginRight: 12 }}>
                  <Switch value={timeGoalSwitch} onValueChange={() => {setRepetitionsGoalSwitch(false), setTimeGoalSwitch(!timeGoalSwitch)}} />
                </View>
              )}
            />
            {timeGoalSwitch?
              <View>
                <TimeInput
                  value={seconds}
                  onValueChange={ (value) => {
                    setSeconds(value)
                    setTimeInputError(false)
                  }}
                />
                <HelperText 
                  style={{
                    textAlign: 'center', 
                    borderTopWidth: 1, 
                    borderTopColor: GeneralColor.helperTextBorderTopColor, 
                    marginHorizontal: 35
                  }} 
                  type="error" 
                  visible={timeInputError}
                >
                  {t('activityForm.errors.noTime')}
                </HelperText>
              </View>
            : null }
          </View>
        : null}
        

        <Portal>
          <Dialog visible={isFrecuencyVisible} onDismiss={() => {setFrequencyVisible(false)}}>
            <Dialog.Title>{t('activityForm.dialog.title')}</Dialog.Title>
              <Dialog.Content>
                <Divider />
                <List.Item title={t('activityForm.dialog.dailyTitle')} description={t('activityForm.dialog.dailyDescription')} onPress={() => {setFrequencySelector('daily'), setFrequencyVisible(false)}} />
                <Divider />
                <List.Item title={t('activityForm.dialog.freeTitle')} description={t('activityForm.dialog.freeDescription')} onPress={() => {setFrequencySelector('free'), setFrequencyVisible(false)}} />
                <Divider />
                <List.Item title={t('activityForm.dialog.weeklyTitle')} description={t('activityForm.dialog.weeklyDescription')} onPress={() => {setFrequencySelector('weekly'), setFrequencyVisible(false)}} />
                <Divider />
              </Dialog.Content>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  textInput: {
    fontSize: 40,
    textAlign: 'center',
    backgroundColor: ActivityFormColor.weeklyDaysTextInputBackground
  }
})

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
