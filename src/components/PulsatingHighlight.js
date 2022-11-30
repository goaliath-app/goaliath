import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { withTheme } from 'react-native-paper'

export const IconHighlighter = ({ children, active=true, style={}, highlightStyle={} }) => {
  
  const styles = StyleSheet.create({
    iconHighlighter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  })

  return(
    <View style={[styles.iconHighlighter, style]}>
      <PulsatingHighlight active={active}  style={highlightStyle}/>
      {children}
    </View>
  )
}

export const ViewHighlighter = withTheme(({ 
  theme, children, active=true, animated=true, style={}, highlightStyle={},
  containerStyle={},
}) => {
  const pulseValue = useSharedValue(0)

  const styles = StyleSheet.create({
    viewHighlight: {
      alignSelf: 'center',
      position: "absolute",
      height: "100%",
      width: "100%",
      backgroundColor: theme.colors.pulsatingHighlight,
    },
  })
  

  React.useEffect(() => {
    if( active ){
      if( animated ){
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(0.20, { duration: 1500, easing: Easing.in(Easing.exp) }),
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
            withDelay(1000, withTiming(0, { duration: 1 })),
          ), -1, true )
      } else {
        pulseValue.value = withTiming(0.2, {duration: 500})
      }
    }else{
      pulseValue.value = withTiming(0, {duration: 300})
    }
  }, [active])

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseValue.value,
    }
  })
  
  return(
    <View style={containerStyle}>
      <Animated.View style={[styles.viewHighlight, style, pulseStyle]} />
      {children}
    </View>
  )
})

const PulsatingHighlight = withTheme(({ theme, active=true, style={} }) => {
  const pulseValue = useSharedValue(0)

  const styles = StyleSheet.create({
    highlight: {
      position: "absolute", 
      height: 120, 
      width: 120, 
      backgroundColor: theme.colors.pulsatingHighlight,
      borderRadius: 90,
    },
  })

  React.useEffect(() => {
    if( active ){
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withDelay(500, withTiming(0, { duration: 1 })),
        ), -1, true )
    }else{
      pulseValue.value = 0
    }
  }, [active])

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.4 - 0.4*pulseValue.value,
      transform: [
        {
          scale: pulseValue.value,
        },
      ],
    }
  })

  return (
    <Animated.View style={[styles.highlight, style, pulseStyle]} />
  )
})

