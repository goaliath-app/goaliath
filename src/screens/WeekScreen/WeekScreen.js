import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { DateTime } from 'luxon'
import { ActivityList } from '../../components'
import { Header } from '../../components';
import { updateLogs } from '../../redux'
import { extractActivityLists } from '../../util'

const data = [
    {title: 'Genki', completed: true, current: true, period: 'weekly', todayTime: 0, weeklyTimesObjective: 2, weeklyTimes: 0},
    {title: 'Genki', timeGoal: 5, completed: true, current: false, period: 'weekly', todayTime: 0, weeklyTimeGoal: 20, weeklyTime: 10, todayTime: 10},
  ]

const WeekScreen = ({ todaysActivities, navigation, updateLogs }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  return(
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title='This Week' left='hamburger' navigation={navigation}/>
      <ActivityList data={todaysActivities} />
    </View>
  )
}

const mapStateToProps = (state) => {
  const { weekActivities } = extractActivityLists(state, DateTime.now())
  return { todaysActivities: weekActivities }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(WeekScreen)
