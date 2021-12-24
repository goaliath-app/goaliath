import 'react-native-gesture-handler';  // this import needs to be at the top.
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider, Snackbar } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
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
  OnboardingScreen, SelectWeeklyActivitiesScreen,
  AddTasksScreen, CalendarDayViewScreen, CalendarWeekViewScreen,
  StatsScreen, ArchivedGoalsScreen, ArchivedActivitiesScreen
} from './src/screens'
import { 
  TodayScreenIcon, GoalsScreenIcon, GoalsScreenButton, CalendarScreenIcon, 
  CalendarScreenButton, StatsScreenIcon, StatsScreenButton,
} from './src/components'
import { StatusBarColor } from './src/styles/Colors';
import { generateDummyData } from './src/redux/Thunks'
import Notifications from './src/notifications'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


Notifications.initNotifications()

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const persistor = persistStore(store)
// persistor.purge()

/* The three stacks below are inside the BottomTabnavigator.
   If we want to navigate to a new screen without hiding the bottom navigation
   bar, it should be moved from the root stack of the app to the corresponding
   of these stacks
*/
const TodayStack = () => (
  <Stack.Navigator initialRouteName='Today' headerMode='none'>
    <Stack.Screen name='Today' component={TodayScreen} />
  </Stack.Navigator>
)

const GoalsStack = () => (
  <Stack.Navigator initialRouteName='Goals' headerMode='none' >
    <Stack.Screen name='Goals' component={GoalsScreen} />
  </Stack.Navigator>
)

const CalendarStack = () => (
  <Stack.Navigator initialRouteName='Calendar' headerMode='none' >
    <Stack.Screen name='Calendar' component={CalendarScreen} />
  </Stack.Navigator>
)

export const Context = React.createContext({})

export default function App() {
  // React.useEffect(() => {
  //   store.dispatch(generateDummyData())
  // }, [])

  const [newUser, setNewUser] = React.useState()
  const [ snackbarMessage, setSnackbarMessage ] = React.useState("")

  function finishOnboarding(){
    store.dispatch(finishOnboardingAction())
    setNewUser(false)
  }

  function onStoreRehydration(){
    setNewUser(store.getState().settings.newUser)
    i18n.changeLanguage(store.getState().settings.language)
  }

  const { t, i18 } = useTranslation()

  const BottomTab = () => (
    <Tab.Navigator labeled={false} showLabel={false} screenOptions={{
      headerShown: false,
      tabBarLabel: () => null,
    }}>
      <Tab.Screen name='Today' component={TodayStack} 
        options={{ 
          tabBarIcon: ({ focused, color, size }) => (
            <TodayScreenIcon size={size} color={color} />
          ) 
      }} />
      <Tab.Screen name='Goals' component={GoalsStack} 
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <GoalsScreenIcon color={color} size={size} />
          ),
          tabBarButton: (props) => {
            return <GoalsScreenButton {...props} />
          }
      }} />
      <Tab.Screen name='Calendar' component={CalendarStack} 
        options={{ 
          title: t('app.drawer.calendar'),
          tabBarIcon: ({ focused, color, size }) => (
            <CalendarScreenIcon color={color} size={size} />
          ),
          tabBarButton: (props) => <CalendarScreenButton {...props} />
      }} />
      <Tab.Screen name='Stats' component={StatsScreen} 
        options={{ 
          title: t('app.drawer.stats'),
          tabBarIcon: ({ focused, color, size }) => (
            <StatsScreenIcon color={color} size={size} />
          ),
          tabBarButton: (props) => <StatsScreenButton {...props} />
      }} />
    </Tab.Navigator>
  )

  return (
    <ReduxProvider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor} 
        onBeforeLift={()=>onStoreRehydration()}
      >
        <PaperProvider>
          <Context.Provider value={ { showSnackbar: setSnackbarMessage } } >
            <NavigationContainer>
              <StatusBar 
                style={StatusBarColor.style} 
                translucent={false} 
                backgroundColor={StatusBarColor.backgroundColor}
              />
              {newUser?
              <OnboardingScreen finishOnboarding={finishOnboarding} />
              : 
              <Stack.Navigator initialRouteName='bottomTab' headerMode='none'>
                {/* Bottom tab navigator containing the root screens */}
                <Stack.Screen name='bottomTab' component={BottomTab} />

                {/* Rest of screens, that hide the bottom bar navigation
                    when focused */}
                <Stack.Screen name='AddTasks' component={AddTasksScreen} />
                <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} />
                <Stack.Screen name='ActivityForm' component={ActivityFormScreen} />
                <Stack.Screen name='SelectWeeklyActivities' component={SelectWeeklyActivitiesScreen} />
                <Stack.Screen name='Goal' component={GoalScreen} />
                <Stack.Screen name='GoalForm' component={GoalFormScreen} />
                <Stack.Screen name='ArchivedGoals' component={ArchivedGoalsScreen} />
                <Stack.Screen name='ArchivedActivities' component={ArchivedActivitiesScreen} />
                <Stack.Screen name='CalendarDayView' component={CalendarDayViewScreen} />
                <Stack.Screen name='CalendarWeekView' component={CalendarWeekViewScreen} />
                <Stack.Screen name='Settings' component={SettingsScreen} />
              </Stack.Navigator>
              }
              <Snackbar
                visible={snackbarMessage != ""}
                onDismiss={()=>setSnackbarMessage("")}
                duration={5000}
              >{snackbarMessage}</Snackbar>
            </NavigationContainer>
          </Context.Provider>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}