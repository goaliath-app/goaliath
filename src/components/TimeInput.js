import React from 'react';
import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Duration } from 'luxon'
import { TimeInputColor } from '../styles/Colors'

const TimeInput = ({ value, onValueChange, regularColor=TimeInputColor.regularColor, selectedColor=TimeInputColor.selectedColor, maxHours=23 }) => {

  const [currentFocus, setCurrentFocus] = React.useState()
  const [selection, setSelection] = React.useState()

  const duration = (
    Duration
      .fromObject({ seconds: value })
      .shiftTo('hours', 'minutes', 'seconds')
  )

  const hours   = duration.hours
  const minutes = duration.minutes
  const seconds = duration.seconds

  const getTheme = isFocused =>(
    { colors: { primary: TimeInputColor.primary, text: isFocused?selectedColor:regularColor } }
  )
  
  const commonProps = ({ unit, maxValue }) => ({
    style: {
      fontSize: 50, 
      padding: 5, 
      textAlign: 'center', 
      backgroundColor: TimeInputColor.backgroundColor, 
      underlineColorAndroid: TimeInputColor.underlineColorAndroid,
    },
    selection: selection,
    autoCorrect: false,
    selectOnFocus: true,
    maxLength: 2,
    keyboardType: 'number-pad',
    caretHidden: true,
    underlineColor: TimeInputColor.underlineColor,
    selectionColor: TimeInputColor.selectionColor,
    theme: getTheme(currentFocus==unit),
    onBlur: () => { 
      if(currentFocus==unit) setCurrentFocus('')
      setSelection(null)
    },
    onChangeText: (value) => {
      value = value?parseInt(value):0

      if(String(value).length < 2){
        setSelection({start: value.length, end: value.length})
      }else{
        setSelection({start: 0, end: 2})
      }
      
      value = value<maxValue?value:maxValue
      const newDuration = duration.set({ [unit]: value })
      onValueChange(newDuration.as('seconds'))
    },
  })
  
  return(
    <View 
      style={{
        flexDirection: 'row', 
        marginLeft: 20, 
        marginRight: 20, 
        justifyContent: 'center', 
        alignItems: 'center'
      }
    }>

      <TextInput 
        value={
          currentFocus=='hours'?
            hours.toString()
          :
            hours.toString().padStart(2, '0')
        } 
        onFocus= {() => {
          setSelection({start:0, end: hours.toString().length})
          setCurrentFocus('hours')
        }}
        {...commonProps({ unit: 'hours', maxValue: maxHours })} 
      />

      <Text style={{fontSize: 50, marginBottom: 5, color: regularColor}}>:</Text>
      
      <TextInput 
        value={
          currentFocus=='minutes'?
            minutes.toString()
          :
            minutes.toString().padStart(2, '0')
        } 
        onFocus= {() => {
          setSelection({start:0, end: minutes.toString().length})
          setCurrentFocus('minutes')
        }}
        {...commonProps({ unit: 'minutes', maxValue: 59 })} 
      />

      <Text style={{fontSize: 50, marginBottom: 5, color: regularColor}}>:</Text>

      <TextInput 
        value={
          currentFocus=='seconds'?
            seconds.toString()
          :
            seconds.toString().padStart(2, '0')
        } 
        onFocus= {() => {
          setSelection({start:0, end: seconds.toString().length})
          setCurrentFocus('seconds')
        }}
        {...commonProps({ unit: 'seconds', maxValue: 59 })}  
      />

    </View>
  )
}

export default TimeInput