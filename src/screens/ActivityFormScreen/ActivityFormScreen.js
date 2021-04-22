import React from 'react';
import { connect } from 'react-redux'
import { View, StyleSheet, Alert, Pressable, FlatList, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { Subheading, Appbar, Text, TextInput, Button, List, Checkbox, Title, Paragraph, HelperText, Caption } from 'react-native-paper';
import { Header, HelpIcon } from '../../components';
import { createActivity, updateActivity, selectActivityById } from '../../redux'
import { useTranslation } from 'react-i18next'



const ActivityFormScreen = ({ navigation, createActivity, updateActivity, goalId=null, activity=null }) => {
  if(activity){
    goalId = activity.goalId
  }

  const { t, i18n } = useTranslation()
  
  const [name, setName] = React.useState(activity?.name?activity.name:'');
  const [repeatMode, setRepeatMode] = React.useState(activity?.repeatMode?activity.repeatMode:'daily');  // 'daily', 'select' or 'weekly'
  const [goal, setGoal] = React.useState(activity?.goal?activity.goal:'check');  // 'time' or 'check'
  const [seconds, setSeconds] = React.useState(activity?.timeGoal?(activity.timeGoal%60).toString().padStart(2, '0'):'00');
  const [minutes, setMinutes] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal%3600)/60)).toString().padStart(2, '0'):'00');
  const [hours, setHours] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal/3600))).toString().padStart(2, '0'):'00');
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
        let timeGoal
        if( hours || minutes || seconds ){
          const secondsFromHour = Number.parseInt(hours)*3600
          const secondsFromMinute = Number.parseInt(minutes)*60
          const secondsFromSeconds = Number.parseInt(seconds)
          timeGoal = (
            (secondsFromHour?secondsFromHour:0) 
            + (secondsFromMinute?secondsFromMinute:0) 
            + (secondsFromSeconds?secondsFromSeconds:0)
          )
        }
        
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
      style={{flex: 1}}
    >
      <Header 
        title={activity?.name?activity.name:t('activityForm.headerTitle')} 
        left='back' navigation={navigation} 
        buttons={headerButtons}
      />
      <ScrollView style={{flexGrow: 0}} overScrollMode='never' >
        <TextInput 
          error={nameInputError} 
          style={{paddingHorizontal: 15, paddingTop: 10, fontSize: 16, height: 55}} 
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
        <HelperText style={{textAlign: 'center', borderTopWidth: 1, borderTopColor: '#CE0A24', marginHorizontal: 25 }} type="error" visible={weekDaysError}>
        {t('activityForm.errors.noDaysSelected')}
        </HelperText>
        <TimeGoal goal={goal} setGoal={(value) => {
          setGoal(value)
          }} />
        
        {goal=='time'?
          <TimeInput
            hours={hours} setHours={setHours} 
            minutes={minutes} setMinutes={setMinutes} 
            seconds={seconds} setSeconds={setSeconds}
            setTimeInputError={setTimeInputError}
          />
        : null }
        {goal=='check' && repeatMode == 'weekly'?
          <NumberOfWeeklyDaysInput timesPerWeek={timesPerWeek} setTimesPerWeek={setTimesPerWeek} />
        : null }
        <HelperText style={{textAlign: 'center', borderTopWidth: 1, borderTopColor: '#CE0A24', marginHorizontal: 35}} type="error" visible={timeInputError}>
          {t('activityForm.errors.noTime')}
        </HelperText>
      </ScrollView>
      
   
    </KeyboardAvoidingView>
  )
}

const ButtonSwitchBar = ({ options, state, setState }) => {
  /* generic switch bar component */
  const styles = StyleSheet.create({
    buttonSwitchBarView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 10,
    },
  })

  return(
    <View style={styles.buttonSwitchBarView}>
      {options.map((option) => (
        <Button style={{flex:1, borderRadius: 0}}
        mode={state==option.value? 'contained':'text'} 
        onPress={()=>setState(option.value)}
        labelStyle={{ fontSize: 11}}>
            {option.label}
        </Button>
      ))}
    </View>
  )
}

const TimeInput = ({ hours, setHours, minutes, setMinutes, seconds, setSeconds, setTimeInputError }) => {
  const hoursInput = React.useRef()
  const minutesInput = React.useRef()
  const secondsInput = React.useRef()

  // used to fix some weird behavior with selection
  const [hoursSelection, setHoursSelection] = React.useState()

  const [currentFocus, setCurrentFocus] = React.useState()

  const commonProps = {
    style: {
      fontSize: 50, padding: 5, textAlign: 'center', 
      backgroundColor: 'transparent', underlineColorAndroid: 'transparent',
    },
    keyboardType: 'number-pad',
    selectTextOnFocus: true,
    maxLength: 2,
    caretHidden: false,
    underlineColor: 'transparent',
    selectionColor: 'transparent',
    //theme: { colors: { primary: 'transparent' } }
  }
  const getTheme = (isFocused)=>({ colors: { primary: 'transparent', text: isFocused?'#7B61FF':'black' } })

  return(
      <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center'}}>
        <TextInput 
          value={hours} onChangeText={(value) => {
            value = value<24?value:'24'
            setHours(value)
            setHoursSelection({start: value.length, end: value.length})
            setTimeInputError(false)
          }} 
          ref={hoursInput}
          onFocus={ () => {
            setHoursSelection({start: 0, end: hours.length})
            setCurrentFocus('hours')
          }} 
          theme={getTheme(currentFocus=='hours')}
          onBlur={()=>{
            if(currentFocus=='hours') setCurrentFocus('')
            setHours(hours.padStart(2, '0'))
          }}
          selection={hoursSelection}
          {...commonProps} 
        />
        <Text style={{fontSize: 50, marginBottom: 5}}>:</Text>
        <TextInput 
          value={minutes} 
          onChangeText={(value) => {
            value = value<59?value:'59'
            setMinutes(value)
            setTimeInputError(false)
          }} 
          ref={minutesInput} 
          onFocus={()=>{
            setCurrentFocus('minutes')
          }} theme={getTheme(currentFocus=='minutes')}
          onBlur={()=>{
            if(currentFocus=='minutes') setCurrentFocus('')
            setMinutes(minutes.padStart(2, '0'))
          }}
          {...commonProps} 
        />
        <Text style={{fontSize: 50, marginBottom: 5}}>:</Text>
        <TextInput 
          value={seconds} 
          onChangeText={(value) => {
            value = value<59?value:'59'
            setSeconds(value)
            setTimeInputError(false)
          }} 
          ref={secondsInput} 
          onFocus={()=>{
            setCurrentFocus('seconds')
          }} theme={getTheme(currentFocus=='seconds')}
          onBlur={()=>{
            if(currentFocus=='seconds') setCurrentFocus('')
            setSeconds(seconds.padStart(2, '0'))
          }}
          {...commonProps} 
        />
      </View>
  )
}

const NumberOfWeeklyDaysInput = ({ timesPerWeek, setTimesPerWeek }) => {
  const { t, i18n } = useTranslation()
  
  return(
    <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
      <Subheading style={{alignSelf: 'center'}}>{t('activityForm.weeklyDaysLabel')}</Subheading>
      <TextInput 
        style={{
          marginLeft: 20,
          fontSize: 40,
          textAlign: 'center',
          backgroundColor: 'transparent'
        }} 
        selectTextOnFocus={true}
        selectionColor= 'transparent'
        value={timesPerWeek} 
        selection={{start:0, end:1}}
        onChangeText={(value) => {
          value = value.substr(value.length - 1)
          value = value<7?value:'7'
          value = value>0?value:'1'
          setTimesPerWeek(value)
        }}  
        keyboardType='numeric' 
      />
    </View>
  )
}



const ActivityTypeSelector = ({ repeatMode, setRepeatMode }) => {
  const { t, i18n } = useTranslation()
  return(
    <>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, paddingBottom: 10}}>
      <Subheading>{t('activityForm.repeatSwitchBar.title')}</Subheading>
        <HelpIcon dialogContent={
          <>
          <Title>{t('activityForm.repeatInfoDialog.mainTitle')}</Title>
          <Subheading>{t('activityForm.repeatInfoDialog.dailyTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.dailyText')}</Paragraph>
          <Subheading>{t('activityForm.repeatInfoDialog.selectTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.selectText')}</Paragraph>
          <Subheading>{t('activityForm.repeatInfoDialog.weeklyTitle')}</Subheading>
          <Paragraph>{t('activityForm.repeatInfoDialog.weeklyText')}</Paragraph>
          </>
        } />
      </View>
      <ButtonSwitchBar
        options={[
          {label: t('activityForm.repeatSwitchBar.daily'), value: 'daily'},
          {label: t('activityForm.repeatSwitchBar.select'), value: 'select'},
          {label: t('activityForm.repeatSwitchBar.weekly'), value: 'weekly'},
        ]}
        state={repeatMode} setState={setRepeatMode}
      />
    </>
  )
}


const TimeGoal = ({ 
    goal, setGoal
  }) => {
  const { t, i18n } = useTranslation()
  return (
    <>
    <List.Item 
      title={t('activityForm.objectiveSwitchLabel')}
      right={()=>(
        <View style={{marginRight: 12}}>
          <Checkbox
            status={goal=='time' ? 'checked' : 'unchecked'}
            onPress={() => {setGoal(goal!=='time'?'time':'check')}}
          />
        </View>
      )}
    />
    
    </>
  )
}


const WeekdaySelector = ({ state, weekDays, setWeekDays, setWeekDaysError }) => {
  const { t, i18n } = useTranslation()
  let items = [
    {id: '1', label: t('units.dayNamesInitials.monday'), state: 'disabled', onPress: ()=>{}},
    {id: '2', label: t('units.dayNamesInitials.tuesday'), state: 'disabled', onPress: ()=>{}},
    {id: '3', label: t('units.dayNamesInitials.wednesday'), state: 'disabled', onPress: ()=>{}},
    {id: '4', label: t('units.dayNamesInitials.thursday'), state: 'disabled', onPress: ()=>{}},
    {id: '5', label: t('units.dayNamesInitials.friday'), state: 'disabled', onPress: ()=>{}},
    {id: '6', label: t('units.dayNamesInitials.saturday'), state: 'disabled', onPress: ()=>{}},
    {id: '7', label: t('units.dayNamesInitials.sunday'), state: 'disabled', onPress: ()=>{}},
  ]

  switch(state){
    case 'daily':
      items = items.map( item => ({...item, state: 'pressed-disabled'}))
      break
    case 'weekly':
      items = items.map( item => ({...item, state: 'dashed-disabled'}))
      break
    case 'select':
      items = items.map( item => ({
        ...item, 
        state: weekDays[item.id]?'pressed':'regular',
        onPress: () => {
          setWeekDays({...weekDays, [item.id]: !weekDays[item.id]})
          setWeekDaysError(false)
        }
      }))
  }  

  return(
    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 8}}>
      { items.map( item => <WeekdaySelectorItem { ...item } />) }
    </View>
  )
}

const WeekdaySelectorItem = ({ label, state, onPress }) => {
  let squareColor = 'transparent', 
      dashColor = 'transparent', 
      textColor = 'black'
  
  switch(state){
    case 'regular': 
      break
    case 'pressed':
      squareColor = '#7B61FF'
      textColor = 'white'
      break
    case 'disabled':
      textColor = 'grey'
      break
    case 'pressed-disabled':
      squareColor = '#CAC4D4'
      textColor = 'white'
      break
    case 'dashed':
      textColor = 'white'
      dashColor = '#7B61FF'
      break
    case 'dashed-disabled':
      dashColor = '#CAC4D4'
      textColor = 'white'
      break
  }
  
  return(
    <View style={{  
      backgroundColor: dashColor,
      flex: 1,
      aspectRatio: 1.3,
      alignItems: 'center',
      justifyContent: 'center'}}>
      <Pressable onPressIn={onPress}>
        <View style={{
          flex: 1,
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: squareColor,
        }}>
          <Subheading style={{color: textColor}}>{label}</Subheading>
        </View>
      </Pressable>
    </View>
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
