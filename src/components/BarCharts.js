import React from 'react';
import { View, Text, Dimensions } from 'react-native'
import { List, Divider, FlatList, IconButton,withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectActivityById, selectEntryByActivityIdAndDate, getTodaySelector, selectDailyDurationById, selectAllActivities, getPeriodStats } from './../redux'
import { DateTime } from 'luxon'
import SwitchSelector from "react-native-switch-selector";
import Duration from 'luxon/src/duration.js'

// Work in progress

import { 
  VictoryChart, VictoryBar, VictoryTheme, VictoryAxis, VictoryLabel
} from 'victory-native'


export const ActivityBarChartPicker = withTheme(({ theme, activityId, goalId }) => {
  const { t, i18n } = useTranslation()

  const [ show, setShow ] = React.useState('time')
  const [ period, setPeriod ] = React.useState('week')
  const [ date, setDate ] = React.useState(useSelector(getTodaySelector))

  const showOptions = [
    { label:t("barchart.time"), value: 'time' },
    { label:t("barchart.repetitions"), value: 'repetitions' },
    { label:t("barchart.completed"), value: 'completions'}
  ]
  const periodOptions = [
    { label:t("barchart.week"), value: 'week' },
    { label:t("barchart.month"), value: 'month' },
  ]

  let title = "Stats";
  let dateOffset;  // value to move the date when pressing the buttons
  if(period == 'week'){
    const weekStartMonthLabel = t('units.monthNamesShort.' + date.startOf('week').toFormat('LLLL').toLowerCase())
    const weekEndMonthLabel = t('units.monthNamesShort.' + date.endOf('week').toFormat('LLLL').toLowerCase())
    title = `${weekStartMonthLabel} ${date.startOf('week').toFormat('d')} - ${weekEndMonthLabel} ${date.endOf('week').toFormat('d')}    ${date.endOf('week').toFormat('yyyy')}`
    dateOffset = {days: 7}
  }else if(period == 'month'){
    const monthLabel = t('units.monthNames.' + date.toFormat('LLLL').toLowerCase())
    title = monthLabel + " " + date.toFormat('yyyy')
    dateOffset = {months: 1}
  }

  return (
    <View>
      <SwitchSelector
        options={periodOptions}
        initial={0}
        onPress={value => setPeriod(value)}
        borderRadius={0}
        height={35}
        buttonColor={theme.colors.barChartSelectorSelectedBackground}
        selectedColor={theme.colors.barChartSelectorSelectedText}
        backgroundColor={theme.colors.barChartSelectorBackground}
        textColor={theme.colors.barChartSelectorText}
      />
      <SwitchSelector
        options={showOptions}
        initial={0}
        borderRadius={0}
        height={35}
        onPress={value => setShow(value)}
        buttonColor={theme.colors.barChartSelectorSelectedBackground}
        selectedColor={theme.colors.barChartSelectorSelectedText}
        backgroundColor={theme.colors.barChartSelectorBackground}
        textColor={theme.colors.barChartSelectorText}
      />
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14}}>
        <IconButton icon='chevron-left' size={20} color={theme.colors.barChartsChevron} onPress={() => setDate(date.minus(dateOffset))} style={{ height: 48, width: 48 }} />
        <Text style={{ color: theme.colors.barChartLabels }}>{title}</Text>
        <IconButton icon='chevron-right' size={20} color={theme.colors.barChartsChevron} onPress={() => setDate(date.plus(dateOffset))} style={{ height: 48, width: 48 }}/>
      </View>
      <ActivityBarChart activityId={activityId} goalId={goalId} period={period} show={show} date={date}/>
    </View>
  )
})

// TODO: select the appropiate y time unit: (seconds, minutes or hours)
export const ActivityBarChart = ({
    activityId, 
    goalId,
    show,   // 'repetitions', 'time' or 'completions' 
    period,  // 'week', 'month'
    date,
  }) => {

    const { t } = useTranslation()

    const today = date
    const state = useSelector(state => state)

    const activities = []
    if(activityId != null){
      activities.push(selectActivityById(state, activityId))
    }else if(goalId != null){
      activities.push(...selectAllActivities(state).filter(activity => activity.goalId == goalId))
    }else{
      activities.push(...selectAllActivities(state))
    }
    
    const data = [];
    let xLabel, yLabel, tickValues, tickFormat, yTickValues;

    // ----- TIME CHARTS -----
    if(show == 'time'){
      if(period == 'week'){
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          let duration = Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
          activities.forEach(activity => {
            duration = duration.plus(selectDailyDurationById(state, activity.id, date))
          })
          data.push({
            x: date.toJSDate(),
            y: duration.as('minutes')
          })
          xLabel = t('barchart.date')
          yLabel = t('barchart.minutes')
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          let duration = Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
          activities.forEach(activity => {
            const { loggedTime } = getPeriodStats(state, date, date.plus({days: 6}), activity.id)
            duration = duration.plus(loggedTime)
          })
          data.push({
            x: date.toJSDate(),
            y: duration.as('minutes')
          })
        }
        xLabel = t('barchart.week')
        yLabel = t('barchart.minutes')
        tickValues = data.map(point => point.x)
        tickFormat = t => DateTime.fromJSDate(t).startOf('week').toFormat("d") + "-" + DateTime.fromJSDate(t).endOf('week').toFormat("d")
      }
    // ----- REPETITION CHARTS -----
    }else if(show == 'repetitions'){
      if(period == 'week'){
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          let repetitions = 0
          activities.forEach(activity => {
            const entry = selectEntryByActivityIdAndDate(state, activity.id, date)
            repetitions += entry?.repetitions? entry.repetitions.length : 0
          })
            
          data.push({
            x: date.toJSDate(),
            y: repetitions
          })
          xLabel = t('barchart.date')
          yLabel = t('barchart.repetitions')
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          let repetitions = 0
          activities.forEach(activity => {
            const { repetitionsCount } = getPeriodStats(state, date, date.plus({days: 6}), activity.id)
            repetitions += repetitionsCount
          })
            
          data.push({
            x: date.toJSDate(),
            y: repetitions
          })
          xLabel = t('barchart.week')
          yLabel = t('barchart.repetitions')
        }
        tickValues = data.map(point => point.x)
        tickFormat = t => DateTime.fromJSDate(t).startOf('week').toFormat("d") + "-" + DateTime.fromJSDate(t).endOf('week').toFormat("d")
      }
    // ----- COMPLETION CHARTS -----
    }else if(show == 'completions'){
      if(period == 'week'){
        if(activities.length == 1){
          yTickValues = [0, 1]
        }
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          let completions = 0
          activities.forEach(activity => {
            const entry = selectEntryByActivityIdAndDate(state, activity.id, date)
            completions += entry?.completed? 1 : 0
          })
            
          data.push({
            x: date.toJSDate(),
            y: completions
          })
          xLabel = t('barchart.date')
          yLabel = t('barchart.completed')
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          let completions = 0
          activities.forEach(activity => {
            const { daysDoneCount } = getPeriodStats(state, date, date.plus({days: 6}), activity.id)
            completions += daysDoneCount
          })
            
          data.push({
            x: date.toJSDate(),
            y: completions
          })
          xLabel = t('barchart.week')
          yLabel = t('barchart.completed')
        }
        tickValues = data.map(point => point.x)
        tickFormat = t => DateTime.fromJSDate(t).startOf('week').toFormat("d") + "-" + DateTime.fromJSDate(t).endOf('week').toFormat("d")
      }
    }

    let thereArePositiveValues = false
    data.forEach(point => {
      if(point.y > 0) thereArePositiveValues = true
    })
    if(!thereArePositiveValues){
      yTickValues = [0]
    }


    return <VictoryBarChart 
      data={data} 
      xLabel={xLabel} 
      yLabel={yLabel} 
      tickValues={tickValues} 
      tickFormat={tickFormat} 
      yTickValues={yTickValues} 
    />
}

const VictoryBarChart = withTheme(({ theme, data, xLabel, yLabel, tickValues, tickFormat, yTickValues }) => {
  // VictoryBar has a problem: you need to set domainPadding so bars don't overflow the plot.
  // Here is a example on how to do it:
  // https://codesandbox.io/s/grouped-or-stacked-charts-0jh3h?file=/index.js:1166-1171


  return(
    <VictoryChart
      padding={{ top: 0, bottom: 50, left: 60, right: 30 }}
      height={230}
      theme={VictoryTheme.material}
      domainPadding={18}
      scale={{ x: 'time' }}
      >
      <VictoryAxis 
        crossAxis={true}
        tickValues={tickValues} 
        tickFormat={tickFormat} 
        label={xLabel}
        style={{tickLabels: {fill: theme.colors.barChartLabels}}}
        axisLabelComponent={<VictoryLabel dy={20} style={{fill: theme.colors.barChartLabels}} />}
      />
      <VictoryAxis 
        tickValues={yTickValues}
        dependentAxis={true} 
        label={yLabel}
        style={{tickLabels: {fill: theme.colors.barChartLabels}}}
        axisLabelComponent={<VictoryLabel dy={-30} style={{fill: theme.colors.barChartLabels}} />}
      />
      <VictoryBar
        style={{ data: { fill: theme.colors.barChartBar } }}
        alignment="middle"
        data={data}
        barRatio={0.6}
      />
    </VictoryChart>
  )
})