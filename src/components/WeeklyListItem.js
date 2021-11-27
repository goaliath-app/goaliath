import React from 'react';
import { GeneralColor } from '../styles/Colors';
import { Checkbox } from '../components';
import { List } from 'react-native-paper';


const WeeklyListItem = ({name, description, id, checkboxStatus, onCheckboxPress, checkboxColor, selected, onPress, date}) => {
  // if checkboxStatus is null, check if there is already a log for this activity and day

  const leftSlot = (
    <Checkbox 
      color={checkboxColor}
      uncheckedColor={checkboxColor}
      status={checkboxStatus}
      onPress={() => onCheckboxPress(checkboxStatus=='checked'?'unchecked':'checked')}
    />
  )

  return (
    <List.Item 
      left={() => leftSlot}
      title={name}
      description={description}
      style={{
        backgroundColor: selected?GeneralColor.selectedSurface:'white'
      }}
      onPress={onPress}
    />
  )
}

export default WeeklyListItem