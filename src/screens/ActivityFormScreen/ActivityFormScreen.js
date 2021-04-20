import React from 'react';
import { connect } from 'react-redux'
import { View, StyleSheet, Alert } from 'react-native';
import { Subheading, Appbar, Text, TextInput, Button, List, Checkbox } from 'react-native-paper';
import { Header, TimeInput } from '../../components';
import { createActivity, updateActivity, selectActivityById } from '../../redux'
import { useTranslation } from 'react-i18next'


const ActivityFormScreen = ({ navigation, createActivity, updateActivity, goalId=null, activity=null }) => {
  if(activity){
    goalId = activity.goalId
  }

  const { t, i18n } = useTranslation()
  
  const [name, setName] = React.useState(activity?.name?activity.name:'');
  const [repeatMode, setRepeatMode] = React.useState(activity?.repeatMode?activity.repeatMode:null);  // 'daily', 'select' or 'weekly'
  const [goal, setGoal] = React.useState(activity?.goal?activity.goal:'check');  // 'time' or 'check'
  const [seconds, setSeconds] = React.useState(activity?.timeGoal?(activity.timeGoal%60).toString():'');
  const [minutes, setMinutes] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal%3600)/60)).toString():'');
  const [hours, setHours] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal/3600))).toString():'');
  const [weekDays, setWeekDays] = React.useState(activity?.weekDays?activity.weekDays:{
    '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false
  })
  const [timesPerWeek, setTimesPerWeek] = React.useState(activity?.timesPerWeek?String(activity.timesPerWeek):'1')

  const validate = ( newActivity ) => {
    const { name, repeatMode, goal, goalId, timeGoal, weekDays } = newActivity
    if(!name || !repeatMode || !goal || !goalId){
      Alert.alert(t('activityForm.alerts.multipleMissing'))
      return false
    }
    if(goal == 'time' && !timeGoal){
      Alert.alert(t('activityForm.alerts.noTimeGoal'))
      return false
    }
    if(repeatMode == 'select'){
      for(let day in weekDays){
        if (weekDays[day] == true){ return true }
      }
      Alert.alert(t('activityForm.alerts.noSelectDays'))
      return false
    }
    if(repeatMode == 'weekly' && goal == 'check'){
      if(!timesPerWeek){
        Alert.alert(t('activityForm.alerts.noWeekCheck'))
        return false
      }
    }
    return true
  }

  const headerButtons = (
    <Appbar.Action icon='check' onPress={() => {
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
    <View>
      <Header 
        title={activity?.name?activity.name:t('activityForm.headerTitle')} 
        left='back' navigation={navigation} 
        buttons={headerButtons}
      />
      <TextInput 
        style={styles.textInput} 
        mode= 'outlined' 
        label={t('activityForm.activity.nameTextInput')} 
        value={name} 
        onChangeText={name => setName(name)} 
      />
      <ActivityTypeSelector repeatMode={repeatMode} setRepeatMode={setRepeatMode} t={t} />
      {repeatMode=='select'?
        <WeekdaySelector weekDays={weekDays} setWeekDays={setWeekDays} t={t} />
      : <></>}
      {repeatMode=='daily' || repeatMode=='select'?
        <TimeGoal goal={goal} setGoal={setGoal} t={t} />
      : <></> }
      {repeatMode=='weekly'?
        <>
        <Subheading style={styles.subheading}>{t('activityForm.activity.weeklyGoal')}</Subheading>
        <WeeklyGoalSelector goal={goal} setGoal={setGoal} t={t} />
        </>
      : <></> }
      {goal=='time' && repeatMode == 'weekly'?
      <>
        <Subheading style={styles.subheading}>{t('activityForm.activity.weeklyTimeGoal')}</Subheading>
        <TimeInput
          hours={hours} setHours={setHours} 
          minutes={minutes} setMinutes={setMinutes} 
          seconds={seconds} setSeconds={setSeconds}
        />
      </>
      : <></> }
      {goal=='time' && repeatMode != 'weekly'?
        <TimeInput
          hours={hours} setHours={setHours} 
          minutes={minutes} setMinutes={setMinutes} 
          seconds={seconds} setSeconds={setSeconds}
        />
      : <></> }
      {goal=='check' && repeatMode == 'weekly'?
        <NumberOfWeeklyDaysInput timesPerWeek={timesPerWeek} setTimesPerWeek={setTimesPerWeek} t={t}/>
      : <></> }
    </View>
  )
}

const ButtonSwitchBar = ({ options, state, setState }) => (
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

const NumberOfWeeklyDaysInput = ({ timesPerWeek, setTimesPerWeek, t }) => (
  <View>
    <Subheading style={styles.subheading}>{t('activityForm.activity.weeklyDaysGoal')}</Subheading>
    <TextInput style={styles.numberInput} value={timesPerWeek} onChangeText={setTimesPerWeek}  keyboardType='numeric' />
  </View>
)

const WeeklyGoalSelector = ( {goal, setGoal, t }) => (
    <ButtonSwitchBar
      options={[
        {label: t('activityForm.activity.weeklyDays'), value: 'check'},
        {label: t('activityForm.activity.weeklyTime'), value: 'time'}
      ]} 
      state={goal} setState={setGoal} />
  )


const ActivityTypeSelector = ({ repeatMode, setRepeatMode, t }) => (
    <>
      <Subheading style={styles.subheading}>{t('activityForm.activity.repeat')}</Subheading>
      <ButtonSwitchBar
        options={[
          {label: t('activityForm.activity.repeatDaily'), value: 'daily'},
          {label: t('activityForm.activity.repeatSelect'), value: 'select'},
          {label: t('activityForm.activity.repeatWeekly'), value: 'weekly'},
        ]}
        state={repeatMode} setState={setRepeatMode}
      />
      <PeriodDescription repeatMode={repeatMode} t={t} />
    </>
  )


const PeriodDescription = ({ repeatMode, t }) => {
  let out = <></>

  switch(repeatMode) {
    case 'daily':
      out = (
        <Text style={styles.infoText}>{t('activityForm.activity.repeatDailyDescription')}</Text>
      );
      break;
    case 'select':
      out = <Text style={styles.infoText}>{t('activityForm.activity.repeatSelectDescription')}</Text>;
      break;
    case 'weekly':
      out = <Text style={styles.infoText}>{t('activityForm.activity.repeatWeeklyDescription')}</Text>
      break;
  }
  
  return (
    out
  )
}

const TimeGoal = ({ goal, setGoal, t }) => (
    <>
      <List.Item 
        title={t('activityForm.activity.timeGoal')}
        right={()=>(
          <Checkbox
            status={goal=='time' ? 'checked' : 'unchecked'}
            onPress={() => {setGoal(goal!=='time'?'time':'check')}}
          />
        )}
      />
    </>
  )


const WeekdaySelector = ({ weekDays, setWeekDays, t }) => (
  <View style={styles.weekdaySelectorView}>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.monday')} day='1' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.tuesday')} day='2' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.wednesday')} day='3' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.thursday')} day='4' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.friday')} day='5' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.saturday')} day='6' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem label={t('units.dayNamesInitials.sunday')} day='7' weekDays={weekDays} setWeekDays={setWeekDays}/>
  </View>
)

const WeekdaySelectorItem = ({ label, day, weekDays, setWeekDays }) => (
  <View style={styles.weekdaySelectorItem}>
    <Checkbox 
      status={weekDays[day]?'checked':'unchecked'}
      onPress={() => {
        setWeekDays(Object.assign({}, weekDays, {[day]: !weekDays[day]}))
      }}
    />
    <Text style={{marginLeft: 10}}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  icon: {
    margin: 'auto',
    color: 'white',
  },
  repeatOptionsView: {
    flexDirection: 'row',
  },
  weekdaySelectorView: {
    flexDirection: 'row',
  },
  weeklyGoalSelectorView: {
    flexDirection: 'row',
  },
  buttonSwitchBarView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  weekdaySelectorItem: {
    flex: 1,
  },
  infoText: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  textInput:{
    padding: 15,
    fontSize: 16,
    height: 55,
  },
  numberInput:{
    marginLeft: 20,
    marginRight: 20, 
    fontSize: 40,
    padding: 5,
    textAlign: 'center'
  },
  subheading:{
    marginLeft: 16,
    paddingBottom: 10
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
