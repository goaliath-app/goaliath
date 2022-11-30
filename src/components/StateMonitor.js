import React from 'react';
import { useSelector } from 'react-redux';
import { Text } from  'react-native-paper'
import { selectTutorialState } from '../redux'
import tutorialStates from '../tutorialStates'

// A component that shows the current tutorialState. Only used for debugging purposes
const StateMonitor = () => {
  const state = useSelector(selectTutorialState)
  
  let stateName = "Name not found"
  for (let key in tutorialStates) {
    if (tutorialStates[key] == state) {
      stateName = key
    }
  }

  return (
    <Text>{state} - {stateName}</Text>
  )
}

export default StateMonitor