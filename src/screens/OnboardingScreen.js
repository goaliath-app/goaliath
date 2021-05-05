import { View, StyleSheet, Linking } from 'react-native';
import { Title, Paragraph, Subheading } from 'react-native-paper'
import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next'
import { OnboardingColor } from '../styles/Colors';

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

  const slides = [
    {
      key: 'one',
      title: t('onboarding.slideOne.title'),
      text: t('onboarding.slideOne.text'),
    },
    {
      key: 'two',
      title: t('onboarding.slideTwo.title'),
      text: t('onboarding.slideTwo.text'),
    },
    {
      key: 'three',
      title: t('onboarding.slideThree.title'),
      text: (<>
        {t('onboarding.slideThree.text')}
        <Paragraph 
          style={{color: 'blue'}} 
          onPress={() => Linking.openURL('https://goaliath-app.github.io/guide')}>
            {t('onboarding.slideThree.linkText')}
        </Paragraph>
      </>),
    }
  ];

  return(
    <AppIntroSlider 
        renderItem={renderItem} 
        data={slides} 
        onDone={finishOnboarding}
        activeDotStyle={{ backgroundColor: OnboardingColor.activeDot }}
        renderNextButton={() => (
          <Subheading style={{ marginRight: 12, color: OnboardingColor.buttonTextColor }}>
            {t('onboarding.next')}
          </Subheading>
        )}
        renderDoneButton={() => (
          <Subheading style={{ marginRight: 12, color: OnboardingColor.buttonTextColor }}>
            {t('onboarding.begin')}
          </Subheading>
        )}
    />
  )
}

export default OnboardingScreen;