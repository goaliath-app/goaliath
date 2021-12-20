import React from 'react';
import { View } from 'react-native'
import { Button } from 'react-native-paper'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const SpeechBubble = ({
  /* An array of objects defining each text to be displayed
  Each object has the properties:
    id: a unique id for this speech.
    text: the text to be shown.
    
  Planned properties (not yet implemented):  
    onTextStart: a function to be called when the text starts to be displayed
    onTextEnd: a function to be called when the text is finished being displayed
  */
  speeches,
}) => {
  const [ speechIndex, setSpeechIndex ] = React.useState(0)

  function onPressNext(){
    if(speechIndex < speeches.length-1){
      setSpeechIndex(speechIndex+1)
    }else{
      setSpeechIndex(0)
    }
  }

  return (
    <Animated.View style={[styles.speechBubble]}>
      <TypeWriter speech={speeches[speechIndex]} />
      <Button onPress={onPressNext}>NEXT</Button>
    </Animated.View>
  )
}

export const TypeWriter = ({
  speech,
  fadeIn=false,  // if true, the text will fade in 
  fadeInOffset=10,  // the number of characters that will fade in at the same time
  charDelay=50,  // time between characters
  duration: durationProp  // total animation time. Overrides charDelay
}) => {
  const [ lastSpeechId, setLastSpeechId ] = React.useState()
  
  const fadeInAnimationValue = useSharedValue(0)
  
  const targetValue = fadeIn ? speech.text.length + fadeInOffset : speech.text.length
  duration = durationProp ? durationProp : targetValue*charDelay

  
  if(speech.id != lastSpeechId) {
    fadeInAnimationValue.value = 0
    setLastSpeechId(speech.id)
  }

  React.useEffect(() => {
    fadeInAnimationValue.value = withTiming(targetValue, {duration, easing: Easing.linear})
  }, [speech.id])

  return (
    <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}} >
      {
      Array.from(speech.text).map((char, index) => (
        <TypeWriterChar 
          fadeInAnimationValue={fadeInAnimationValue} 
          char={char} 
          index={index} 
          fadeInOffset={fadeInOffset}
          fadeIn={fadeIn}/>
      )) 
      }
    </View>
  )
}

const TypeWriterChar = ({char, index, fadeInAnimationValue, fadeInOffset, fadeIn}) => {  

  const style = useAnimatedStyle(() => {
    const opacity = fadeIn ? 
      (fadeInAnimationValue.value-index)/fadeInOffset : 
      fadeInAnimationValue.value-index
    const fixedOpacity = (
      fadeIn? (
        opacity < 0 ? 0 :
        opacity > 1 ? 1 : 
        opacity
      ) : (
        opacity < 1 ? 0 : 1
      )
    )
    return {
      opacity: fixedOpacity,
    }
  })

  return (
    <Animated.Text style={style}>{char}</Animated.Text>
  )
}

const styles = StyleSheet.create({
  speechBubble: {
    flexDirection: 'row',
    borderRadius: 50,
    backgroundColor: 'aliceblue',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
  }
})

export default SpeechBubble;