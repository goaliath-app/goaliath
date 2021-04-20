import React from 'react';
import { View } from 'react-native'
import { List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

// Work in progress

const GenericStats = () => {
  const { t, i18n } = useTranslation()

  return(
    <View>
      <List.Item title={t('stats.genericStats.title')} />
      <List.Item
        left={() => <List.Icon icon="clock-outline" />}
        title={data.hours + t('stats.genericStats.hoursDedicated')}
      />
      <List.Item
        left={() => <List.Icon icon="check-circle-outline" />}
        title={data.times + t('stats.genericStats.daysCompleted')}
      />
      <Divider />
    </View>
  )
}

const WeekStats = () => {
  const { t, i18n } = useTranslation()
  return (
  <View>
    <List.Item title={t('stats.genericStats.title')} />
    <List.Item
    left={() => <List.Icon icon="clock-outline" />}
    title={data.weekHours + t('stats.weekStats.hoursDedicated')}
    />
    <List.Item
    left={() => <List.Icon icon="check-circle-outline" />}
    title={data.weekTimes + t('stats.weekStats.daysCompleted')}
    />
    <Divider />
  </View>
  )
}

export { GenericStats, WeekStats }