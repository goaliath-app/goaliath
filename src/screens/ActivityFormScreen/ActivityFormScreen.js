import React from 'react';
import { connect } from 'react-redux'
import { View, StyleSheet, Alert } from 'react-native';
import { Title, Appbar, Text, TextInput, Button, List, Checkbox } from 'react-native-paper';
import { Header, TimeInput } from '../../components';
import { createActivity, updateActivity, selectActivityById } from '../../redux'


const ActivityFormScreen = ({ navigation, createActivity, updateActivity, goalId=null, activity=null }) => {
  if(activity){
    goalId = activity.goalId
  }
  
  const [name, setName] = React.useState(activity?.name?activity.name:'');
  const [repeatMode, setRepeatMode] = React.useState(activity?.repeatMode?activity.repeatMode:null);  // 'daily', 'select' or 'weekly'
  const [goal, setGoal] = React.useState(activity?.goal?activity.goal:'check');  // 'time' or 'check'
  const [seconds, setSeconds] = React.useState(activity?.timeGoal?(activity.timeGoal%60).toString():'');
  const [minutes, setMinutes] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal%3600)/60)).toString():'');
  const [hours, setHours] = React.useState(activity?.timeGoal?(Math.floor((activity.timeGoal/3600))).toString():'');
  const [weekDays, setWeekDays] = React.useState(activity?.weekDays?activity.weekDays:{
    '1': false, '2': false, '3': false, '4': false, '5': false, '6': false, '7': false
  })
  const [timesPerWeek, setTimesPerWeek] = React.useState(activity?.timesPerWeek?activity.timesPerWeek:'1')

  const validate = ( newActivity ) => {
    const { name, repeatMode, goal, goalId, timeGoal, weekDays } = newActivity
    if(!name || !repeatMode || !goal || !goalId){
      Alert.alert('Missing name, repeatMode, goal or goalId')
      return false
    }
    if(goal == 'time' && !timeGoal){
      Alert.alert('Please enter a time')
      return false
    }
    if(repeatMode == 'select'){
      for(let day in weekDays){
        if (weekDays[day] == true){ return true }
      }
      Alert.alert('Please select at least one day')
      return false
    }
    if(repeatMode == 'weekly' && goal == 'check'){
      if(!timesPerWeek){
        Alert.alert('Please enter number of days per week')
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
          name, repeatMode, goal, timeGoal, 
          weekDays, timesPerWeek: Number.parseInt(timesPerWeek), goalId: goalId }
        if(validate(newActivity)){
          if(activity){
            console.log('trying to update activity with: ')
            console.log({...newActivity, id: activity.id})
            updateActivity({...newActivity, id: activity.id})
          }else{
            createActivity(newActivity)
          }
          navigation.navigate('Goal')
        }
      }} 
    /> 
  )

  return(
    <View>
      <Header title={activity?.name?activity.name:'New Activity'} left='back' navigation={navigation} buttons={headerButtons}/>
      <TextInput label="Activity Name" value={name} onChangeText={name => setName(name)} />
      <ActivityTypeSelector repeatMode={repeatMode} setRepeatMode={setRepeatMode}/>
      {repeatMode=='select'?
        <WeekdaySelector weekDays={weekDays} setWeekDays={setWeekDays}/>
      : <></>}
      {repeatMode=='daily' || repeatMode=='select'?
        <TimeGoal goal={goal} setGoal={setGoal} />
      : <></> }
      {repeatMode=='weekly'?
        <>
        <Title>Goal</Title>
        <WeeklyGoalSelector goal={goal} setGoal={setGoal} />
        </>
      : <></> }
      {goal=='time'?
      <TimeInput 
        hours={hours} setHours={setHours} 
        minutes={minutes} setMinutes={setMinutes} 
        seconds={seconds} setSeconds={setSeconds}
      />
      : <></> }
      {goal=='check' && repeatMode == 'weekly'?
        <NumberOfWeeklyDaysInput timesPerWeek={timesPerWeek} setTimesPerWeek={setTimesPerWeek} />
      : <></> }
    </View>
  )
}

const ButtonSwitchBar = ({ options, state, setState }) => (
  <View style={styles.buttonSwitchBarView}>
    {options.map((option) => (
      <Button 
        mode={state==option.value? 'contained':'text'} 
        style={styles.repeatOptionsButton}
        onPress={()=>setState(option.value)}>
          {option.label}
      </Button>
    ))}
  </View>
)

const NumberOfWeeklyDaysInput = ({ timesPerWeek, setTimesPerWeek }) => (
  <View style={{flexDirection: 'row'}}>
    <Text style={{flex: 2}}>How many days per week?</Text>
    <TextInput value={timesPerWeek} onChangeText={setTimesPerWeek} style={{flex: 1}} />
  </View>
)

const WeeklyGoalSelector = ( {goal, setGoal }) => (
  <ButtonSwitchBar 
    options={[
      {label: 'complete', value: 'check'},
      {label: 'dedicate time', value: 'time'}
    ]} 
    state={goal} setState={setGoal} />
)

const ActivityTypeSelector = ({ repeatMode, setRepeatMode }) => (
  <>
    <Title>Repeat</Title>
    <ButtonSwitchBar
      options={[
        {label: 'daily', value: 'daily'},
        {label: 'select days', value: 'select'},
        {label: 'weekly', value: 'weekly'},
      ]}
      state={repeatMode} setState={setRepeatMode}
    />
    <PeriodDescription repeatMode={repeatMode} />
  </>
)

const PeriodDescription = ({ repeatMode }) => {
  let out = <></>

  switch(repeatMode) {
    case 'daily':
      out = (
        <Text>You will do the activity every day.</Text>
      );
      break;
    case 'select':
      out = <Text>You will do the activity these days.</Text>;
      break;
    case 'weekly':
      out = <Text>You can do the activity any day of the week.</Text>
      break;
  }
  
  return (
    out
  )
}

const TimeGoal = ({ 
    goal, setGoal
  }) => {
  return (
    <>
    <List.Item 
      title='Time dedication goal' 
      right={()=>(
        <Checkbox
          status={goal=='time' ? 'checked' : 'unchecked'}
          onPress={() => {setGoal(goal!=='time'?'time':'check')}}
        />
      )}
    />
    
    </>
  )
}

const WeekdaySelector = ({ weekDays, setWeekDays }) => (
  <View style={styles.weekdaySelectorView}>
    <WeekdaySelectorItem day='1' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='2' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='3' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='4' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='5' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='6' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='7' weekDays={weekDays} setWeekDays={setWeekDays}/>
  </View>
)

const WeekdaySelectorItem = ({ day, weekDays, setWeekDays }) => (
  <View style={styles.weekdaySelectorItem}>
    <Checkbox 
      status={weekDays[day]?'checked':'unchecked'}
      onPress={() => {
        setWeekDays(Object.assign({}, weekDays, {[day]: !weekDays[day]}))
      }}
    />
    <Text>{day.substring(0,2)}</Text>
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
  },
  buttonSwitchBarItem: {
    flex:1,
  },
  weekdaySelectorItem: {
    flex: 1,
  },
  repeatOptionsButton: {
    flex: 1,
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
