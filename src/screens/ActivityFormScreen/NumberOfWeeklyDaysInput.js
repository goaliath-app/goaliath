import React from 'react';
import { View } from 'react-native';
import { Subheading, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

const NumberOfWeeklyDaysInput = ({ daysPerWeek, setDaysPerWeek, theme }) => {
  const { t, i18n } = useTranslation()
  
  return(
    <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
      <Subheading style={{alignSelf: 'center'}}>{t('activityForm.weeklyDaysLabel')}</Subheading>
      <TextInput 
        style={{
          marginLeft: 20,
          fontSize: 40,
          textAlign: 'center',
          backgroundColor: 'transparent'
        }} 
        selectTextOnFocus={true}
        selectionColor= {'transparent'}
        value={daysPerWeek} 
        selection={{start:0, end:1}}
        onChangeText={(value) => {
          value = value<7?value:'7'
          value = value.substr(value.length - 1)
          value = value>0?value:'1'
          setDaysPerWeek(value)
        }}  
        keyboardType='numeric'
        activeUnderlineColor={theme.colors.textInputSelected}
      />
    </View>
  )
}

export default NumberOfWeeklyDaysInput