import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { DateTime } from 'luxon'
import { Header, ActivityList } from '../components' 
import { extractActivityList } from '../util'
import {  GeneralColor } from '../styles/Colors';

const DayInCalendarScreen = ({ navigation, activityList, day }) => {
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={day.toFormat("d MMMM yyyy")} left='back' navigation={navigation}/>
      <ActivityList data={activityList} date={day} disabled={true} />
    </View>
  )
}

const mapStateToProps = (state, ownProps) => {
  const dateString = ownProps.route.params.day
  const day = DateTime.fromFormat(dateString, 'yyyy-MM-dd')

  const activityList = extractActivityList(state, day)

  return { activityList, day }
}

const actionToProps = {
}

export default connect(mapStateToProps, actionToProps)(DayInCalendarScreen);

