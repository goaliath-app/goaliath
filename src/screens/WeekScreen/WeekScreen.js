import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../../components'
import { Header, InfoCard } from '../../components';
import { updateLogs } from '../../redux'
import { extractActivityLists, getToday, hasSomethingToShow } from '../../util'


const WeekScreen = ({ todaysActivities, navigation, updateLogs }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  const infoContent = 'There are no activities scheduled for this week. You can go to the "Goals" section of the app to create new activities.'

  return(
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title='This Week' left='hamburger' navigation={navigation}/>
      {hasSomethingToShow(todaysActivities)?
        <ActivityList data={todaysActivities} />
      :
        <InfoCard content={infoContent} />
      }
      
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
