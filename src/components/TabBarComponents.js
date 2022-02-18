import React from 'react';
import { useSelector } from 'react-redux';
import { withTheme, Text } from 'react-native-paper'
import { selectTutorialState } from '../redux'
import { Pressable, View } from 'react-native';
import { faTrophy, faCalendarAlt, faChartBar, faTasks } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { IconHighlighter, useTooltip } from '../components';
import tutorialStates from '../tutorialStates'
import { TooltipChildrenContext } from 'react-native-walkthrough-tooltip';
import Color from 'color'
import { useTranslation } from 'react-i18next';


export const TodayScreenIcon = withTheme(({ theme, focused, color, size }) => {
  const { t, i18n } = useTranslation()
  const Tooltip = useTooltip('leadToTodayScreen', 'leadToTodayScreen', true)

  const tutorialState = useSelector(selectTutorialState)

  const isHighlightActive = (
    tutorialState >= tutorialStates.ActivitiesInTodayScreen
    && tutorialState < tutorialStates.Finished 
    && !focused
  )

  const icon = (
    <IconHighlighter active={isHighlightActive} 
    highlightStyle={{backgroundColor: theme.colors.tabBarItemHighlight}}>
      <FontAwesomeIcon 
        icon={faTasks} 
        size={size} 
        color={color} 
      />
    </IconHighlighter>
  )

  return (
    <Tooltip 
      content={<Text>{t('tooltips.todayScreenLead')}</Text>}
      placement='top'
      displayInsets={{top: 0, bottom: 0, left: 10, right: 10}}
      childContentSpacing={20}
    >
      <TooltipChildrenContext.Consumer>
      {({ tooltipDuplicate }) => (
        <View style={[
          tooltipDuplicate ? {backgroundColor: theme.colors.activityBackground, borderRadius: 90, height: 60, width: 60} : {},
          {alignItems: 'center', justifyContent: 'center'}
          ]}>
          {icon}
        </View>
      )}
      </TooltipChildrenContext.Consumer>
    </Tooltip>
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