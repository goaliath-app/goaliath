import React from 'react';
import { View } from 'react-native'
import { List, Divider } from 'react-native-paper';
import { frequency } from '../../util'
import { useTranslation } from 'react-i18next'


const BasicActivityInfo = ({ activity, goal }) => {
  const { t, i18n } = useTranslation()
  
  return(
    <View>
      <List.Item
        title={t('basicActivityInfo.goal', {goalName: goal.name} )}
      />
      <List.Item
        title={t('basicActivityInfo.frequency') + frequency(activity, t) }
      />
      <Divider />
    </View>
  )
}

  export default BasicActivityInfo