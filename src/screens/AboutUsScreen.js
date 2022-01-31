import React from 'react';
import { Image, Linking, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trans, useTranslation } from 'react-i18next';
import { Header } from '../components';
import { Paragraph, withTheme } from 'react-native-paper';

const AboutUsScreen = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  
  return(
    <View>
      <Header title={t('aboutUs.title')} left={'back'} navigation={navigation} />
      <Image source={(require('../../assets/Barcelona.jpg'))} style={{ height: 250, width: 250, borderRadius: 125, borderWidth: 3, borderColor: theme.colors.accent, alignSelf: 'center', marginTop: 15}} />
      <Paragraph style={{alignSelf:'center', margin: 20}}>
        {t('aboutUs.description')}
        {/* <Trans i18nKey={"aboutUs.description"}>
        {{jimenaLink: Linking.openURL(t('jimenaLink')), oliverLink: Linking.openURL(t('oliverLink')), goaliathLink: Linking.openURL(t('goaliathLink'))}}
        </Trans> */}
      </Paragraph>
    </View>
  )
})

export default AboutUsScreen;