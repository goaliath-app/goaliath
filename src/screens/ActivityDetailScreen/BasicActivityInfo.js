import React from 'react';
import { View } from 'react-native'
import { useSelector } from 'react-redux';
import { List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { getFrequencyString } from '../../activityHandler'



const BasicActivityInfo = ({ activity, goal }) => {
  const { t, i18n } = useTranslation()

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))
  
  return(
    <View>
      <List.Item
        title={t('basicActivityInfo.goal', {goalName: goal.name} )}
        titleNumberOfLines={2}
      />
      <List.Item
        title={t('basicActivityInfo.frequency') + frequencyString }
        titleNumberOfLines={2}
      />
      { activity.description ?
      <List.Item
        title={activity.description} titleNumberOfLines={null}
      />
      : null
      }
      <Divider />
    </View>
  )
}

  export default BasicActivityInfo