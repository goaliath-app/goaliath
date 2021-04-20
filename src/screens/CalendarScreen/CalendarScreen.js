import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { Text, Title, Subheading, Paragraph, Headline, Caption, Button } from 'react-native-paper'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { selectLogEntities, selectActivityEntities, selectGoalEntities } from '../../redux'
import { Header } from '../../components';
import { getTodayTime, getPreferedExpression, getToday, dueToday } from '../../util'
import { useTranslation } from 'react-i18next'

function overviewLog(dateTime, logs, activities, goals, dayStartHour, t){
  const today = getToday(dayStartHour)
  // day to overview is past or present
  if(dateTime <= today){
    const selectedDayLog = logs[dateTime.toISO()]
    let completedActivities = 0
    let undoneActivities = 0
    let secondsDedicated = 0
    let secondsLeft = 0
    if(selectedDayLog){
      for(let entryId in selectedDayLog.entries.entities){
        const entry = {...activities[entryId], ...selectedDayLog.entries.entities[entryId]}
        if(entry.archived || entry.repeatMode=='weekly'){
          continue
        }
        if(entry.completed){
          completedActivities += 1
        }else{
          undoneActivities += 1
        }
        const activityTime = getTodayTime(entry.intervals).as('seconds')
        secondsDedicated += activityTime
        if(entry.timeGoal && entry.timeGoal > activityTime && !entry.completed){
          secondsLeft += entry.timeGoal - activityTime
        }
      }
    }
    const timeDedicated = getPreferedExpression(secondsDedicated, t)
    const timeLeft = getPreferedExpression(secondsLeft, t)
    return { 
      completedActivities,
      undoneActivities,
      timeDedicated,  // time are objects { expression, unit }
      timeLeft,
    }
    // day to overview is future
  }else{
    return predictOverview(dateTime, activities, goals, dayStartHour, t)
  }
}

function predictOverview(dateTime, activities, goals, dayStartHour, t){
  const completedActivities = 0
  const timeDedicated = { value: 0, unit: 'seconds' }
  let undoneActivities = 0
  let secondsLeft = 0
  
  for(let activityId in activities){
    const activity = activities[activityId]
    const goal = goals[activity.goalId]
    
    if(dueToday(dateTime, activity, goal)){
      if(activity.repeatMode=='weekly'){
        continue
      }
      undoneActivities += 1
      if(activity.goal=='time'){
        secondsLeft += activity.timeGoal
      }
    }
  }
  
  const timeLeft = getPreferedExpression(secondsLeft, t)
  
  return { 
    completedActivities,
    undoneActivities,
    timeDedicated,  // time are objects { value, unit }
    timeLeft,
  }
}

const CalendarScreen = ({ navigation, logs, activities, goals, dayStartHour }) => {
  
  const { t, i18n } = useTranslation()

  LocaleConfig.locales['all'] = {
    monthNames: [t('units.monthNames.january'),t('units.monthNames.february'),t('units.monthNames.march'),t('units.monthNames.april'),t('units.monthNames.may'),t('units.monthNames.june'),t('units.monthNames.july'),t('units.monthNames.august'),t('units.monthNames.september'),t('units.monthNames.october'),t('units.monthNames.november'),t('units.monthNames.december')],
    monthNamesShort: [t('units.monthNamesShort.january'),t('units.monthNamesShort.february'),t('units.monthNamesShort.march'),t('units.monthNamesShort.april'),t('units.monthNamesShort.may'),t('units.monthNamesShort.june'),t('units.monthNamesShort.july'),t('units.monthNamesShort.august'),t('units.monthNamesShort.september'),t('units.monthNamesShort.october'),t('units.monthNamesShort.november'),t('units.monthNamesShort.december')],
    dayNames: [t('units.dayNames.sunday'),t('units.dayNames.monday'),t('units.dayNames.tuesday'),t('units.dayNames.wednesday'),t('units.dayNames.thursday'),t('units.dayNames.friday'),t('units.dayNames.saturday')],
    dayNamesShort: [t('units.dayNamesShort3.sunday'),t('units.dayNamesShort3.monday'),t('units.dayNamesShort3.tuesday'),t('units.dayNamesShort3.wednesday'),t('units.dayNamesShort3.thursday'),t('units.dayNamesShort3.friday'),t('units.dayNamesShort3.saturday')],
    today: t('today.headerTitle')
  };
  LocaleConfig.defaultLocale = 'all';
  
  const today = getToday(dayStartHour).toFormat('yyyy-MM-dd')
  const [ selectedDate, setSelectedDate ] = React.useState(today)
  const markedDates = (
    selectedDate? {
      [today]: {
        customStyles: {
          text: {
            color: 'blue',
          }
        }
      },
      [selectedDate]: {selected: true},
    }
    :
    {}
  )
  
  const dateTime = DateTime.fromFormat(selectedDate, 'yyyy-MM-dd')
  const dateLabel = `${dateTime.day} ${t('units.monthNames.'+dateTime.toFormat('MMMM').toLowerCase())} ${dateTime.year}`
  const { 
    completedActivities,
    undoneActivities,
    timeDedicated,
    timeLeft
  } = overviewLog(dateTime, logs, activities, goals, dayStartHour, t)

  return (
    <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'space-between'}}>
      <View>
        <Header title={t('calendar.headerTitle')} left='hamburger' navigation={navigation}/>
        <Calendar
          onDayPress={(day) => {setSelectedDate(day.dateString)}}
          // Replace default arrows with custom ones (direction can be 'left' or 'right')
          renderArrow={(direction) => (
            <FontAwesomeIcon icon={direction=='left'?faChevronLeft:faChevronRight} color='#BBBBBB'/>
          )}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}
          markingType={'custom'}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#2d4150'
          }}
        />
      </View>
      <View style={{marginLeft: 24, marginRight: 25}}>
        <Title>{dateLabel}</Title>
        <Paragraph>{t('calendar.stats', 
          { completedActivities, timeDedicatedValue: timeDedicated.value, timeDedicatedUnit: timeDedicated.localeUnit, undoneActivities, timeLeftValue: timeLeft.value, timeLeftUnit: timeLeft.localeUnit })
        }</Paragraph>
        <Button mode="contained" style={{marginBottom: 20, marginTop: 14}} onPress={
          () => navigation.navigate('DayInCalendar', {day: selectedDate})
        }>{t('calendar.openDayButton')}</Button>
      </View>
    </View>
  );
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  return {
    logs: selectLogEntities(state), 
    activities: selectActivityEntities(state),
    goals: selectGoalEntities(state), 
    dayStartHour
  }
}

const actionsToProps = {
}

export default connect(mapStateToProps, actionsToProps)(CalendarScreen)
