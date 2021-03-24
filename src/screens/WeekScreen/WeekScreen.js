import React from 'react';
import { View } from 'react-native'
import { ActivityList, Header } from '../../components'


const data = [
    {title: 'Genki', completed: true, current: true, period: 'weekly', todayTime: 0, weeklyTimesObjective: 2, weeklyTimes: 0},
    {title: 'Genki', timeGoal: 5, completed: true, current: false, period: 'weekly', todayTime: 0, weeklyTimeGoal: 20, weeklyTime: 10, todayTime: 10},
  ]

const WeekScreen = ({ navigation }) => (
  <View>
    <Header title='This Week' left='hamburger' navigation={navigation}/>
    <ActivityList data={data} />
  </View>
)

export default WeekScreen;