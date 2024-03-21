import React from 'react';
import { View, Text, Dimensions } from 'react-native'
import { List, Divider, FlatList } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { getLifeTimeStats, selectAllActivities, selectActivityById } from '../redux'
import { getPreferedExpression } from '../time'
import { useSelector } from 'react-redux'
import Duration from 'luxon/src/duration.js'


const GenericStats = ({ activityId, goalId }) => {
  const { t, i18n } = useTranslation()
  
  let time = Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
  let completions = 0 
  let repetitions = 0

  const state = useSelector(state => state)

  const activities = []

  if (activityId != null) {
    const activity = selectActivityById(state, activityId)
    activities.push(activity)
  }else if(goalId != null){
    activities.push(...selectAllActivities(state).filter(activity => activity.goalId == goalId))
  }else{
    activities.push(...selectAllActivities(state))
  }

  activities.forEach(activity => {
    const { loggedTime, daysDoneCount, repetitionsCount } = getLifeTimeStats(state, activity.id)
    time = time.plus(loggedTime)
    completions += daysDoneCount
    repetitions += repetitionsCount
  })


  const { value: timeValue, localeUnit: timeUnit } = getPreferedExpression(time, t)

  return(
    <View>
      <List.Item  
        title={t('stats.genericStats.title')} 
      />
      <List.Item
        style={{justifyContent: 'center', height: 40}}
        left={() => <List.Icon icon="check-circle-outline" />}
        title={ completions + t('stats.genericStats.daysCompleted')}
      />
      {
        
        timeValue > 0 ?
          <List.Item
            style={{justifyContent: 'center', height: 40}}
            left={() => <List.Icon icon="clock-outline" />}
            title={t('stats.genericStats.timeDedicated', {expressionValue: timeValue, expressionUnit: timeUnit})}
          /> 
          : null
      }
      { 
        repetitions > 0 ? 
          <List.Item
            style={{justifyContent: 'center', height: 40}}
            left={() => <List.Icon icon="restore" />}  // Other icon candidates: "alpha-r-circle-outline"
            title={ repetitions + t('stats.genericStats.repetitions')}
          />
          : null
      }
      <Divider style={{marginTop: 10}}/>
    </View>
  )
}

export default GenericStats