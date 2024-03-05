import React from 'react';
import { View } from 'react-native'
import { withTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { InfoCard } from '../../components';
import { Paragraph, Text } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';


export const EmptyPastWarning = () => {
  const { t, i18n } = useTranslation()

  return (
    <InfoCard
      title={t("dayContent.emptyPastWarningTitle")}
      paragraph={t("dayContent.emptyPastWarningSubtitle")}
    />
  )
}

export const FutureWarning = () => {
  const { t, i18n } = useTranslation()

  return (
      <InfoCard
        title={t("dayContent.futureWarningTitle")}
        paragraph={t("dayContent.futureWarningSubtitle")}
      />
  )
}

export const NoActivitiesWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.noActivitiesInfoCard.title')}
        extraContent={
          <Paragraph style={{overflow: 'visible'}}>
            <Text>{t('today.noActivitiesInfoCard.contentBeforeIcon')}</Text>
            {/* If you know a better way of properly aligning the icon to
            the text, PLEASE let me know (already tried all the obviuous
            ways I knew) */}
            <View style={{width: 20, alignItems: 'center'}}>
              <View style={{position: 'absolute', top: -13}}>
                <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} />
              </View>
            </View>
            <Text>{t('today.noActivitiesInfoCard.contentAfterIcon')}</Text>
          </Paragraph>}
          // This is not properly aligned:
          // extraContent={<Paragraph style={{overflow: 'visible'}}>Go to the Goals <FontAwesomeIcon icon={faTrophy} size={16} color={theme.colors.onSurface} /> section to plan your daily actions</Paragraph>}
      />
    </View>
  )
})

export const NoActiveActivitiesWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.noActiveActivitiesInfoCard.title')}
        paragraph={t('today.noActiveActivitiesInfoCard.content')} />
    </View>
  )
})

export const NothingForTodayWarning = withTheme(({ theme }) => {
  const { t, i18n } = useTranslation()

  return (
    <View style={{backgroundColor: theme.colors.infoCardViewBackground}}>
      <InfoCard title={t('today.nothingForTodayInfoCard.title')}
        paragraph={t('today.nothingForTodayInfoCard.content')} />
    </View>
  )
})
