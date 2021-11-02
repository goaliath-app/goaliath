import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Checkbox, Header } from '../components';
import { CalendarWeekItem } from '../components';

const CalendarWeekViewScreen = ({ navigation, route }) => {
  const { date } = route.params

  const [ activeGoalCheckbox, setActiveGoalCheckbox] = React.useState(true)
  const [ activeActivityCheckbox, setActiveActivityCheckbox] = React.useState(false)
  const [ activeMoreCompletionCheckbox, setActiveMoreCompletionCheckbox] = React.useState(false)
  const [ activeLessCompletionCheckbox, setActiveLessCompletionCheckbox] = React.useState(false)

  return(
    <View>
      <Header title={'Week View'} left='back' navigation={navigation} />
      <ScrollView >
        {/*WeekViewComponent*/}
        <View style={{paddingVertical: 15, paddingHorizontal: 30}}>
          <CalendarWeekItem date={date} showDayNumbers={false} />
        </View>

        {/*Options selectors*/}
        <View style={{flexDirection:'row', justifyContent: 'space-around'}}>
          {/*Type options*/}
          <View>
            <View style={{flexDirection:'row', alignItems: 'center'}}>
              <Checkbox status={activeGoalCheckbox? 'checked' : 'unchecked'} 
                onPress={() => {
                  if(!activeGoalCheckbox && activeActivityCheckbox){
                    setActiveActivityCheckbox(!activeActivityCheckbox)
                  } else if(activeGoalCheckbox && !activeActivityCheckbox){
                  setActiveActivityCheckbox(!activeActivityCheckbox)
                  }
                  setActiveGoalCheckbox(!activeGoalCheckbox)}
                } />
              <Text>Sort by goal</Text>
            </View>
            <View style={{flexDirection:'row', alignItems: 'center'}}>
              <Checkbox status={activeActivityCheckbox? 'checked' : 'unchecked'} 
                onPress={() => {
                  if(!activeActivityCheckbox && activeGoalCheckbox){
                    setActiveGoalCheckbox(!activeGoalCheckbox)
                  } else if(activeActivityCheckbox && !activeGoalCheckbox){
                    setActiveGoalCheckbox(!activeGoalCheckbox)
                  }
                  setActiveActivityCheckbox(!activeActivityCheckbox)}
                } />
              <Text>Sort by activity</Text>
            </View>
          </View>
          {/*Completion options*/}
          <View>
            <View style={{flexDirection:'row', alignItems: 'center'}}>
              <Checkbox status={activeMoreCompletionCheckbox? 'checked' : 'unchecked'}
                onPress={() => {
                  if(!activeMoreCompletionCheckbox && activeLessCompletionCheckbox){
                    setActiveLessCompletionCheckbox(false)
                  }
                  setActiveMoreCompletionCheckbox(!activeMoreCompletionCheckbox)
                }} />
              <Text>Sort by more completion</Text>
            </View>
            <View style={{flexDirection:'row', alignItems: 'center'}}>
              <Checkbox status={activeLessCompletionCheckbox? 'checked' : 'unchecked'} 
                onPress={() => {
                  if(!activeLessCompletionCheckbox && activeMoreCompletionCheckbox){
                    setActiveMoreCompletionCheckbox(false)
                  }
                  setActiveLessCompletionCheckbox(!activeLessCompletionCheckbox)}
                } />
              <Text>Sort by less completion</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

export default CalendarWeekViewScreen;
