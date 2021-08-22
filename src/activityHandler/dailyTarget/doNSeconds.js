import React from 'react';
import { List } from 'react-native-paper'
import DailyTarget from './dailyTarget'

class DoNSeconds extends DailyTarget {
  constructor( activityHandler ){
    super( activityHandler )
  }

  getActivityListItem(){
    return (
      <List.Item
        title={this.activity.name}
        description='This list item was created by DoNSeconds'
      />
    )
  }
}

export default DoNSeconds