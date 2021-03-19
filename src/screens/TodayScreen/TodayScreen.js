import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { ActivityList } from '../../components'
import { Header } from '../../components';
import { selectTodayLogs, selectActivityById } from '../../redux'


const data = [
  {name: 'Anki', completed: true, current: false, period: 'daily', intervals: []},
  {name: 'Cure Dolly', timeGoal: 20, completed: false, repeatMode: 'daily', intervals: [{startDate: '2021-03-19T09:49:09.950+01:00'}]},
  {name: 'Genki', completed: false, current: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 10, completed: true, period: 'daily', todayTime: 20, intervals: [{startDate: '2021-03-19T09:49:09.950+01:00', endDate: '2021-03-19T09:52:21.219+01:00'}]},
  {name: 'Genki', timeGoal: 5, completed: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 5, completed: true, period: 'daily', intervals: []},
 ]

const TodayScreen = ({ todaysActivities, navigation }) => {
  console.log('todaysActivities del TodayScreen:')
  console.log(todaysActivities)
  return (
    <View>
      <Header title='Today' left='hamburger' navigation={navigation}/>
      <ActivityList data={todaysActivities} />
    </View>
  );
}

const mapStateToProps = (state) => {
  let todaysActivities = []
  const logs = selectTodayLogs(state)
  for(let log of logs){
    const activity = selectActivityById(state, log.id)
    todaysActivities.push({
      ...activity,
      ...log,
    })
  }
  return { todaysActivities }
}

export default connect(mapStateToProps)(TodayScreen)
