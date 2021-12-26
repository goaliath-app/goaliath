import React from 'react';
import { View, Pressable } from 'react-native'
import { Paragraph } from 'react-native-paper'
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  Easing,
  withSequence,
  useAnimatedGestureHandler,
  runOnJS,
  withDelay,
  cancelAnimation
} from 'react-native-reanimated';

import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { TapGestureHandler } from 'react-native-gesture-handler';

/* Caveats: 
 - You may have trailing or leading whitespaces at the start or end of each line.
 - Long words will be wrapped properly, but the next word will be on the next line.

 These are present because we need to apply a different style to each character.
 Because of Reanimated 2 limitations we can't use nested text, so to avoid 
 breaking of words in multiple lines we wrapped each word in a View.
*/
const SpeechBubble = ({
  /* 
  PROPS:

  An array of objects defining each text to be displayed
  Each object has the properties:
    id: a unique id for this speech.
    text: the text to be shown.
    onTextEnd: a function to be called when the text is finished being displayed
  */
  speeches,
  // Style of the containter bubble component
  bubbleStyle={},
  // Whether the text should be animated
  animation="fadeIn",  // Valid: "typeWriter", "fadeIn", "faerie" and "fastFaerie"
}) => {
  // Assets
  const touchIconSrc = require('./../../assets/ic_touch_app.png')

  // State
  const [ speechIndex, setSpeechIndex ] = React.useState(0)
  const [ isAnimationRunning, setIsAnimationRunning ] = React.useState(true)
  const [ bypassAnimation, setBypassAnimation ] = React.useState(false)

  // Set options based on selected animation
  let AnimatedTextComponent, configProps={}, nextButtonDelay = 300
  if(animation == "typeWriter"){
    AnimatedTextComponent = TypeWriter
    configProps={ fadeIn: false, charDelay: 40 }
  }else if(animation == "fastFaerie"){
    AnimatedTextComponent = TypeWriter 
    configProps={ fadeIn: true, fadeInOffset: 8, charDelay: 30}
  }else if(animation == "faerie"){
    AnimatedTextComponent = TypeWriter 
    configProps={ fadeIn: true, fadeInOffset: 15, charDelay: 40}
  }else{  // default: "fadeIn"
    AnimatedTextComponent = FadeInSpeech
    nextButtonDelay = 2000
  }

  // Animation's shared values
  const nextButtonBounce = useSharedValue(0)
  const nextButtonOpacity = useSharedValue(0) 
  const bubbleOpacity = useSharedValue(1)
  const bubbleScale = useSharedValue(1) 

  // On press handlers (worklets)
  const onPressHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      bubbleOpacity.value = 0.5
      bubbleScale.value = 0.9
    },
    onFinish: (event, ctx) => {
      bubbleOpacity.value = 1
      bubbleScale.value = 1
      if(isAnimationRunning){
        // cancel the animation
        runOnJS(setBypassAnimation)(true)
      }else{
        // proceed to the next speech
        nextButtonOpacity.value = 0
        if(speechIndex < speeches.length-1) {
          runOnJS(setSpeechIndex)(speechIndex+1)
          runOnJS(setIsAnimationRunning)(true)
        }
      }
    }
  })
  
  // First render animations
  React.useEffect(() => {
    // Start next button bounce
    nextButtonBounce.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000 }),
        withTiming(-5, { duration: 1000 }),
      ), -1, true )

  }, [])

  function onTextEnd(){
    'worklet';
    if(speeches[speechIndex]?.onTextEnd){
      runOnJS(speeches[speechIndex].onTextEnd)()
    }
    // Make next button appear after delay if there are more speeches
    if(speechIndex < speeches.length-1) {
      nextButtonOpacity.value = withDelay(nextButtonDelay, withTiming(1, {duration: 500}))
    }
    runOnJS(setIsAnimationRunning)(false)
    runOnJS(setBypassAnimation)(false)
  }

  // Animated Styles
  const bounceStyle = useAnimatedStyle (() => { 
    return {
      opacity: nextButtonOpacity.value,
      transform: [
        { translateY: nextButtonBounce.value },
      ],
    }
  })

  const bubbleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bubbleOpacity.value,
      transform: [
        { scale: bubbleScale.value },
      ],
    }
  })

  return (
    <TapGestureHandler onGestureEvent={onPressHandler} maxDurationMs={10000}>
      <Animated.View style={[styles.speechBubble, bubbleAnimatedStyle, bubbleStyle]}>
        <AnimatedTextComponent {...configProps} speech={speeches[speechIndex]} 
          onAnimationEnd={onTextEnd} bypassAnimation={bypassAnimation} />
        <Animated.Image style={bounceStyle} source={touchIconSrc} />
      </Animated.View>
    </TapGestureHandler>
  )
}

const FadeInSpeech = ({ speech, onAnimationEnd }) => {
  const [ lastSpeechId, setLastSpeechId ] = React.useState(speech.id)
  const fadeIn = useSharedValue(0)

  if(lastSpeechId != speech.id){
    fadeIn.value = 0
    setLastSpeechId(speech.id)
  }

  React.useEffect(() => {
    fadeIn.value = withTiming(1, {duration: 500}, onAnimationEnd)
  }, [speech.id])

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeIn.value,
    }
  })

  return (
    <Animated.Text style={[{flex: 1}, fadeInStyle]}>
      {speech.text}
    </Animated.Text>
  )
}

const TypeWriter = ({
  speech,
  fadeIn=true,  // if true, the text will fade in 
  fadeInOffset=8,  // the number of characters that will fade in at the same time
  charDelay=30,  // time between characters
  duration: durationProp=null,  // total animation time. Overrides charDelay
  onAnimationEnd: onAnimationEndProp=()=>{},  // Reanimated worklet. Executed when text animation is finished.
  bypassAnimation=false,  // set to true to bypass animation, even if it has already started
}) => {
  // State to check if speech has changed since last render
  const [ lastSpeechId, setLastSpeechId ] = React.useState()
  const [ animationStarted, setAnimationStarted ] = React.useState(false)
  
  // Animation's shared values
  const fadeInAnimationValue = useSharedValue(0)
  
  // Animation calculations
  const targetValue = fadeIn ? speech.text.length + fadeInOffset : speech.text.length
  duration = durationProp ? durationProp : targetValue*charDelay
  
  // Start fade in animation whenever we have a new speech
  React.useEffect(() => {
    if(!bypassAnimation){
      fadeInAnimationValue.value = withTiming(
        targetValue, 
        {duration, easing: Easing.linear},
        onAnimationEnd  // see below
      )
      setAnimationStarted(true)
    }else{
      fadeInAnimationValue.value = targetValue
      if(!animationStarted){
        onAnimationEnd()
      }
    }
  }, [speech.id, bypassAnimation])

  // If speech id is different from last speech id, hide text before render
  // to avoid showing the new text for one frame prior to its animation
  if(speech.id != lastSpeechId) {
    fadeInAnimationValue.value = 0
    setLastSpeechId(speech.id)
  }

  // JS onAnimationEnd callback
  // Just runs onAnimationEnd global and speech functions passed by parent
  function onAnimationEnd(){
    'worklet';
    onAnimationEndProp()
    if(speech.onTextEnd){
      runOnJS(speech.onTextEnd)()
    }
  }

  return (
    <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap'}} >
      {
        // split speech into words, preserving whitespaces
        speech.text.split(/(\s+)/).map((word, index, array) => {
          const previousWords = array.slice(0, index)
          const wordIndex = previousWords.reduce((acc, word) => acc + word.length, 0)
          return(
            <TypeWriterWord
              word={word}
              index={wordIndex}
              fadeInAnimationValue={fadeInAnimationValue}
              fadeInOffset={fadeInOffset}
              fadeIn={fadeIn}
            />
          )
        })
      }
    </View>
  )
}

const TypeWriterWord = ({
  word,  // text this word will show
  index: wordIndex,  // index of this word in the whole text
  fadeInAnimationValue,  // animation shared value
  fadeInOffset,  // see TypeWriter prop with same name
  fadeIn  // see TypeWriter prop with same name
}) => {
  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
      {
        Array.from(word).map((char, index) => (
          <TypeWriterChar
            fadeInAnimationValue={fadeInAnimationValue}
            char={char}
            index={wordIndex + index}
            fadeInOffset={fadeInOffset}
            fadeIn={fadeIn}/>
        ))    
     }
    </View>
  )
}

const TypeWriterChar = ({
  char,  // character to show, as a string
  index,  // index of this character in the full text
  fadeInAnimationValue,  // animation shared value
  fadeInOffset,  // see TypeWriter prop with same name
  fadeIn  // see TypeWriter prop with same name
}) => {  

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
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: 'aliceblue',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    paddingLeft: 20,
    paddingRight: 10,
  }
})

export default SpeechBubble;