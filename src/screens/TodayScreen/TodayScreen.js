import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../../components'
import { Header } from '../../components';
import { selectTodayEntries, selectActivityById, updateLogs } from '../../redux'


const data = [
  {name: 'Anki', completed: true, current: false, period: 'daily', intervals: []},
  {name: 'Cure Dolly', timeGoal: 20, completed: false, repeatMode: 'daily', intervals: [{startDate: '2021-03-19T09:49:09.950+01:00'}]},
  {name: 'Genki', completed: false, current: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 10, completed: true, period: 'daily', todayTime: 20, intervals: [{startDate: '2021-03-19T09:49:09.950+01:00', endDate: '2021-03-19T09:52:21.219+01:00'}]},
  {name: 'Genki', timeGoal: 5, completed: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 5, completed: true, period: 'daily', intervals: []},
 ]

const TodayScreen = ({ todaysActivities, navigation, updateLogs }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title='Today' left='hamburger' navigation={navigation}/>
      <ActivityList data={todaysActivities} />
    </View>
  );
}

const mapStateToProps = (state) => {
  let todaysActivities = []
  const logs = selectTodayEntries(state)
  for(let log of logs){
    const activity = selectActivityById(state, log.id)
    if(!(activity.repeatMode == 'weekly')){
      todaysActivities.push({
        ...activity,
        ...log,
      })
    }
  }
  return { todaysActivities }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
