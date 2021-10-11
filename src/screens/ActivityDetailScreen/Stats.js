import React from 'react';
import { View, Text, Dimensions } from 'react-native'
import { List, Divider, FlatList } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

// Work in progress

import { 
  VictoryChart, VictoryBar, VictoryTheme
} from 'victory-native'

export const VictoryBarChart = () => {
  // VictoryBar has a problem: you need to set domainPadding so bars don't overflow the plot.
  // Here is a example on how to do it:
  // https://codesandbox.io/s/grouped-or-stacked-charts-0jh3h?file=/index.js:1166-1171
  const categories = {
    x: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  }
  
  const sampleData = [
    {x: 1, y: 1},
    {x: 2, y: 2},
    {x: 3, y: 3},
    {x: 4, y: 4},
  ]

  return(
    <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={18}
    >
      <VictoryBar
        categories={categories}
        style={{ data: { fill: "#c43a31" } }}
        data={sampleData}
        barRatio={0.6}
      />
    </VictoryChart>
  )
}
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