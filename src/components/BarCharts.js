import React from 'react';
import { View, Text, Dimensions } from 'react-native'
import { List, Divider, FlatList, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectAllActivityEntries, selectEntryByActivityIdAndDate, getTodaySelector, selectDailyDurationById, getWeeklyStats, getPeriodStats } from './../redux'
import { DateTime } from 'luxon'
import SwitchSelector from "react-native-switch-selector";
import { GeneralColor } from "./../styles/Colors"

// Work in progress

import { 
  VictoryChart, VictoryBar, VictoryTheme, VictoryAxis, VictoryLabel
} from 'victory-native'


export const ActivityBarChartPicker = ({ activityId }) => {
  const [ show, setShow ] = React.useState('time')
  const [ period, setPeriod ] = React.useState('week')
  const [ date, setDate ] = React.useState(useSelector(getTodaySelector))

  const showOptions = [
    { label:'Time', value: 'time' },
    { label:'Repetitions', value: 'repetitions' },
    { label:'Completed', value: 'completions'}
  ]
  const periodOptions = [
    { label:'Week', value: 'week' },
    { label:'Month', value: 'month' },
  ]

  let title = "Stats";
  let dateOffset;  // value to move the date when pressing the buttons
  if(period == 'week'){
    title = date.startOf('week').toFormat('MMM d') + " - " + date.endOf('week').toFormat('MMM d') + "    " + date.endOf('week').toFormat('yyyy');
    dateOffset = {days: 7}
  }else if(period == 'month'){
    title = date.toFormat('MMMM yyyy')
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
        buttonColor={"#ECE0FD"}
        selectedColor='black'
      />
      <SwitchSelector
        options={showOptions}
        initial={0}
        borderRadius={0}
        height={35}
        onPress={value => setShow(value)}
        buttonColor={"#ECE0FD"}
        selectedColor='black'
      />
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14}}>
        <IconButton icon='chevron-left' size={20} onPress={() => setDate(date.minus(dateOffset))}/>
        <Text>{title}</Text>
        <IconButton icon='chevron-right' size={20} onPress={() => setDate(date.plus(dateOffset))}/>
      </View>
      <ActivityBarChart activityId={activityId} period={period} show={show} date={date}/>
    </View>
  )
}

// TODO: select the appropiate y time unit: (seconds, minutes or hours)
export const ActivityBarChart = ({
    activityId, 
    show,   // 'repetitions', 'time' or 'completions' 
    period,  // 'week', 'month'
    date,
  }) => {
    const today = date
    const state = useSelector(state => state)
    
    const data = [];
    let xLabel, yLabel, tickValues, tickFormat, yTickValues;

    // ----- TIME CHARTS -----
    if(show == 'time'){
      if(period == 'week'){
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          const duration = selectDailyDurationById(state, activityId, date)
          console.log('duration', duration)
          data.push({
            x: date.toJSDate(),
            y: duration.as('minutes')
          })
          xLabel = 'Date'
          yLabel = 'Minutes'
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          const { loggedTime } = getPeriodStats(state, date, date.plus({days: 6}), activityId)
          data.push({
            x: date.toJSDate(),
            y: loggedTime.as('minutes')
          })
        }
        xLabel = 'Week'
        yLabel = 'Minutes'
        tickValues = data.map(point => point.x)
        tickFormat = t => DateTime.fromJSDate(t).startOf('week').toFormat("d") + "-" + DateTime.fromJSDate(t).endOf('week').toFormat("d")
      }
    // ----- REPETITION CHARTS -----
    }else if(show == 'repetitions'){
      if(period == 'week'){
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          const entry = selectEntryByActivityIdAndDate(state, activityId, date)
          const repetitions = entry?.repetitions? entry.repetitions.length : 0
          data.push({
            x: date.toJSDate(),
            y: repetitions
          })
          xLabel = 'Date'
          yLabel = 'Repetitions'
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          const { repetitionsCount } = getPeriodStats(state, date, date.plus({days: 6}), activityId)
          data.push({
            x: date.toJSDate(),
            y: repetitionsCount
          })
          xLabel = 'Week'
          yLabel = 'Repetitions'
        }
        tickValues = data.map(point => point.x)
        tickFormat = t => DateTime.fromJSDate(t).startOf('week').toFormat("d") + "-" + DateTime.fromJSDate(t).endOf('week').toFormat("d")
      }
    // ----- COMPLETION CHARTS -----
    }else if(show == 'completions'){
      if(period == 'week'){
        yTickValues = [0, 1]
        for(let date = today.startOf('week'); date <= today.endOf('week'); date = date.plus({days: 1})) {
          const entry = selectEntryByActivityIdAndDate(state, activityId, date)
          const value = entry?.completed? 1 : 0
          data.push({
            x: date.toJSDate(),
            y: value
          })
          xLabel = 'Date'
          yLabel = 'Completed'
          tickValues = data.map(point => point.x)
          tickFormat = t => DateTime.fromJSDate(t).toFormat("d")
        }
      }else if(period == 'month'){
        for(
          let date = today.startOf('month'); 
          date <= today.endOf('month'); 
          date = date.plus({days: 7})
        ) {
          const { daysDoneCount } = getPeriodStats(state, date, date.plus({days: 6}), activityId)
          data.push({
            x: date.toJSDate(),
            y: daysDoneCount
          })
          xLabel = 'Week'
          yLabel = 'Completions'
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

    console.log('today', today)
    console.log('data', data)

    return <VictoryBarChart 
      data={data} 
      xLabel={xLabel} 
      yLabel={yLabel} 
      tickValues={tickValues} 
      tickFormat={tickFormat} 
      yTickValues={yTickValues} 
    />
}

const VictoryBarChart = ({ data, xLabel, yLabel, tickValues, tickFormat, yTickValues }) => {
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
        axisLabelComponent={<VictoryLabel dy={20} />}
      />
      <VictoryAxis 
        tickValues={yTickValues}
        dependentAxis={true} 
        label={yLabel}
        axisLabelComponent={<VictoryLabel dy={-30} />}
      />
      <VictoryBar
        style={{ data: { fill: "#c43a31" } }}
        alignment="middle"
        data={data}
        barRatio={0.6}
      />
    </VictoryChart>
  )
}