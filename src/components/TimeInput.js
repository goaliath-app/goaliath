import React from 'react';
import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

const TimeInput = ({ hours, setHours, minutes, setMinutes, seconds, setSeconds }) => (
    <View style={{flexDirection: 'row'}}>
  
      <TextInput 
        style={{flex: 2}} keyboardType='numeric'
        value={hours} 
        onChangeText={setHours}
      />
      <Text style={{flex: 1}}>hr</Text>
  
      <TextInput 
        style={{flex: 2}} keyboardType='numeric'
        value={minutes} 
        onChangeText={setMinutes}
      />
      <Text style={{flex: 1}}>min</Text>
  
      <TextInput 
        style={{flex: 2}} keyboardType='numeric' 
        value={seconds} 
        onChangeText={setSeconds}
      />
      <Text style={{flex: 1}}>s</Text>
  
    </View>
  )

  export default TimeInput;