import React from 'react';
import { useSelector } from 'react-redux';
import { selectTutorialState } from '../redux'
import { Pressable } from 'react-native';
import { faTrophy, faCalendarAlt, faChartBar, faTasks } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

const disabledColor = '#EBEBE4'

export const GoalsScreenIcon = ({ color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = tutorialState == "TodayScreenIntroduction" ? disabledColor : color

  return (
    <FontAwesomeIcon 
      icon={faTrophy} 
      size={size} 
      color={tutorialAwareColor} 
    />
  )
}

export const GoalsScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  // const tutorialAwareProps = tutorialState == "TodayScreenIntroduction" ? { ...props, disabled: true, style: { ...props.style, opacity: 0.5 } } : props
  const tutorialAwareProps = tutorialState == "TodayScreenIntroduction" ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}