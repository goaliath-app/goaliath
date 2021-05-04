import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../../components'
import { Header, InfoCard } from '../../components';
import { updateLogs } from '../../redux'
import { extractActivityLists, getToday, hasSomethingToShow } from '../../util'
import { useTranslation } from 'react-i18next'
import { GeneralColor } from '../../styles/Colors';


const WeekScreen = ({ todaysActivities, navigation, updateLogs }) => {
  const { t, i18n } = useTranslation()

  const infoContent = t('week.infoContent')
  
  useFocusEffect(
    React.useCallback(() => {
      updateLogs()
    }, [])
  )

  return(
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={t('week.headerTitle')} left='hamburger' navigation={navigation}/>
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
