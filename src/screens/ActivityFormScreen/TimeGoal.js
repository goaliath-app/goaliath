import React from 'react';
import { View } from 'react-native';
import { List, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next'


const TimeGoal = ({ 
    goal, setGoal
  }) => {
  const { t, i18n } = useTranslation()
  return (
    <List.Item 
      title={t('activityForm.objectiveSwitchLabel')}
      right={()=>(
        <View style={{marginRight: 12}}>
          <Checkbox
            status={goal=='time' ? 'checked' : 'unchecked'}
            onPress={() => {setGoal(goal!=='time'?'time':'check')}}
          />
        </View>
      )}
    />
  )
}

export default TimeGoal