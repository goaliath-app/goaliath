import { View, Pressable } from 'react-native';
import { Text } from 'react-native-paper'
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next'
import { SpeechBubble } from '../components'
import { setTutorialState } from '../redux'
import tutorialStates from '../tutorialStates'

const OnboardingScreen = ({ finishOnboarding }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <SpeechBubble speeches={[
          {id: 0, text: t('onboarding.1')},
          {id: 1, text: t('onboarding.2')},
          {id: 2, text: t('onboarding.3'), onNextPress: finishOnboarding},
          ]} 
          bubbleStyle={{height: 80}} />
      </View>
      <Pressable onPress={() => {
        dispatch(setTutorialState(tutorialStates.Finished))
        finishOnboarding()
      }} style={{alignItems: 'flex-end', marginRight: 25, marginBottom: 20}}>
        <Text style={{ justifySelf: 'flex-end', fontSize: 16 }}>{t('onboarding.skip')}</Text>
      </Pressable>
    </View>
  )
}

export default OnboardingScreen;