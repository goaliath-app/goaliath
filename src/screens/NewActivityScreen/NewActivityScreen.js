import React from 'react';
import { View, StyleSheet, TextInput as ReactTextInput, FlatList } from 'react-native';
import { Title, Appbar, Text, TextInput, Button, List, Checkbox } from 'react-native-paper';
import { Header, TimeInput } from '../../components';


const GoalScreen = ({ navigation }) => {
  const [name, setName] = React.useState('');
  const [repeatMode, setRepeatMode] = React.useState();  // 'daily', 'select' or 'weekly'
  const [goal, setGoal] = React.useState();  // 'time' or 'check'
  const [seconds, setSeconds] = React.useState('');
  const [minutes, setMinutes] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [weekDays, setWeekDays] = React.useState({
    'Monday': false, 'Tuesday': false, 'Wednesday': false, 'Thursday': false, 
    'Friday': false, 'Saturday': false, 'Sunday': false
  })
  const [timesPerWeek, setTimesPerWeek] = React.useState(0)

  const headerButtons = (
    <Appbar.Action icon='check' onPress={() => navigation.navigate('Goal')} />
  )

  return(
    <View>
      <Header title='New Activity' left='back' navigation={navigation} buttons={headerButtons}/>
      <TextInput label="Activity Name" value={name} onChangeText={name => setName(name)} />
      <ActivityTypeSelector repeatMode={repeatMode} setRepeatMode={setRepeatMode}/>
      {repeatMode=='select'?
        <WeekdaySelector weekDays={weekDays} setWeekDays={setWeekDays}/>
      : <></>}
      {repeatMode=='daily' || repeatMode=='select'?
        <TimeGoal 
          goal={goal} setGoal={setGoal}
          hours={hours} setHours={setHours}
          minutes={minutes} setMinutes={setMinutes}
          seconds={seconds} setSeconds={setSeconds}
        />
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
    goal, setGoal, hours, setHours, minutes, setMinutes, seconds, setSeconds 
  }) => {
  return (
    <>
    <List.Item 
      title='Time dedication goal' 
      right={()=>(
        <Checkbox
          status={goal=='time' ? 'checked' : 'unchecked'}
          onPress={() => {setGoal(goal!=='time'?'time':'')}}
        />
      )}
    />
    
    </>
  )
}

const WeekdaySelector = ({ weekDays, setWeekDays }) => (
  <View style={styles.weekdaySelectorView}>
    <WeekdaySelectorItem day='Monday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Tuesday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Wednesday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Thursday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Friday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Saturday' weekDays={weekDays} setWeekDays={setWeekDays}/>
    <WeekdaySelectorItem day='Sunday' weekDays={weekDays} setWeekDays={setWeekDays}/>
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

export default GoalScreen;
