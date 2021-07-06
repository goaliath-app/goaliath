import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components'
import { Header, InfoCard, SelectWeekliesListItem } from '../components';
import { updateLogs, areThereWeeklyActivities, areWeekliesSelectedToday } from '../redux'
import { extractActivityList, getToday, hasSomethingToShow } from '../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../styles/Colors';

const TodayScreen = ({ activityList, navigation, updateLogs, weekliesSelector }) => {
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )
  
  const completedActivities = activityList.filter(activity => activity.completed)
  const pendingActivities   = activityList.filter(activity => !activity.completed)

  const { t, i18n } = useTranslation()
  
  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('today.headerTitle')} left='hamburger' navigation={navigation}/>
      {hasSomethingToShow(activityList)?
      <View>
        <ActivityList data={pendingActivities} />
        {weekliesSelector=='unchecked'?
        <SelectWeekliesListItem checked={false} navigation={navigation}/>
        : <></> }
        <ActivityList data={completedActivities} />
        {weekliesSelector=='checked'?
        <SelectWeekliesListItem checked={true} navigation={navigation}/>
        : <></> }
      </View>
      :
      <InfoCard content={t('today.infoContent')} />
      }
    </View>
  );
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const activityList = extractActivityList(state, getToday(dayStartHour))
  const weekliesSelector = (
    areThereWeeklyActivities(state)?  
      (areWeekliesSelectedToday(state)?
       'checked'
       :
       'unchecked')
      :
      'hidden'
  )

  return { activityList, weekliesSelector }
}

const actionsToProps = {
  updateLogs
}

export default connect(mapStateToProps, actionsToProps)(TodayScreen)
