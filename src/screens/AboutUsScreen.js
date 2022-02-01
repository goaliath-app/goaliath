import React from 'react';
import { Image, Linking, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { Paragraph, Text, withTheme } from 'react-native-paper';

const AboutUsScreen = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  
  return(
    <View style={{backgroundColor: theme.colors.aboutUsScreenBackground, flex: 1}}>
      <Header title={t('aboutUs.title')} left={'back'} navigation={navigation} />
      <Image source={(require('../../assets/Barcelona.jpg'))} style={{ height: 250, width: 250, borderRadius: 125, borderWidth: 3, borderColor: theme.colors.imageBorder, alignSelf: 'center', marginTop: 15}} />
      <Paragraph style={{marginHorizontal: 20, marginTop: 40}}>
        {t('aboutUs.description')}
      </Paragraph>
      <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 5, alignItems: 'center'}}>
        <Text>
          {t('aboutUs.jimena')}
        </Text>
        <Text style={{ color: theme.colors.links}} onPress={() => Linking.openURL(t('aboutUs.jimenaLink'))}>
          {t('aboutUs.jimenaLink')}
        </Text>
      </View>
      <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, alignItems: 'center'}}>
        <Text>
          {t('aboutUs.oliver')}
        </Text>
        <Text style={{ color: theme.colors.links}} onPress={() => Linking.openURL(t('aboutUs.oliverLink'))}>
          {t('aboutUs.oliverLink')}
        </Text>
      </View>
      <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, alignItems: 'center'}}>
        <Text>
          {t('aboutUs.goaliath')}
        </Text>
        <Text style={{ color: theme.colors.links}} onPress={() => Linking.openURL(t('aboutUs.goaliathLink'))}>
          {t('aboutUs.goaliathLink')}
        </Text>
      </View>
      
    </View>
  )
})

export default AboutUsScreen;