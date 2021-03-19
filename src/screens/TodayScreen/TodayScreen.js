import React from 'react';
import { View } from 'react-native'
import { ActivityList } from '../../components'
import { Header } from '../../components';


const data = [
  {title: 'Anki', completed: true, current: false, period: 'daily', intervals: []},
  {title: 'Cure Dolly', timeGoal: 20, completed: false, repeatMode: 'daily', intervals: [{startDate: '2021-03-19T09:49:09.950+01:00'}]},
  {title: 'Genki', completed: false, current: false, period: 'daily', intervals: []},
  {title: 'Genki', timeGoal: 10, completed: true, period: 'daily', todayTime: 20, intervals: [{startDate: '2021-03-19T09:49:09.950+01:00', endDate: '2021-03-19T09:52:21.219+01:00'}]},
  {title: 'Genki', timeGoal: 5, completed: false, period: 'daily', intervals: []},
  {title: 'Genki', timeGoal: 5, completed: true, period: 'daily', intervals: []},
 ]

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Header title='Today' left='hamburger' navigation={navigation}/>
      <ActivityList data={data} />
    </View>
  );
}

export default HomeScreen;