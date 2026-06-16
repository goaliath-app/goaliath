import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectActivityByIdAndDate, selectAllActiveActivitiesByDate,
  selectAllActiveGoalsByDate, selectGoalByIdAndDate,
  selectAllActiveActivitiesByGoalIdAndDate
} from '../redux'
import { ScrollView, View } from 'react-native';
import { List, Text, withTheme } from 'react-native-paper';
import { CalendarWeekItem, Checkbox, Header } from '../components';
import {
  getWeekProgressString, getWeekActivityCompletionRatio,
  getGoalWeekCompletionRatio
} from '../activityHandler';
import { useTranslation } from 'react-i18next';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useNavigation } from '@react-navigation/native';
import { serializeDate, deserializeDate } from '../time';

//TODO: Fix frequency traduction.
      //Fix activity name and activity frequency to show both
const ActivityWeekView = ({ activityId, date }) => {
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const { t, i18n } = useTranslation()
  const WeekProgress = useSelector((state) => getWeekProgressString(state, activityId, date, t))

  const navigation = useNavigation()

  return(
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10 }}>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>{activity.name}</Text>
        <Text style={{paddingLeft: 10}}>{WeekProgress}</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <CalendarWeekItem  
          activityId={activityId} date={date} showDayNumbers={false} 
          showWeekProgress={true} softTodayHighlight={true} 
          onDayPress={dayDate => navigation.navigate('CalendarDayView', {date: serializeDate(dayDate)})}
          animate='day' />
      </View>
    </View>
  )
}

const GoalWeekView = ({ theme, goalId, date }) => {
  const goal = useSelector((state) => selectGoalByIdAndDate(state, goalId, date))
  const goalActivities = useSelector((state) => selectAllActiveActivitiesByGoalIdAndDate(state, goalId, date))

  const state = useSelector(state => state)

  const activityCompletionRatios = {}
  goalActivities.forEach(activity => {
    activityCompletionRatios[activity.id] = getWeekActivityCompletionRatio(state, activity.id, date)
  })

  goalActivities.sort((a, b) => activityCompletionRatios[b.id] - activityCompletionRatios[a.id])

  const goalCompletionRatio = useSelector(state => getGoalWeekCompletionRatio(state, date, goalId))
  
  return (
    <View>
      <List.Accordion title={goal.name} 
        titleNumberOfLines={2}
        style={{ backgroundColor: theme.colors.goalWeekViewBackground, borderBottomWidth: 0.2, borderBottomColor: '#CCCCCC', borderTopWidth: 0.2, borderTopColor: '#CCCCCC',paddingLeft: 10 }} 
        left={() => (
          <AnimatedCircularProgress
            size={25}
            width={5}
            fill={goalCompletionRatio * 100}
            tintColor={theme.colors.weekViewGoalCircularProgress}
            backgroundColor={theme.colors.weekViewGoalCircularProgressBackground} />
      )}>
        {goalActivities.map(activity => <ActivityWeekView activityId={activity.id} date={date} />)}
      </List.Accordion>
    </View>
  )
}

function headerTitle(date, t){
  const weekStart = date.startOf("week")
  const weekEnd = date.endOf("week")

  return t('calendar.weekView.header', {weekStartDate: dayLabel(weekStart, t), weekEndDate: dayLabel(weekEnd, t), year: date.toFormat('yyyy') })
}

function dayLabel(date, t){
  return date.toFormat("d") + ' ' + t('units.monthNamesShort.' + date.toFormat('LLLL').toLowerCase())
}

const CalendarWeekViewScreen = withTheme(({ route, theme }) => {
  const { t, i18n } = useTranslation()

  const date = deserializeDate(route.params.date).endOf("week")

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
    goalsCompletionRatios[goal.id] = getGoalWeekCompletionRatio(state, date, goal.id)
  })

  goals.sort((a, b) => goalsCompletionRatios[b.id] - goalsCompletionRatios[a.id])

  const [ activeGoalCheckbox, setActiveGoalCheckbox] = React.useState(true)
  const [ activeActivityCheckbox, setActiveActivityCheckbox] = React.useState(false)

  const navigation = useNavigation()

  return(
    <View style={{ backgroundColor: theme.colors.calendarWeekViewScreenBackground, flex: 1 }}>
      <Header title={headerTitle(date, t)} left='back' navigation={navigation} />
      <ScrollView >
        {/*WeekViewComponent*/}
        <View style={{ paddingVertical: 15, paddingHorizontal: 20 }}>
          <CalendarWeekItem animate='day' date={date} showDayNumbers={true} onDayPress={dayDate => navigation.navigate('CalendarDayView', {date: serializeDate(dayDate)})}/>
        </View>

        {/*Options selectors*/}
        <View style={{ flexDirection:'row', justifyContent: 'space-evenly', paddingBottom: 10 }}>
          {/*Sort by goal*/}
          <View style={{flexDirection:'row', alignItems: 'center' }}>
            <Checkbox status={activeGoalCheckbox? 'checked' : 'unchecked'} 
              onPress={() => {
                if(!activeGoalCheckbox && activeActivityCheckbox){
                  setActiveActivityCheckbox(!activeActivityCheckbox)
                } else if(activeGoalCheckbox && !activeActivityCheckbox){
                setActiveActivityCheckbox(!activeActivityCheckbox)
                }
                setActiveGoalCheckbox(!activeGoalCheckbox)}
              } />
            <Text style={{ paddingRight: 10 }}>{t('calendar.weekView.sortByGoal')}</Text>
          </View>
          {/*Sort by activity*/}
          <View style={{ flexDirection:'row', alignItems: 'center' }}>
            <Checkbox status={activeActivityCheckbox? 'checked' : 'unchecked'} 
              onPress={() => {
                if(!activeActivityCheckbox && activeGoalCheckbox){
                  setActiveGoalCheckbox(!activeGoalCheckbox)
                } else if(activeActivityCheckbox && !activeGoalCheckbox){
                  setActiveGoalCheckbox(!activeGoalCheckbox)
                }
                setActiveActivityCheckbox(!activeActivityCheckbox)}
              } />
            <Text style={{ paddingRight: 10 }}>{t('calendar.weekView.sortByActivity')}</Text>
          </View>
        </View>

        {/*GoalWeekView*/}
        {activeGoalCheckbox?
          goals.map((goal) => <GoalWeekView goalId={goal.id} date={date} theme={theme} />)
          : null}

        {/*ActivityWeekView*/}
        {activeActivityCheckbox? 
          activities.map(activity => <ActivityWeekView activityId={activity.id} date={date} />)
          : <></>}
          
        <View style={{ height: 100 }}/>
      </ScrollView>
    </View>
  )
})

export default CalendarWeekViewScreen;
