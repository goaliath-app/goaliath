import 'react-native-gesture-handler';  // this import needs to be at the top.
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { DateTime } from 'luxon'
import { 
  TodayScreen, WeekScreen, ActivityDetailScreen, GoalsScreen, GoalScreen, ActivityFormScreen,
  GoalFormScreen
} from './src/screens'
import { store, selectAllActivities, selectDailyLogById, selectGoalById, createDailyLog, addEntry, createGoal, createActivity, selectTodayLogs } from './src/redux'

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const TodayStack = () => (
  <Stack.Navigator initialRouteName='Today' headerMode='none'>
    <Stack.Screen name='Today' component={TodayScreen} options={{headerTitle: 'Today'}} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}} />
  </Stack.Navigator>
)

const WeekStack = () => (
  <Stack.Navigator initialRouteName='Week' headerMode='none'>
    <Stack.Screen name='Week' component={WeekScreen} options={{headerTitle: 'Week'}} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}} />
  </Stack.Navigator>
)

const GoalsStack = () => (
  <Stack.Navigator initialRouteName='Goals' headerMode='none' >
    <Stack.Screen name='Goals' component={GoalsScreen} options={{headerTitle: 'Goals'}} />
    <Stack.Screen name='Goal' component={GoalScreen} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} />
    <Stack.Screen name='ActivityForm' component={ActivityFormScreen} />
    <Stack.Screen name='GoalForm' component={GoalFormScreen} />
  </Stack.Navigator>
)

function generateDummyData(store){
  store.dispatch(createGoal({name: 'dummy goal'}))
  store.dispatch(createActivity({name: 'dummy activity', goalId: '0', goal: 'check', repeatMode: 'daily'}))
  store.dispatch(createActivity({name: 'dummy activity2', goalId: '0', goal: 'check', repeatMode: 'daily'}))
}

function newEntry(activity){
  return(
    {
      intervals: [], 
      completed: false, 
      goal: activity.goal, 
      timeGoal: activity.timeGoal,
      id: activity.id 
    }
  )
}

function generateLogs(store){
  const state = store.getState()
  const today = DateTime.now()
  if(selectDailyLogById(state, today)){ return }  // today's log is already generated

  store.dispatch(createDailyLog({date: today}))

  for(let activity of selectAllActivities(state)){
    const goal = selectGoalById(state, activity.goalId)
    if(!goal.active || !activity.active || activity.repeatMode == 'weekly'){ continue }
    switch(activity.repeatMode){
      case 'daily':
        const entry = newEntry(activity)
        store.dispatch(addEntry({date: today, entry}))
        break
      case 'weekly':
        if(activity.weekDays[today.weekday]){
          const entry = newEntry(activity)
          store.dispatch(addEntry({date: today, entry}))
        }
        break
    }
  }
}

export default function App() {
  useEffect(() => {
    generateDummyData(store)
    generateLogs(store)
  })

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Drawer.Navigator initialRouteName='Today'>
            <Drawer.Screen name='Today' component={TodayStack} />
            <Drawer.Screen name='Week' component={WeekStack} />
            <Drawer.Screen name='Goals' component={GoalsStack} />
          </Drawer.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}
