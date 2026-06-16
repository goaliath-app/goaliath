/* TODO: future work
  
  ---- MORE BOX STATES ----
  ATM there are 4 possible states for each day box:
    * If there is no log for that day: grey border
    * If there is log but it has not been "touched": grey fill
    * The activity is not completed but something has been done: light green fill
    * The activity is completed: dark green fill
  It would be nice to have different shades of green if the activity is closer
  from completion, based on its dedicated time or reps.  

  ---- Generalize the CalendarHeatmap component ----
  So it can be published as a standalone component.
  * Remove the hardcoded "if there is no data for that day, add a border" logic.
  * Remove the calls to useTranslation and add another way to add localization.
  * Review the entire component and sub-components to see if there is something
     more to be generalized or improved.
  * Bonus: add more customization props:
      - Use user defined week column, day box or label components instead of the
       default ones.
      - Let users pass a function to calculate the day box props based on the
       data point for that day.
      - Add a style prop to the daybox that overrides its inner view style.

  */

import React from 'react';
import { useSelector } from 'react-redux'
import { selectAllActivityEntries, selectActivityById, getTodaySelector, selectAllActivities } from './../redux'
import { View, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'
import { getDayActivityCompletionRatio } from './../activityHandler'
import { withTheme, Text } from 'react-native-paper'
import { deserializeDate } from '../time';

const ActivityCalendarHeatmap = withTheme(({ theme, activityId, goalId }) => {
  const colors = {
    values: [ theme.colors.heatmap1, theme.colors.heatmap2, theme.colors.heatmap3, theme.colors.heatmap4 ],
    skippedDayBackground: theme.colors.heatmapSkipped,
    emptyDayBackground: theme.colors.heatmapEmptyBackground,
    emptyDayBorder: theme.colors.heatmapEmptyBorder,
  }

  const state = useSelector((state) => state)
  const today = getTodaySelector(state)

  // populate activities array with all activities whose data we need to show
  const activities = []

  if(activityId != null) {
    activities.push(selectActivityById(state, activityId))
  }else if(goalId != null){
    activities.push(...selectAllActivities(state).filter(activity => activity.goalId == goalId))
  } else {
    activities.push(...selectAllActivities(state))
  }

  // generate object with dates as keys and list of that day entries as items
  const entriesByDate = {}

  activities.forEach(activity => {
    const entries = selectAllActivityEntries(state, activity.id)
    Object.keys(entries).forEach( entryDate => {
      if(entriesByDate[entryDate] == null) {
        entriesByDate[entryDate] = []
      }
      entriesByDate[entryDate].push(entries[entryDate])
    })
  })

  // transform the entriesByDate object into the data for the heatmap
  const data = Object.entries(entriesByDate).map( ([ key, value ]) => {
    const date = key, entries = value
    let totalCompletion = 0
    entries.forEach(entry => {
      totalCompletion += getDayActivityCompletionRatio(state, entry.id, deserializeDate(date))
    })
    const averageCompletion = totalCompletion / entries.length

    let strength, color
    if(averageCompletion == 0) {
      color = colors.skippedDayBackground
    }else{
      strength = averageCompletion
    }

    return { date: deserializeDate(date).toFormat('yyyy-MM-dd'), strength, color }
  })

  // calculate domain of days to show
  const domainStart = today.minus({months: 3})
  const domain = {
    start: domainStart.toFormat('yyyy-MM-dd'),
    end: today.toFormat('yyyy-MM-dd')
  }

  return (
    <CalendarHeatmap
      data={data}
      weekStart={1}
      domain={domain}
      emptyColor={colors.emptyDayBackground}
      colors={colors.values}
      borderColor={colors.emptyDayBorder}
    />
  )
})

export default ActivityCalendarHeatmap

export const CalendarHeatmap = withTheme(({
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
    NOTE: since the legend was added at the bottom of this component,
    we assume that the colors array has exactly 4 elements. To make it
    generic again, the legend should be improved.
  */
  colors = ['#9BE9A8', '#40C463', '#30A14E', '#216E39'],
  /*
    emptyColor: the color to be used for days without a value or with a
    value of 0.
  */
  emptyColor = '#EBEDF0',
  boxSize = 15,
  borderColor = '#EBEDF0',
  theme
}) => {
  const { t, i18 } = useTranslation()

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

  function getWeekLabel(week, monthNames){

    if(isInTheFirstWeekOfTheMonth(week.startDate)){
      const weekStartDateTime = DateTime.fromFormat(week.startDate, 'yyyy-MM-dd')
      const monthString = monthNames[weekStartDateTime.month]
      const dayString = weekStartDateTime.toFormat('d')
      return `${monthString} ${dayString}`
    }
    return ''
  }

  function isInTheFirstWeekOfTheMonth(date, weekStart){
    date = DateTime.fromFormat(date, 'yyyy-MM-dd')

    return date.diff(date.startOf('month'), 'days').days < 7
  }

  const dayNames = {
    0: t('units.dayNamesShort3.sunday'),
    1: t('units.dayNamesShort3.monday'),
    2: t('units.dayNamesShort3.tuesday'),
    3: t('units.dayNamesShort3.wednesday'),
    4: t('units.dayNamesShort3.thursday'),
    5: t('units.dayNamesShort3.friday'),
    6: t('units.dayNamesShort3.saturday'),
  }

  const monthNames = {
    1:  t('units.monthNamesShort.january'),
    2:  t('units.monthNamesShort.february'),
    3:  t('units.monthNamesShort.march'),
    4:  t('units.monthNamesShort.april'),
    5:  t('units.monthNamesShort.may'),
    6:  t('units.monthNamesShort.june'),
    7:  t('units.monthNamesShort.july'),
    8:  t('units.monthNamesShort.august'),
    9:  t('units.monthNamesShort.september'),
    10: t('units.monthNamesShort.october'),
    11: t('units.monthNamesShort.november'),
    12: t('units.monthNamesShort.december'),
  }

  const labelColumnLabels = [
    '',
    dayNames[(1 + weekStart) % 7],
    '',
    dayNames[(3 + weekStart) % 7],
    '',
    dayNames[(5 + weekStart) % 7],
    '',
  ] 

  return (
    <View style={{alignItems: 'center'}}>
      <View style={{alignItems: 'flex-end'}}>
        <View 
        style={{
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'row',
        }}
        >
          <LabelColumn size={boxSize} labels={labelColumnLabels} />
          {
            weekData.map(item => {
            const label = getWeekLabel(item, monthNames)
            return (
              <WeekColumn 
              data={dataDict} startDate={item.startDate} endDate={item.endDate} 
              weekStart={weekStart} emptyColor={emptyColor} boxSize={boxSize}
              label={label} borderColor={borderColor}
              />
              )
            })
          }
          </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10, marginRight: -5}}>
              <Text style={{marginHorizontal: 5}}>{t('stats.heapmapKeyLess')}</Text>
              <DayBox color={theme.colors.heatmapSkipped} size={boxSize}/>
              <DayBox color={colors[0]} size={boxSize}/>
              <DayBox color={colors[1]} size={boxSize}/>
              <DayBox color={colors[2]} size={boxSize}/>
              <DayBox color={colors[3]} size={boxSize}/>
            <Text style={{marginHorizontal: 5}}>{t('stats.heapmapKeyMore')}</Text>
        </View>
      </View>
    </View>
  )
})

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
  emptyColor,
  boxSize,
  label = '',
  borderColor,
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
    const border = dayData? false : true
    daysData.push({ color, border })
  }

  // fill days at the end of the week
  for ( let i = firstDaySlot + daysToShow; i < 7; i++) {
    daysData.push({
      color: 'transparent',
    })
  }

  return (
    <View>
      <HorizontalLabel size={boxSize} label={label} />
      <FlatList 
        data = {daysData}
        renderItem={({item}) =><DayBox borderColor={borderColor} color={item.color} size={boxSize} border={item.border} />}
      />
    </View>
  )
}

const DayBox = ({ color, size, border=false, borderColor='#EBEDF0' }) => {
  if(!color) {
    color = 'grey'
  }

  return (
    <View 
      style={{
        backgroundColor: color, 
        height: size,
        width: size,
        margin: 1,
        borderWidth: border?1:0,
        borderColor: borderColor,
      }}
    />
  )
}

const VerticalLabel = withTheme(({ theme, size, label }) => {
  return (
    <View 
      style={{
        height: size,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginVertical: 1,
        marginRight: 5,
      }}
    >
      <Text style={{fontSize: size*0.65, color: theme.colors.heatmapLabels}}>{label}</Text>
    </View>
  )
})

const LabelColumn = ({ size, labels }) => {
  return (
    <View 
      style={{
        alignItems: 'flex-start'
      }}
    >
      {/* one empy vertical label to properly align the labels to the days */}
      <VerticalLabel size={size} label={''} />  
      {
        labels.map(label => <VerticalLabel size={size} label={label} />)
      }
    </View>
  )
}

const HorizontalLabel = withTheme(({ theme, size, label }) => {
  return (
    <View 
      style={{
        height: size,
        width: size,
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <View style={{ position: 'absolute', height: size, width: 200, left: 2 }}>
        <Text ellipsizeMode='clip' numberOfLines={1} style={{fontSize: size*0.65, color: theme.colors.heatmapLabels}}>{label}</Text>
      </View>
    </View>
  )
})