import 'react-native-gesture-handler';  // this import needs to be at the top.
import React from 'react';
import { TodayScreen, WeekScreen, ActivityDetailScreen } from './src/screens'
import { Provider as PaperProvider } from  'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Header from './src/componentLibrary/Header'

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const TodayStack = () => (
  <Stack.Navigator 
    initialRouteName='Today'
    headerMode='screen'
    screenOptions={{header: Header}}>
    <Stack.Screen name='Today' component={TodayScreen} options={{headerTitle: 'Today'}}/>
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}}/>
  </Stack.Navigator>
)

const WeekStack = () => (
  <Stack.Navigator 
    initialRouteName='Week'
    headerMode='screen'
    screenOptions={{header: Header}}>
    <Stack.Screen name='Week' component={WeekScreen} options={{headerTitle: 'Week'}}/>
    <Stack.Screen name='ActivityDetail' component={ActivityDetailScreen} options={{headerTitle: 'ActivityDetail'}}/>
  </Stack.Navigator>
)

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Today'>
          <Drawer.Screen name='Today' component={TodayStack} />
          <Drawer.Screen name='Week' component={WeekStack} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
