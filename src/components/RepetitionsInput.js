import React from 'react';
import { View } from 'react-native';
import { 
  TextInput, HelperText, Text, withTheme 
} from 'react-native-paper';
import { useTranslation } from 'react-i18next'

const RepetitionsInput = withTheme(({
  description,
  value,
  onValueChange,
  error,
  clearError,
  theme,
}) => {

  const { t, i18 } = useTranslation()

  function parseValueChange(value){
    value = value<1000?value:'999'
    value = String(parseInt(value))
    value = value == 'NaN' ? '' : value
    clearError()
    onValueChange(value)
  }

  return (
    <View>
      {/* Row including description and input */}
      <View style={{marginHorizontal: 16, flexDirection: 'row', justifyContent:'space-between'}}>
        {/* Description */}
        <Text style={{alignSelf: 'center'}}>{description}</Text>        
        {/* Input */}
        <TextInput 
          style={{
            fontSize: 40,
            textAlign: 'center',
            backgroundColor: 'transparent',
          }} 
          selectTextOnFocus={true}
          selectionColor= {'transparent'}
          value={value}
          selection={{ start: value.length, end: value.length }}
          onChangeText={parseValueChange}  
          onEndEditing={() => {
            if(value < 1) onValueChange("0")
          }}
          keyboardType='numeric' 
          activeUnderlineColor={theme.colors.textInputSelected}
        />
      </View>
      {/* Error helper text */}
      { error? <HelperText 
          style={{
            marginHorizontal: 25,
            textAlign: 'center', 
            borderTopWidth: 1, 
            borderTopColor: theme.colors.error, 
          }} 
          type="error" 
          visible={true}
        >{t('activityForm.errors.noRepetitions')}</HelperText> : null }
    </View>
  )
})

export default RepetitionsInput