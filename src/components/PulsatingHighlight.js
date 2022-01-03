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

export const IconHighlighter = ({ children, active=true, style={}, highlightStyle={} }) => {
  return(
    <View style={[styles.iconHighlighter, style]}>
      <PulsatingHighlight active={active}  style={highlightStyle}/>
      {children}
    </View>
  )
}

export const ViewHighlighter = ({ children, active=true, style={}, highlightStyle={} }) => {
  const pulseValue = useSharedValue(0)

  React.useEffect(() => {
    if( active ){
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(0.20, { duration: 1500, easing: Easing.in(Easing.exp) }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withDelay(1000, withTiming(0, { duration: 1 })),
        ), -1, true )
    }else{
      pulseValue.value = 0
    }
  }, [active])

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseValue.value,
    }
  })
  
  return(
    <View>
      <Animated.View style={[styles.viewHighlight, style, pulseStyle]} />
      {children}
    </View>
  )
}

const PulsatingHighlight = ({ active=true, style={} }) => {
  const pulseValue = useSharedValue(0)

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
}

const styles = StyleSheet.create({
  highlight: {
    position: "absolute", 
    height: 120, 
    width: 120, 
    backgroundColor: 'deepskyblue',
    borderRadius: 90,
  },
  iconHighlighter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewHighlight: {
    alignSelf: 'center',
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: 'deepskyblue',
  },
})
