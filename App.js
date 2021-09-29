import 'react-native-gesture-handler';  // this import needs to be at the top.
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { StatusBar } from 'expo-status-bar'
import i18n from './src/i18n'
import { useTranslation } from 'react-i18next'
import { store, finishOnboarding as finishOnboardingAction } from './src/redux'
import { 
  TodayScreen, ActivityDetailScreen, GoalsScreen, GoalScreen, 
  ActivityFormScreen, GoalFormScreen, CalendarScreen, SettingsScreen, 
  DayInCalendarScreen, OnboardingScreen, SelectWeeklyActivitiesScreen,
  AddTasksScreen
} from './src/screens'
import { Drawer as CustomDrawer } from './src/components'
import { StatusBarColor } from './src/styles/Colors';
import { generateDummyData } from './src/redux/Thunks'

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const persistor = persistStore(store)
// persistor.purge()

const TodayStack = () => (
  <Stack.Navigator initialRouteName='Today' headerMode='none'>
    <Stack.Screen name='Today' component={TodayScreen} />
    <Stack.Screen name='AddTasks' component={AddTasksScreen} />
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} />
    <Stack.Screen name='ActivityForm' component={ActivityFormScreen} />
    <Stack.Screen name='SelectWeeklyActivities' component={SelectWeeklyActivitiesScreen} />
  </Stack.Navigator>
)

const GoalsStack = () => (
  <Stack.Navigator initialRouteName='Goals' headerMode='none' >
    <Stack.Screen name='Goals' component={GoalsScreen} />
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
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} />
  </Stack.Navigator>
)

export default function App() {
  // React.useEffect(() => {
  //   store.dispatch(generateDummyData())
  // }, [])

  const [newUser, setNewUser] = React.useState()

  function finishOnboarding(){
    store.dispatch(finishOnboardingAction())
    setNewUser(false)
  }

  function onStoreRehydration(){
    setNewUser(store.getState().settings.newUser)
    i18n.changeLanguage(store.getState().settings.language)
  }

  const { t, i18 } = useTranslation()

  return (
    <ReduxProvider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor} 
        onBeforeLift={()=>onStoreRehydration()}
      >
        <PaperProvider>
          <NavigationContainer>
            <StatusBar 
              style={StatusBarColor.style} 
              translucent={false} 
              backgroundColor={StatusBarColor.backgroundColor}
            />
            {newUser?
            <OnboardingScreen finishOnboarding={finishOnboarding} />
            : 
            <Drawer.Navigator 
              initialRouteName='Today' 
              drawerContent={(props) => <CustomDrawer {...props} />}
            >
              <Drawer.Screen name='Today' component={TodayStack} 
                options={{ title: t('app.drawer.today') }} />
              <Drawer.Screen name='Goals' component={GoalsStack} 
                options={{ title: t('app.drawer.goals') }} />
              <Drawer.Screen name='Calendar' component={CalendarStack} 
                options={{ title: t('app.drawer.calendar') }} />
              <Drawer.Screen name='Settings' component={SettingsScreen} 
                options={{ title: t('app.drawer.settings') }} />
            </Drawer.Navigator>
            } 
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}