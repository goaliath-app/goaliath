import { View, StyleSheet, Linking } from 'react-native';
import { Title, Paragraph, Subheading } from 'react-native-paper'
import React from 'react';
import { useDispatch } from 'react-redux';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next'
import { OnboardingColor } from '../styles/Colors';
import { SpeechBubble } from '../components'
import { setTutorialState } from '../redux'
import tutorialStates from '../tutorialStates'

const styles = StyleSheet.create({
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 18,
    }
  });

 const renderItem = ({ item }) => {
    return(
      <View style={styles.slide}>
        <Title style={{ marginBottom: 8 }} >{item.title}</Title>
        <Paragraph style={{ textAlign: 'justify' }} >{item.text}</Paragraph>
      </View>
    )
  }

const OnboardingScreen = ({ finishOnboarding }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()

  const slides = [
    {
      text: (<>
        <SpeechBubble speeches={[
          {id: 0, text: t('onboarding.1')},
          {id: 1, text: t('onboarding.2')},
          {id: 2, text: t('onboarding.3'), onTextEnd: finishOnboarding},
          {id: 3, text: ''}
          ]} 
          bubbleStyle={{height: 80}} />
      </>),
    }
  ];

  return(
    <AppIntroSlider 
        renderItem={renderItem} 
        data={slides} 
        onDone={() => {
          dispatch(setTutorialState(tutorialStates.Finished))
          finishOnboarding()
          }
        }
        activeDotStyle={{ backgroundColor: OnboardingColor.activeDot }}
        renderDoneButton={() => (
          <Subheading style={{ marginRight: 12, color: OnboardingColor.buttonTextColor }}>
            {t('onboarding.skip')}
          </Subheading>
        )}
    />
  )
}

export default OnboardingScreen;