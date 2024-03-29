import React from 'react';
import { View } from 'react-native';
import { Text, TextInput, withTheme } from 'react-native-paper';
import { Duration } from 'luxon'

const TimeInput = withTheme(({ theme, value, onValueChange, regularColor=theme.colors.timeInputRegular, selectedColor=theme.colors.timeInputSelected, maxHours=23 }) => {

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
    { colors: { primary: 'transparent', text: isFocused? selectedColor : regularColor } }
  )
  
  const commonProps = ({ unit, maxValue }) => ({
    style: {
      fontSize: 50, 
      padding: 5, 
      textAlign: 'center', 
      backgroundColor: 'transparent', 
      underlineColorAndroid: 'transparent',
    },
    selection: selection,
    autoCorrect: false,
    selectOnFocus: true,
    maxLength: 2,
    keyboardType: 'number-pad',
    caretHidden: true,
    underlineColor: 'transparent',
    selectionColor: 'transparent',
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
        key={'hoursInput'}
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
        key={'minutesInput'}
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
        key={'secondsInput'}
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
})

export default TimeInput;