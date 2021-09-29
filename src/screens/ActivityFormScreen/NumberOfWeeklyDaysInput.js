import React from 'react';
import { View } from 'react-native';
import { Subheading, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { ActivityFormColor } from '../../styles/Colors';

const NumberOfWeeklyDaysInput = ({ daysPerWeek, setDaysPerWeek }) => {
  const { t, i18n } = useTranslation()
  
  return(
    <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
      <Subheading style={{alignSelf: 'center'}}>{t('activityForm.weeklyDaysLabel')}</Subheading>
      <TextInput 
        style={{
          marginLeft: 20,
          fontSize: 40,
          textAlign: 'center',
          backgroundColor: ActivityFormColor.weeklyDaysTextInputBackground
        }} 
        selectTextOnFocus={true}
        selectionColor= {ActivityFormColor.weeklyDaysTextInputSelectionColor}
        value={daysPerWeek} 
        selection={{start:0, end:1}}
        onChangeText={(value) => {
          value = value<7?value:'7'
          value = value.substr(value.length - 1)
          value = value>0?value:'1'
          setDaysPerWeek(value)
        }}  
        keyboardType='numeric' 
      />
    </View>
  )
}

export default NumberOfWeeklyDaysInput