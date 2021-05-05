import { Image, View, Text, StyleSheet, Linking } from 'react-native';
import { Title, Paragraph, Subheading } from 'react-native-paper'
import React from 'react';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next'
import { OnboardingColor } from '../styles/Colors';

const styles = StyleSheet.create({
    buttonCircle: {
      width: 40,
      height: 40,
      backgroundColor: OnboardingColor.backgroundColor,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    }
    //[...]
  });



 const _renderItem = ({ item }) => {
    return(
        <View style={styles.slide}>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 18 }}>
                <Title style={{ marginBottom: 8}} >{item.title}</Title>
                <Paragraph style={{ textAlign: 'justify' }} >{item.text}</Paragraph>
            </View>
        </View>
    )
  }

const NotSoSimple = ({ finishOnboarding }) => {
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
      text: (
        <>
          {t('onboarding.slideThree.text')}
          <Paragraph style={{color: 'blue'}} onPress={() => Linking.openURL('https://goaliath-app.github.io/guide')}>{t('onboarding.slideThree.linkText')}</Paragraph>
        </>),
    }
  ];

  return(
    <AppIntroSlider 
        renderItem={_renderItem} 
        data={slides} 
        onDone={finishOnboarding}
        activeDotStyle={{ backgroundColor: OnboardingColor.activeDot }}
        renderNextButton={() => <Subheading style={{ marginRight: 12, color: OnboardingColor.buttonTextColor }}>{t('onboarding.next')}</Subheading>}
        renderDoneButton={() => <Subheading style={{ marginRight: 12, color: OnboardingColor.buttonTextColor }}>{t('onboarding.begin')}</Subheading>}
    />
  )
}


export default NotSoSimple;