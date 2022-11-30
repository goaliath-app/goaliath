import React from 'react';
import { View } from 'react-native';
import { Subheading, TextInput, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

const NumberOfWeeklyDaysInput = ({ daysPerWeek, setDaysPerWeek, theme }) => {
  const { t, i18n } = useTranslation()

  return(
    <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
      <Subheading style={{alignSelf: 'center'}}>{t('activityForm.weeklyDaysLabel')}</Subheading>
      <View style={{justifyContent: 'center'}}>
      <Text style={{position: 'absolute', alignSelf: 'center', fontSize: 40}}>{daysPerWeek}</Text>
      <TextInput 
        style={{
          width: 80,
          fontSize: 40,
          textAlign: 'center',
          backgroundColor: 'transparent',
        }} 
        selectOnFocus={true}
        selection={{start:1, end:1}}
        theme={{colors: { text: 'transparent' }}}
        textColor= {'transparent'}
        autoCorrect={false}
        caretHidden={true}
        value={daysPerWeek} 
        onChangeText={(value) => {
          if(value.length > 1){
            value = value.substr(value.length - 1)
          }
          value = value<7?value:'7'
          value = value>0?value:'1'
          setDaysPerWeek(value)
        }}  
        keyboardType='numeric'
        activeUnderlineColor={theme.colors.textInputSelected}
      />
      </View>
    </View>
  )
}

export default NumberOfWeeklyDaysInput