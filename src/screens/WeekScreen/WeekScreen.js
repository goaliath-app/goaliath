import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../../components'
import { Header } from '../../components';
import { updateLogs } from '../../redux'
import { extractActivityLists, getToday } from '../../util'


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
  const { dayStartHour } = state.settings
  const { weekActivities } = extractActivityLists(state, getToday(dayStartHour))
  return { todaysActivities: weekActivities }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(WeekScreen)
