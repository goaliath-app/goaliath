import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

export const HighlightContainer = ({ children, active=true, style={}, highlightStyle={} }) => {
  return(
    <View style={[styles.highlightContainer, style]}>
      <PulsatingHighlight active={active}  style={highlightStyle}/>
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
  highlightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
})

export default PulsatingHighlight