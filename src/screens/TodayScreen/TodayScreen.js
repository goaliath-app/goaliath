import React from 'react';
import { connect, useStore } from 'react-redux';
import { View } from 'react-native'
import { Paragraph, Card } from 'react-native-paper'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../../components'
import { Header, InfoCard } from '../../components';
import { updateLogs } from '../../redux'
import { extractActivityLists, getToday, hasSomethingToShow } from '../../util'
import createPersistoid from 'redux-persist/es/createPersistoid';


const data = [
  {name: 'Anki', completed: true, current: false, period: 'daily', intervals: []},
  {name: 'Cure Dolly', timeGoal: 20, completed: false, repeatMode: 'daily', intervals: [{startDate: '2021-03-19T09:49:09.950+01:00'}]},
  {name: 'Genki', completed: false, current: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 10, completed: true, period: 'daily', todayTime: 20, intervals: [{startDate: '2021-03-19T09:49:09.950+01:00', endDate: '2021-03-19T09:52:21.219+01:00'}]},
  {name: 'Genki', timeGoal: 5, completed: false, period: 'daily', intervals: []},
  {name: 'Genki', timeGoal: 5, completed: true, period: 'daily', intervals: []},
 ]

const TodayScreen = ({ todaysActivities, navigation, updateLogs, dayStartHour }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  const infoContent = 'There are no activities scheduled for today. You can go to the "Goals" section of the app to create new activities.'

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title='Today' left='hamburger' navigation={navigation}/>
      {hasSomethingToShow(todaysActivities)?
        <ActivityList data={todaysActivities} />
      :
        <InfoCard content={infoContent} />
      }
    </View>
  );
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const { dayActivities } = extractActivityLists(state, getToday(dayStartHour))
  return { todaysActivities: dayActivities, dayStartHour }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
