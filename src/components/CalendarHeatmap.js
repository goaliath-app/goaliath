import React from 'react';
import { View, Text, Dimensions, FlatList } from 'react-native'
import { List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next'

// CUSTOM CALENDAR HEATMAP

export const CalendarHeatmap = ({
  /* data: array containing the data points 
      each data point is an object with keys:
      * date: a string date corresponding to the day of the data point.
        the format is: yyyy-mm-dd. Example: 1999-01-01 for the first of january
        of the year 1999.
      * value: a float number indicating the value to plot for that day. The
          color for this day will be calculated based on the value and the value
          of the rest of data points.
      * strength: a float number between 0 and 1 indicating the strength of 
          the color to be used. 0 is empty and 1 is full color. The color
          derived from this prop will override the color derived from the 
          value prop.
      * color: indicates the raw color to be used for this day. It will override
          value and strength props.
  */
  data,
  /* domain: the inclusive range of dates to show, expressed as string dates
    the format is: yyyy-mm-dd. Example: 1999-01-01 for the first of january
      of the year 1999. Example:
    { 
      start: '2010-01-01', 
      end: '2010-06-01' 
    }
  */
  domain,
  /* weekStart: an integer from 0 to 6 indicating witch day should the week start on.
    0 is sunday, 1 is monday, etc.
  */
  weekStart,
  /* 
    colors: a list of text representations of colors. Data points will be
    categorized in as many categories as colors based on its value, and each 
    category will be represented by a color. 
  */
  colors = ['#9BE9A8', '#40C463', '#30A14E', '#216E39'],
  /*
    emptyColor: the color to be used for days without a value or with a
    value of 0.
  */
  emptyColor = '#EBEDF0',
}) => {
  // sample data:
  data = [
    {date: '2021-10-07', color: 'red'},
    {date: '2021-10-08', strength: 0.2},
    {date: '2021-10-09', strength: 0.25},
    {date: '2021-10-10', strength: 0.5},
    {date: '2021-10-11', strength: 0.75},
    {date: '2021-10-12', strength: 1},
    {date: '2021-10-13', value: 10},
    {date: '2021-10-14', value: 7},
    {date: '2021-10-15', value: 3},
    {date: '2021-10-16', value: 1},
    {date: '2021-11-04'},
  ]
  weekStart = 1
  domain = { start: '2021-10-07', end: '2021-11-04' }

  // find max value in data
  let maxValue = 0
  data.forEach(point => {
    if(point.value && point.value > maxValue) {
      maxValue = point.value
    }
  })

  // normalize data point' values
  data.forEach(point => {
    if(point.value) {
      point.value = point.value / maxValue
    }
  })

  function getColor(value) {
    // find the color that corresponds to the value
    const numberOfColors = colors.length
    const colorIndex = value==1? numberOfColors-1 : Math.floor(value * numberOfColors)
    return colors[colorIndex]
  }
  
  // set point colors based on value and strength
  data.forEach(point => {
    if(!point.color){
      if(point.strength && point.strength > 0) {
        point.color = getColor(point.strength)
      }else if(point.value && point.value > 0) {
        point.color = getColor(point.value)
      }else{
        point.color = emptyColor
      }
    }
  })

  // transform data list into a dictionary with dates as keys
  const dataDict = {}

  data.forEach(d => {
    dataDict[d.date] = d
  })

  // calculate the number of weeks in domain
  const millisInADay = 1000 * 60 * 60 * 24;
  const millisInAWeek = millisInADay * 7;

  const domainStartDateTime = DateTime.fromFormat(domain.start, 'yyyy-MM-dd')
  const startDateWeekday = domainStartDateTime.weekday == 7 ? 0 : domainStartDateTime.weekday  // luxon dayOfWeek is 1-7, weekStart is 0-6
  let daysToFirstWeekStart = startDateWeekday - weekStart  
  daysToFirstWeekStart += daysToFirstWeekStart < 0 ? 7 : 0;

  const firstWeekStartDateTime = domainStartDateTime.minus({days: daysToFirstWeekStart})

  const domainEndDateTime = DateTime.fromFormat(domain.end, 'yyyy-MM-dd')

  const weekData = []

  for ( 
    // from the start of the first week
    let weekStart = firstWeekStartDateTime;
    // until it surpasses the end of the domain    
    weekStart <= domainEndDateTime; 
    // add a week to the weekStart
    weekStart = weekStart.plus({days: 7})
  ) {
    const weekEnd = weekStart.plus({days: 6})
    const endDate = weekEnd > domainEndDateTime ? domainEndDateTime : weekEnd;
    const startDate = weekStart > domainStartDateTime ? weekStart : domainStartDateTime;
    weekData.push({
      startDate: startDate.toFormat('yyyy-MM-dd'),
      endDate: endDate.toFormat('yyyy-MM-dd'),
    })
  }

  return (
    <View 
      style={{
        alignItems: 'center', 
        justifyContent: 'center',
      }}
    >
      <FlatList 
        horizontal={true}
        
        data = {weekData}
        renderItem={({item}) =><WeekColumn data={dataDict} startDate={item.startDate} endDate={item.endDate} weekStart={weekStart} emptyColor={emptyColor} />}
        />
    </View>
  )
}

const WeekColumn = ({ 
  /* 
    startDate, endDate: a date string in the format yyyy-mm-dd 
    defines which dates the column should show. These two dates have to be in 
    the same week, given the weekStart prop.
  */
  startDate, 
  endDate, 
  /* 
    weekStart: an integer from 0 to 6 indicating witch day should the week start on.
    0 is sunday, 1 is monday, etc.
  */
  weekStart,
  /* 
    data: a dictionary with dates as keys and data points as values. 
    the data points are objects with keys: { date, color } where date is the same
    as the key, and color is the string representation of a color 
  */
  data,
  emptyColor
}) => {
  const millisInADay = 1000 * 60 * 60 * 24;
  const daysToShow = DateTime.fromFormat(endDate, 'yyyy-MM-dd').diff(DateTime.fromFormat(startDate, 'yyyy-MM-dd'), ['days']).days + 1
  
  const startDateTime = DateTime.fromFormat(startDate, 'yyyy-MM-dd')
  let weekday = startDateTime.weekday == 7? 0 : startDateTime.weekday  // luxon dayOfWeek is 1-7, weekStart is 0-6
  let firstDaySlot = weekday - weekStart

  if (firstDaySlot < 0) {
    firstDaySlot += 7
  }

  const daysData = []

  // fill days at the beggining of the week
  for (let i = 0; i < firstDaySlot; i++) {
    daysData.push({
      color: 'transparent',
    })
  }

  for (let i = 0; i < daysToShow; i++) {
    const dayDateTime = DateTime.fromFormat(startDate, 'yyyy-MM-dd').plus({days: i})
    const dayDateString = dayDateTime.toFormat('yyyy-MM-dd')
    const dayData = data[dayDateString]
    const color = (dayData?.color) ? dayData.color : emptyColor
    daysData.push({color: color})
  }

  // fill days at the end of the week
  for ( let i = firstDaySlot + daysToShow; i < 7; i++) {
    daysData.push({
      color: 'transparent',
    })
  }

  return (
    <FlatList 
        
      data = {daysData}
      
      renderItem={({item}) =><DayBox color={item.color} />}
    />
  )
}

const DayBox = ({ color }) => {
  if(!color) {
    color = 'grey'
  }

  return (
    <View 
      style={{
        backgroundColor: color, 
        height: 10,
        width: 10,
        margin: 1,
      }}
    />
  )
}