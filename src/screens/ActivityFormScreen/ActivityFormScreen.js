import React from 'react';
import { connect, useSelector, useDispatch } from 'react-redux'
import { KeyboardAvoidingView, Platform, ScrollView, Keyboard, Pressable, View, StyleSheet } from 'react-native';
import { Appbar, TextInput, HelperText, Subheading, Portal, Dialog, Divider, List, Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { Header, TimeInput } from '../../components';
import { setActivity, selectActivityById } from '../../redux'
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
  const initialfrequencySelector = (
    activity?.type == 'doFixedDays'? 'daily' :
    activity?.type == 'doNDaysEachWeek'? 'free' :
    activity?.type == 'doNSecondsEachWeek'? 'weekly' :
    activity?.type == 'doNTimesEachWeek'? 'weekly' :
    null
  )
  const initialSeconds = (
    activity?.params.seconds? activity.params.seconds :
    activity?.params.dailyGoal?.params.seconds? activity.params.dailyGoal.params.seconds :
    0
  )
  const initialTimeGoalSwitch = initialSeconds? true : false
  const initialRepetitions = (
    activity?.params.repetitions? activity.params.repetitions :
    activity?.params.dailyGoal?.params.repetitions? activity.params.dailyGoal.params.repetitions :
    '1'
  )
  const initialMultipleTimesSwitch = (
    activity?.params.dailyGoal?.type == 'doNTimes'
  )
  const initialDaysOfWeek = (
    activity?.params.daysOfWeek? activity.params.daysOfWeek :
    { '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true }
  )
  const initialDays = (
    activity?.params.days? String(activity.params.days) : '1'
  )
  const initialRepetitionsGoalSwitch = (
    activity?.type == 'doNTimesEachWeek'
  )

  const [name, setName] = React.useState(initialName)
  const [frequencySelector, setFrequencySelector] = React.useState(initialfrequencySelector)  // 'daily', 'free' or 'weekly'
  const [seconds, setSeconds] = React.useState(initialSeconds) // 'seconds'
  const [repetitions, setRepetitions] = React.useState(initialRepetitions) // 'repetitions'
  const [daysOfWeek, setDaysOfWeek] = React.useState(initialDaysOfWeek) // '1', '2', '3', '4', '5', '6', '7'
  const [days, setDays] = React.useState(initialDays) // int
 
  const [timeGoalSwitch, setTimeGoalSwitch] = React.useState(initialTimeGoalSwitch)
  // switch to do multiple times each day
  const [multipleTimesSwitch, setMultipleTimesSwitch] = React.useState(initialMultipleTimesSwitch)
  // switch to do multiple times each week
  const [repetitionsGoalSwitch, setRepetitionsGoalSwitch] = React.useState(initialRepetitionsGoalSwitch)

  const [nameInputError, setNameInputError] = React.useState(false)
  const [daysOfWeekError, setDaysOfWeekError] = React.useState(false)
  const [timeInputError, setTimeInputError] = React.useState(false)
  const [noFrequencyError, setNoFrequencyError] = React.useState(false)

  const [isFrecuencyVisible, setFrequencyVisible] = React.useState(false)

  //TODO: actualizar la función validate
  const validate = () => {
    let error = false

    if(!name){
      setNameInputError(true)
      error = true
    }

    if(frequencySelector === null){
      setNoFrequencyError(true)
      error = true
    }
    
    if(timeGoalSwitch && !seconds){
      setTimeInputError(true)
      error = true
    }
    
    // if daily activity but all weekdays are false
    if(frequencySelector == 'daily'){
      let aDayIsSelected = false
      for(let day in daysOfWeek){
        if (daysOfWeek[day] == true){ aDayIsSelected = true }
      }
      if(!aDayIsSelected){
        setDaysOfWeekError(true)
        error = true
      }
    }

    if(error){
      return false
    }else{
      setTimeInputError(false)
      setNameInputError(false)
      setDaysOfWeekError(false)
      setNoFrequencyError(false)
      return true
    }
  }

  const headerButtons = (
    <Appbar.Action icon='check' onPress={() => {
        Keyboard.dismiss()

        const type = (
          frequencySelector=='daily'? 'doFixedDays'
            : frequencySelector=='free'? 'doNDaysEachWeek'
            : frequencySelector=='weekly' && repetitionsGoalSwitch? 'doNTimesEachWeek'
            : frequencySelector=='weekly' && timeGoalSwitch? 'doNSecondsEachWeek'
            : null
        )

        let params

        if(type == 'doFixedDays'){
          let dailyGoal

          if(timeGoalSwitch){
            dailyGoal = {
              type: 'doNSeconds',
              params: { seconds }
            }
          }else if(multipleTimesSwitch){
            dailyGoal = {
              type: 'doNTimes',
              params: { repetitions }
            }
          }else{
            dailyGoal = {
              type: 'doOneTime',
              params: {}
            }
          }

          params = {
            daysOfWeek, 
            dailyGoal
          }

        }else if(type == 'doNDaysEachWeek'){
          params = {
            days: Number.parseInt(days), 
            dailyGoal: (
              timeGoalSwitch? {type: 'doNSeconds', params: { seconds } } :
                {type: 'doOneTime', params:  {}}
            )
          }
        }else if(type == 'doNTimesEachWeek'){
          params = { repetitions }
        }else if(type == 'doNSecondsEachWeek'){
          params = { seconds }
        }

        const newActivity = { 
          name, 
          goalId, 
          type, 
          params, 
        }

        if(validate()){
          if(activityId !== undefined){
            dispatch(setActivity({ ...activity, ...newActivity }))
          }else{
            dispatch(setActivity({ ...newActivity, archived: false, active: true }))
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
        <Pressable style={{borderWidth: 1, margin: 20, paddingHorizontal: 15, paddingVertical: 10}} onPress={() => {setFrequencyVisible(true), setNoFrequencyError(false)}}>
          <Text style={{ fontSize: 16 }}>{!frequencySelector? t('activityForm.frequencyLabel')
            :frequencySelector=='daily'? t('activityForm.dialog.dailyTitle')
            :frequencySelector=='free'? t('activityForm.dialog.freeTitle')
            :frequencySelector=='weekly'? t('activityForm.dialog.weeklyTitle')
            : null
          }</Text>
        </Pressable>
        <HelperText style={{paddingLeft:25}} type="error" visible={noFrequencyError}>
          {t('activityForm.errors.noFrequency')}
        </HelperText>

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
                  <Switch value={multipleTimesSwitch} onValueChange={() => {setTimeGoalSwitch(false), setMultipleTimesSwitch(!multipleTimesSwitch)}} />
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
                    value = value>0?value:'1'
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
                  <Switch value={repetitionsGoalSwitch} onValueChange={() => {
                    if(!timeGoalSwitch){
                      setTimeGoalSwitch(true)
                    } else{
                      setTimeGoalSwitch(false)
                    }
                    setRepetitionsGoalSwitch(!repetitionsGoalSwitch)
                  }} />
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
                    value = value>0?value:'1'
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
                  <Switch value={timeGoalSwitch} onValueChange={( newValue ) => {
                    if (!repetitionsGoalSwitch && !newValue) {
                      setRepetitionsGoalSwitch(true)
                    } else {
                      setRepetitionsGoalSwitch(false)
                    }
                    setMultipleTimesSwitch(false)
                    setTimeGoalSwitch(newValue)
                  }} />
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
                <List.Item title={t('activityForm.dialog.weeklyTitle')} description={t('activityForm.dialog.weeklyDescription')} onPress={() => {
                  setFrequencySelector('weekly')
                  setFrequencyVisible(false)
                  if (!repetitionsGoalSwitch && !timeGoalSwitch) {
                    setRepetitionsGoalSwitch(true)
                  }
                }} />
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

export default ActivityFormScreen
