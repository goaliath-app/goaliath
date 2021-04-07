import React from 'react';
import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

const TimeInput = ({ hours, setHours, minutes, setMinutes, seconds, setSeconds }) => (
    <View style={{flexDirection: 'row', marginLeft: 20, marginRight: 20}}>
  
      <TextInput 
        style={{flex: 2, fontSize: 40, padding: 5, textAlign: 'center'}} keyboardType='numeric'
        value={hours} 
        onChangeText={setHours}
        selectTextOnFocus={true}
        maxLength={2}
      />
      <Text style={{flex: 1, fontSize: 50,  textAlign: 'center'}}>:</Text>
  
      <TextInput 
        style={{flex: 2, fontSize: 40, padding: 5, textAlign: 'center'}} keyboardType='numeric'
        value={minutes} 
        onChangeText={setMinutes}
        selectTextOnFocus={true}
        maxLength={2}
      />
      <Text style={{flex: 1, fontSize: 50, textAlign: 'center'}}>:</Text>
  
      <TextInput 
        style={{flex: 2, fontSize: 40, padding: 5, textAlign: 'center'}} keyboardType='numeric' 
        value={seconds} 
        onChangeText={setSeconds}
        selectTextOnFocus={true}
        maxLength={2}
      />
     
  
    </View>
  )

  export default TimeInput;