import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor } from '../styles/Colors';
import { Header } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, Checkbox, List } from 'react-native-paper';
import { selectAllActivities, selectAllWeekEntriesByActivityId } from '../redux';
import { extractActivityList, getToday, getWeeklyStats, getPreferedExpression } from '../util';
import Duration from 'luxon/src/duration.js'


const SelectWeeklyActivitiesScreen = ({navigation, weeklyActivities, weeklyEntries}) => {
  const { t, i18n } = useTranslation()

  const headerButtons = (
    <Appbar.Action
      icon='check'
      onPress={() => {}}
    />
  )


  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('weeklyActivities.headerTitle')} 
        left='back' 
        navigation={navigation}
        buttons={headerButtons}
      />
      <WeeklyList data={weeklyActivities}/> 
    </View>
  );
}

const WeeklyListItem = ({name, description}) => {
  
  const leftSlot = (
    <Checkbox 
      status='unchecked'

    />
  )
  return (
    <List.Item 
      left={() => leftSlot}
      title={name}
      description={description}
      onPress={()=>{}}
    />
  )
}

const WeeklyList = ({data}) => {
  const { t, i18n } = useTranslation()

  return (
    <FlatList 
      data={data}
      renderItem={({item})=>{
        let description
        if(item.goal == 'check'){
          const daysLeft = item.timesPerWeek - item.weeklyTimes
          description = t('weeklyActivities.daysLeft', {daysLeft})
        } else {
          const timeGoal = Duration.fromObject({seconds: item.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
          let timeLeft = timeGoal.minus(item.weeklyTime)
          timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
          const timeExpr = getPreferedExpression(timeLeft, t)
          description = t('weeklyActivities.timeLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit})
        }
        return(
          <WeeklyListItem name={item.name} description={description} />
        )
      }}    
    />
  )
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const today = getToday(dayStartHour)
  const todayEntries = extractActivityList(state, today)
  const weeklyEntries = todayEntries.filter(entry => entry.repeatMode=='weekly')
  const allActivities = selectAllActivities(state)
  const weeklyActivities = allActivities.filter(activity => activity.repeatMode=='weekly')
  
  // inyect weeklyTime and weeklyTimes to each activity of weeklyActivities
  weeklyActivities.forEach((activity, i) => {
    const { weeklyTime, weeklyTimes } = getWeeklyStats(state, today, activity.id)
    console.log(`${weeklyTime}, ${weeklyTimes}`)
    weeklyActivities[i] = {...activity, weeklyTime, weeklyTimes}
  })
  console.log(weeklyActivities)
  return { weeklyEntries, weeklyActivities }
}

const actionsToProps = {

}

export default connect(mapStateToProps, actionsToProps)(SelectWeeklyActivitiesScreen)
