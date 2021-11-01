import React from 'react';
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { List, Divider } from 'react-native-paper';
import { frequency } from '../../util'
import { useTranslation } from 'react-i18next'
import { getFrequencyString } from '../../activityHandler'



const BasicActivityInfo = ({ activity, goal }) => {
  const { t, i18n } = useTranslation()

  const frequencyString = useSelector((state) => getFrequencyString(state, activity.id, t))
  
  return(
    <View>
      <List.Item
        title={t('basicActivityInfo.goal', {goalName: goal.name} )}
      />
      <List.Item
        title={t('basicActivityInfo.frequency') + frequencyString }
      />
      <List.Item
        title={activity.description} titleNumberOfLines={null}
      />
      <Divider />
    </View>
  )
}

  export default BasicActivityInfo