import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { Title, Paragraph, Button } from 'react-native-paper'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { useTranslation } from 'react-i18next'
import { Header } from '../components';
import { getTodayTime, getPreferedExpression, getToday, extractActivityList } from '../util'
import { CalendarColor, GeneralColor } from '../styles/Colors';

function overviewLog(state, day, t){
  const activityList = extractActivityList(state, day)
  let completedActivities = 0
  let undoneActivities = 0
  let secondsDedicated = 0
  let secondsLeft = 0
  for(let entry of activityList){
    if(entry.archived){
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
  const timeDedicated = getPreferedExpression(secondsDedicated, t)
  const timeLeft = getPreferedExpression(secondsLeft, t)
  return { 
    completedActivities,
    undoneActivities,
    timeDedicated,  // time are objects { expression, unit }
    timeLeft,
  }
}

const CalendarScreen = ({ navigation, state }) => {
  const dayStartHour = state.settings.dayStartHour
  const today = getToday(dayStartHour).toFormat('yyyy-MM-dd')
  
  const [ selectedDate, setSelectedDate ] = React.useState(today)
  
  const { t, i18n } = useTranslation()

  // locale config for teh calendar component
  LocaleConfig.locales['all'] = {
    monthNames: [t('units.monthNames.january'),t('units.monthNames.february'),t('units.monthNames.march'),t('units.monthNames.april'),t('units.monthNames.may'),t('units.monthNames.june'),t('units.monthNames.july'),t('units.monthNames.august'),t('units.monthNames.september'),t('units.monthNames.october'),t('units.monthNames.november'),t('units.monthNames.december')],
    monthNamesShort: [t('units.monthNamesShort.january'),t('units.monthNamesShort.february'),t('units.monthNamesShort.march'),t('units.monthNamesShort.april'),t('units.monthNamesShort.may'),t('units.monthNamesShort.june'),t('units.monthNamesShort.july'),t('units.monthNamesShort.august'),t('units.monthNamesShort.september'),t('units.monthNamesShort.october'),t('units.monthNamesShort.november'),t('units.monthNamesShort.december')],
    dayNames: [t('units.dayNames.sunday'),t('units.dayNames.monday'),t('units.dayNames.tuesday'),t('units.dayNames.wednesday'),t('units.dayNames.thursday'),t('units.dayNames.friday'),t('units.dayNames.saturday')],
    dayNamesShort: [t('units.dayNamesShort3.sunday'),t('units.dayNamesShort3.monday'),t('units.dayNamesShort3.tuesday'),t('units.dayNamesShort3.wednesday'),t('units.dayNamesShort3.thursday'),t('units.dayNamesShort3.friday'),t('units.dayNamesShort3.saturday')],
    today: t('today.headerTitle')
  };
  LocaleConfig.defaultLocale = 'all';
  
  const markedDates = (
    selectedDate? {
      [today]: {
        customStyles: {
          text: {
            color: CalendarColor.selectedDate,
          }
        }
      },
      [selectedDate]: {selected: true},
    }
    :
    {}
  )
  
  const selectedDateTime = DateTime.fromFormat(selectedDate, 'yyyy-MM-dd')
  const dateLabel = `${selectedDateTime.day} ${t('units.monthNames.'+selectedDateTime.toFormat('MMMM').toLowerCase())} ${selectedDateTime.year}`
  const { 
    completedActivities,
    undoneActivities,
    timeDedicated,
    timeLeft
  } = overviewLog(state, selectedDateTime, t)

  return (
    <View style={{
      flex: 1, 
      backgroundColor: GeneralColor.screenBackground, 
      justifyContent: 'space-between'
    }}>
      <View>
        <Header title={t('calendar.headerTitle')} left='hamburger' navigation={navigation}/>
        <Calendar
          onDayPress={(day) => {setSelectedDate(day.dateString)}}
          // Replace default arrows with custom ones (direction can be 'left' or 'right')
          renderArrow={(direction) => (
            <FontAwesomeIcon 
              icon={direction=='left'?faChevronLeft:faChevronRight} 
              color={CalendarColor.iconChevron}
            />
          )}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}
          markingType={'custom'}
          markedDates={markedDates}
          theme={{
            todayTextColor: CalendarColor.todayTextColor
          }}
        />
      </View>
      <View style={{marginLeft: 24, marginRight: 25}}>
        <Title>{dateLabel}</Title>
        <Paragraph>
          {t('calendar.stats', 
            { 
              completedActivities, 
              timeDedicatedValue: timeDedicated.value, 
              timeDedicatedUnit: timeDedicated.localeUnit, 
              undoneActivities, 
              timeLeftValue: timeLeft.value, 
              timeLeftUnit: timeLeft.localeUnit 
            }
          )}
        </Paragraph>
        <Button 
          mode="contained" 
          style={{marginBottom: 20, marginTop: 14}} 
          onPress={
            () => { 
              const dateTime = DateTime.fromFormat(selectedDate, 'yyyy-M-d')
              console.log('date to todayscreen', dateTime.toISO())
              navigation.navigate('DayInCalendar', { isoDate: dateTime.toISO()})
            }
            //oldfunction ====> navigation.navigate('DayInCalendar', {day: selectedDate})
          }
        >
          {t('calendar.openDayButton')}
        </Button>
      </View>
    </View>
  );
}

const mapStateToProps = (state) => ({ state })

const actionsToProps = {
}

export default connect(mapStateToProps, actionsToProps)(CalendarScreen)
