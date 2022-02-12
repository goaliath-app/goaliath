import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Paragraph, Subheading, Title, withTheme } from 'react-native-paper';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next';


const Onboarding = withTheme(({ finishOnboarding, theme }) => {
  const { t, i18n } = useTranslation()


  const styles = StyleSheet.create({
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 18,
    }
  });

  const renderItem = ({item}) => {
    return(
      <View style={styles.slide}>
        <Image source={item.image} />
        <Title style={{ marginBottom: 8, fontSize: 22 }} >{item.title}</Title>
        <Paragraph style={{ textAlign: 'center', fontSize: 16 }} >{item.text}</Paragraph>
      </View>
    )
  }

  const slides = [
    {
      key: 'zero',
      title: t('onboarding.slideZero.title'),
      image: t('onboarding.slideZero.image'),
      text: t('onboarding.slideZero.text'),
    },

    {
      key: 'one',
      title: t('onboarding.slideOne.title'),
      image: t('onboarding.slideOne.image'),
      text: t('onboarding.slideOne.text'),
    },

    {
      key: 'two',
      title: t('onboarding.slideTwo.title'),
      image: t('onboarding.slideOne.image'),
      text: t('onboarding.slideTwo.text'),
    },

    {
      key: 'three',
      title: t('onboarding.slideThree.title'),
      image: t('onboarding.slideOne.image'),
      text: t('onboarding.slideThree.text'),
    },
  ];

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={finishOnboarding}
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