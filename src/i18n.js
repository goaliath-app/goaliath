import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './Translations/english'
import es from './Translations/spanish'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es
    },
    lng: Localization.locale,
    keySeparator: '.',
    interpolation: {
      escapeValue: false
    }
})

export default i18n;



    
