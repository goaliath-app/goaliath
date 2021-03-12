import 'react-native-gesture-handler';  // this import needs to be at the top.
import React from 'react';
import { TodayScreen, WeekScreen, ActivityDetailScreen, GoalsScreen, GoalScreen, NewActivityScreen } from './src/screens'
import { Provider as PaperProvider } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';


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
    <Stack.Screen name='NewActivity' component={NewActivityScreen} />
  </Stack.Navigator>
)


export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Today'>
          <Drawer.Screen name='Today' component={TodayStack} />
          <Drawer.Screen name='Week' component={WeekStack} />
          <Drawer.Screen name='Goals' component={GoalsStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
