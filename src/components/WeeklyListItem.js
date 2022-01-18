import React from 'react';
import { Checkbox } from '../components';
import { List, withTheme } from 'react-native-paper';


const WeeklyListItem = withTheme(({ theme, name, description, id, checkboxStatus, onCheckboxPress, checkboxColor, selected, onPress, date }) => {
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
      titleNumberOfLines={2}
      description={description}
      style={{
        backgroundColor: selected? theme.colors.primaryLightVariant : theme.colors.surface
      }}
      onPress={onPress}
    />
  )
})

export default WeeklyListItem;