import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import Duration from 'luxon/src/duration.js'
import { ActivityList } from '../../components'
import { Header } from '../../components';
import { selectTodayEntries, selectActivityById, updateLogs, selectThisWeekEntriesByActivityId } from '../../redux'
import { getTodayTime } from '../../util'

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
    <View>
      <Header title='This Week' left='hamburger' navigation={navigation}/>
      <ActivityList data={todaysActivities} />
    </View>
  )
}

const mapStateToProps = (state) => {
  let todaysActivities = []
  const logs = selectTodayEntries(state)
  for(let log of logs){
    const activity = selectActivityById(state, log.id)
    if(activity.repeatMode == 'weekly'){
      // we have to inyect weeklyTime and weeklyTimes
      const weekLogs = selectThisWeekEntriesByActivityId(state, activity.id)
      let weeklyTime = Duration.fromMillis(0).shiftTo('hours', 'minutes', 'seconds')
      let weeklyTimes = 0
      for(let day in weekLogs){
        weeklyTime = weeklyTime.plus(getTodayTime(weekLogs[day].intervals))
        weeklyTimes += weekLogs[day].completed?1:0
      }
      todaysActivities.push({
        ...activity,
        ...log,
        weeklyTime,
        weeklyTimes
      })
    }
  }
  return { todaysActivities }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(WeekScreen)
