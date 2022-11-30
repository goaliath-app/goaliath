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


export const TodayScreenIcon = withTheme(({ theme, focused, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const isHighlightActive = (
    tutorialState >= tutorialStates.ActivitiesInTodayScreen
    && tutorialState < tutorialStates.Finished 
    && !focused
  )

  return (
    <IconHighlighter active={isHighlightActive} 
      highlightStyle={{backgroundColor: theme.colors.tabBarItemHighlight}}>
      <FontAwesomeIcon 
        icon={faTasks} 
        size={size} 
        color={color} 
      />
    </IconHighlighter>
  )
})

export const GoalsScreenIcon = withTheme(({ theme, focused, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = (
    tutorialState == tutorialStates.TodayScreenIntroduction ? theme.colors.tabBarDisabledIcon : color
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
    <IconHighlighter active={isHighlightActive}
      highlightStyle={{backgroundColor: theme.colors.tabBarItemHighlight}}>
      <FontAwesomeIcon 
        icon={faTrophy} 
        size={size} 
        color={tutorialAwareColor} 
      />
    </IconHighlighter>
  )
})

export const GoalsScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState == tutorialStates.TodayScreenIntroduction ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}

export const CalendarScreenIcon = withTheme(({ theme, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = tutorialState != tutorialStates.Finished ? theme.colors.tabBarDisabledIcon : color

  return (
    <FontAwesomeIcon 
      icon={faCalendarAlt} 
      size={size} 
      color={tutorialAwareColor} 
    />
  )
})

export const CalendarScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState != tutorialStates.Finished ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}

export const StatsScreenIcon = withTheme(({ theme, color, size }) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareColor = tutorialState != tutorialStates.Finished ? theme.colors.tabBarDisabledIcon : color

  return (
    <FontAwesomeIcon 
      icon={faChartBar} 
      size={size} 
      color={tutorialAwareColor} 
    />
  )
})

export const StatsScreenButton = ( props ) => {
  const tutorialState = useSelector(selectTutorialState)

  const tutorialAwareProps = tutorialState != tutorialStates.Finished ? { ...props, disabled: true } : props

  return (
    <Pressable {...tutorialAwareProps} />
  )
}