import React from 'react';
import { useSelector } from 'react-redux';
import { withTheme } from 'react-native-paper'
import { selectTutorialState } from '../redux'
import { Pressable } from 'react-native';
import { faTrophy, faCalendarAlt, faChartBar, faTasks } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconHighlighter } from '../components';
import tutorialStates from '../tutorialStates'
import Color from 'color'

function disabledColor(color){
  return Color(color).alpha(0.5).rgb().string()
}

export const TodayScreenIcon = ({ focused, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const isHighlightActive = (
    tutorialState >= tutorialStates.ActivitiesInTodayScreen
    && tutorialState < tutorialStates.Finished 
    && !focused
  )

  return (
    <IconHighlighter active={isHighlightActive}>
      <FontAwesomeIcon 
        icon={faTasks} 
        size={size} 
        color={color} 
      />
    </IconHighlighter>
  )
}

export const GoalsScreenIcon = ({ focused, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = (
    tutorialState == tutorialStates.TodayScreenIntroduction ? disabledColor(color) : color
  )

  const [ isHighlightActive, setIsHighlightActive ] = React.useState(false)

  React.useEffect(() => {
    if( 
      tutorialState >= tutorialStates.GoalsScreenIntroduction
      && tutorialState < tutorialStates.ActivitiesInTodayScreen
      && !focused 
    ){
      setIsHighlightActive(true)
    }else{
      setIsHighlightActive(false)
    }
  }, [tutorialState, focused])

  return (
    <IconHighlighter active={isHighlightActive}>
      <FontAwesomeIcon 
        icon={faTrophy} 
        size={size} 
        color={tutorialAwareColor} 
      />
    </IconHighlighter>
  )
}

export const GoalsScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState == tutorialStates.TodayScreenIntroduction ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}

export const CalendarScreenIcon = ({ color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = tutorialState != tutorialStates.Finished ? disabledColor(color) : color

  return (
    <FontAwesomeIcon 
      icon={faCalendarAlt} 
      size={size} 
      color={tutorialAwareColor} 
    />
  )
}

export const CalendarScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState != tutorialStates.Finished ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}

export const StatsScreenIcon = ({ color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = tutorialState != tutorialStates.Finished ? disabledColor(color) : color

  return (
    <FontAwesomeIcon 
      icon={faChartBar} 
      size={size} 
      color={tutorialAwareColor} 
    />
  )
}

export const StatsScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState != tutorialStates.Finished ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}