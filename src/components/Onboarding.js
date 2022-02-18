import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Paragraph, Subheading, Title, withTheme } from 'react-native-paper';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';


const Onboarding = withTheme(({ finishOnboarding, theme }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const renderItem = ({item}) => {
    return(
      <View style={{flex: 1}}>
        <View style={{flex: 2}}>
          <Image source={item.image} style={{width: '100%', height: '100%', resizeMode: 'contain'}} />
        </View>
        <View style={{flex: 1, alignItems: 'center', marginHorizontal: 18}}>
          <Title style={{ marginBottom: 8, fontSize: 22 }} >{item.title}</Title>
          <Paragraph style={{ textAlign: 'center', fontSize: 16 }} >{item.text}</Paragraph>
        </View>
      </View>
    )
  }

  const slides = [
    {
      key: 'zero',
      title: t('onboarding.slideZero.title'),
      image: require('../../assets/onboarding-first-slide.png'),
      text: t('onboarding.slideZero.text'),
    },

    {
      key: 'one',
      title: t('onboarding.slideOne.title'),
      image: require('../../assets/onboarding-second-slide.png'),
      text: t('onboarding.slideOne.text'),
    },

    {
      key: 'two',
      title: t('onboarding.slideTwo.title'),
      image: require('../../assets/onboarding-third-slide.png'),
      text: t('onboarding.slideTwo.text'),
    },

    {
      key: 'three',
      title: t('onboarding.slideThree.title'),
      image: require('../../assets/onboarding-fourth-slide.png'),
      text: t('onboarding.slideThree.text'),
    },
  ];

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={() => {finishOnboarding(); navigation.navigate('bottomTab')}}
      showPrevButton={true}
      renderPrevButton={() => (
        <Subheading style={{ marginLeft: 12 }}>
          {t('onboarding.previous')}
        </Subheading>
      )}
      renderNextButton={() => (
        <Subheading style={{ marginRight: 12, color: theme.colors.buttons }}>
          {t('onboarding.next')}
        </Subheading>
      )}
      renderDoneButton={() => (
        <Subheading style={{ marginRight: 12, color: theme.colors.buttons}}>
          {t('onboarding.begin')}
        </Subheading>
      )}
      dotStyle={{backgroundColor: theme.colors.dots}}
      activeDotStyle={{backgroundColor: theme.colors.activeDot}}
    />
  )
  
})

export default Onboarding;