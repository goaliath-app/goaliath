import React from 'react';
import { Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { Paragraph, withTheme } from 'react-native-paper';

const AboutUsScreen = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  
  return(
    <View>
      <Header title={t('aboutUs.title')} left={'back'} navigation={navigation} />
      <Image source={(require('../../assets/Barcelona.jpg'))} style={{ height: 250, width: 250, borderRadius: 125, borderWidth: 3, borderColor: theme.colors.accent, alignSelf: 'center', marginTop: 15}} />
      <Paragraph style={{alignSelf:'center'}}> 
        Somos super GUAYS!
      </Paragraph>
    </View>
  )
})

export default AboutUsScreen;