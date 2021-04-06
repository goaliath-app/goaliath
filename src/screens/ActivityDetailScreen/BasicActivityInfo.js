import React from 'react';
import { View } from 'react-native'
import { List, Divider } from 'react-native-paper';
import { frequency } from '../../util'


const BasicActivityInfo = ({ activity, goal }) => (
  <View>
    <List.Item
      title={'Goal: ' + goal.name}
    />
    <List.Item
      title={'Frequency: ' + frequency(activity) }
    />
    <Divider />
  </View>
)

  export default BasicActivityInfo