import React from 'react';
import {  View } from 'react-native'
import { Checkbox as PaperCheckbox } from 'react-native-paper'

const Checkbox = (props) => (
  <View style={{padding: 6}}>
    <PaperCheckbox {...props} />
  </View>
)

export default Checkbox