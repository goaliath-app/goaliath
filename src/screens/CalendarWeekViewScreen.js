import React from 'react';
import { useSelector } from 'react-redux';
import { 
  selectActivityByIdAndDate, selectAllActiveActivitiesByDate, selectAllActiveGoalsByDate, selectGoalByIdAndDate, selectAllActiveActivitiesByGoalIdAndDate 
} from '../redux'
import { ScrollView, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import { CalendarWeekItem, Checkbox, Header } from '../components';
import { getWeekProgressString, getWeekActivityCompletionRatio, getWeekCompletionRatio } from '../activityHandler';
import { useTranslation } from 'react-i18next';


const ActivityWeekView = ({ activityId, date }) => {
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const { t, i18n } = useTranslation()
  const WeekProgress = useSelector((state) => getWeekProgressString(state, activityId, date, t))

  return(
    <View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{fontWeight: 'bold' }}>{activity.name}</Text>
        <Text>{WeekProgress}</Text>
      </View>
      <CalendarWeekItem activityId={activityId} date={date} showDayNumbers={false} showWeekProgress={true} />
    </View>
  )
}

const GoalWeekView = ({ goalId, date }) => {
  const goal = useSelector((state) => selectGoalByIdAndDate(state, goalId, date))
  const goalActivities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, goalId, date))

  const state = useSelector(state => state)

  const activityCompletionRatios = {}
  goalActivities.forEach(activity => {
    activityCompletionRatios[activity.id] = getWeekActivityCompletionRatio(state, activity.id, date)
  })

  goalActivities.sort((a, b) => activityCompletionRatios[b.id] - activityCompletionRatios[a.id])
  
  return (
    <View>
      <List.Accordion title={goal.name}>
        {goalActivities.map(activity => <ActivityWeekView activityId={activity.id} date={date} />)}
      </List.Accordion>
    </View>
  )
}

const CalendarWeekViewScreen = ({ navigation, route }) => {
  const date = route.params.date.endOf("week")

  const activities = useSelector((state) => selectAllActiveActivitiesByDate(state, date))
  const state = useSelector(state => state)

  const activityCompletionRatios = {}
  activities.forEach(activity => {
    activityCompletionRatios[activity.id] = getWeekActivityCompletionRatio(state, activity.id, date)
  })

  activities.sort((a, b) => activityCompletionRatios[b.id] - activityCompletionRatios[a.id])

  const goals = useSelector((state) => selectAllActiveGoalsByDate(state, date))

  const goalsCompletionRatios = {}
  goals.forEach(goal => {
    goalsCompletionRatios[goal.id] = getWeekCompletionRatio(state, date, goal.id)
  })

  goals.sort((a, b) => goalsCompletionRatios[b.id] - goalsCompletionRatios[a.id])

  const [ activeGoalCheckbox, setActiveGoalCheckbox] = React.useState(true)
  const [ activeActivityCheckbox, setActiveActivityCheckbox] = React.useState(false)

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
          {/*Sort by goal*/}
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
          {/*Sort by activity*/}
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

        {/*GoalWeekView*/}
        {activeGoalCheckbox?
          goals.map((goal) => <GoalWeekView goalId={goal.id} date={date} />)
          : null}

        {/*ActivityWeekView*/}
        {activeActivityCheckbox? 
          <View>
            {activities.map(activity => <ActivityWeekView activityId={activity.id} date={date} />)}
          </View>
          : <></>}
      </ScrollView>
    </View>
  )
}

export default CalendarWeekViewScreen;
