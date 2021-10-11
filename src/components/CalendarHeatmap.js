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
}) => {
  // sample data:
  data = [
    {date: '2021-10-04', color: 'red'},
    {date: '2021-11-04', color: 'red'},
  ]
  weekStart = 1
  domain = { start: '2021-10-07', end: '2021-11-04' }

  // transform data list into a dictionary with dates as keys
  const dataDict = {}

  data.forEach(d => {
    dataDict[d.date] = d
  })

  // calculate the number of weeks in domain
  const millisInADay = 1000 * 60 * 60 * 24;
  const millisInAWeek = millisInADay * 7;
  const millisInDomain = new Date(domain.end) - new Date(domain.start);
  const weeksInDomain = millisInDomain / millisInAWeek;

  let daysToFirstWeekStart = new Date(domain.start).getDay() - weekStart;
  daysToFirstWeekStart += daysToFirstWeekStart < 0 ? 7 : 0;
  const fistWeekStartDate  = new Date(new Date(domain.start).getTime() - daysToFirstWeekStart * millisInADay);

  const weekData = []

  for ( 
    // from the start of the first week
    let weekStart = new Date(fistWeekStartDate); 
    // until it surpasses the end of the domain    
    weekStart <= new Date(domain.end); 
    // add a week to the weekStart
    weekStart.setTime(weekStart.getTime() + millisInAWeek) 
  ) {
    const weekEnd = new Date(weekStart.getTime() + millisInAWeek - millisInADay);
    const endOfDomain = new Date(domain.end);
    const startOfDomain = new Date(domain.start);
    const endDate = weekEnd > endOfDomain ? endOfDomain : weekEnd;

    const startDate = weekStart > startOfDomain ? weekStart : startOfDomain;

    weekData.push({
      startDate: startDate.toISOString().slice(0,10),
      endDate: endDate.toISOString().slice(0,10),
    })
  }

  return (
    <View 
      style={{
        alignItems: 'center', 
        justifyContent: 'center'
      }
    }>
      <FlatList 
        horizontal={true}
        
        data = {weekData}
        // data = {[
        //   {startDate: '2021-10-05', endDate: '2021-10-09'},
        // ]}
        
        renderItem={({item}) =><WeekColumn data={dataDict} startDate={item.startDate} endDate={item.endDate} weekStart={weekStart} />}
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
  data 
}) => {
  const millisInADay = 1000 * 60 * 60 * 24;
  const daysToShow = (new Date(endDate) - new Date (startDate)) / millisInADay + 1
  
  let firstDaySlot = new Date(startDate).getDay() - weekStart
  if (firstDaySlot < 0) {
    firstDaySlot += 7
  }

  const daysData = []

  // fill days at the beggining of the week
  for (let i = 0; i < firstDaySlot; i++) {
    daysData.push({
      color: 'pink',
    })
  }

  for (let i = 0; i < daysToShow; i++) {
    const dayDate = new Date(new Date(startDate).getTime() + i * millisInADay)
    const dayDateString = dayDate.toISOString().slice(0,10)
    const dayData = data[dayDateString]
    const color = (dayData?.color) ? dayData.color : 'grey'
    daysData.push({color: color})
  }

  // fill days at the end of the week
  for ( let i = firstDaySlot + daysToShow; i < 7; i++) {
    daysData.push({
      color: 'pink',
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