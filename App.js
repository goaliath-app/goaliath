import 'react-native-gesture-handler';  // this import needs to be at the top.
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { DateTime } from 'luxon'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { 
  TodayScreen, WeekScreen, ActivityDetailScreen, GoalsScreen, GoalScreen, ActivityFormScreen,
  GoalFormScreen, CalendarScreen, SettingsScreen, DayInCalendarScreen
} from './src/screens'
import { store, generateDummyData, updateLogs } from './src/redux'

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const persistor = persistStore(store)

const TodayStack = () => (
  <Stack.Navigator initialRouteName='Today' headerMode='none'>
    <Stack.Screen name='Today' component={TodayScreen} options={{headerTitle: 'Today'}} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}} />
    <Stack.Screen name='ActivityForm' component={ActivityFormScreen} />
  </Stack.Navigator>
)

const WeekStack = () => (
  <Stack.Navigator initialRouteName='Week' headerMode='none'>
    <Stack.Screen name='Week' component={WeekScreen} options={{headerTitle: 'Week'}} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}} />
    <Stack.Screen name='ActivityForm' component={ActivityFormScreen} />
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

const CalendarStack = () => (
  <Stack.Navigator initialRouteName='Calendar' headerMode='none' >
    <Stack.Screen name='Calendar' component={CalendarScreen} />
    <Stack.Screen name='DayInCalendar' component={DayInCalendarScreen} />
  </Stack.Navigator>
)

export default function App() {
  useEffect(() => {
    // store.dispatch(generateDummyData())
    store.dispatch(updateLogs())
  })

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <NavigationContainer>
            <Drawer.Navigator initialRouteName='Today'>
              <Drawer.Screen name='Today' component={TodayStack} />
              <Drawer.Screen name='Week' component={WeekStack} />
              <Drawer.Screen name='Goals' component={GoalsStack} />
              <Drawer.Screen name='Calendar' component={CalendarStack} />
              <Drawer.Screen name='Settings' component={SettingsScreen} />
            </Drawer.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
