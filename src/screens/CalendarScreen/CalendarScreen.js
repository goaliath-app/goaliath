import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native'
import { Text, Title, Subheading, Paragraph, Headline, Caption, Button } from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { selectLogEntities, selectActivityEntities } from '../../redux'
import { Header } from '../../components';
import { getTodayTime, getPreferedExpression, getToday } from '../../util'

const CalendarScreen = ({ navigation, logs, activities, dayStartHour }) => {
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
  const selectedDayLog = logs[dateTime.toISO()]
  const dateLabel = dateTime.toFormat("d MMMM yyyy")
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
  const timeDedicated = getPreferedExpression(secondsDedicated)
  const timeLeft = getPreferedExpression(secondsLeft)
  return (
    <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'space-between'}}>
      <View>
        <Header title='Calendar' left='hamburger' navigation={navigation}/>
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
        <Paragraph>{`${completedActivities} tasks done, ${timeDedicated.value} ${timeDedicated.unit} dedicated\n${undoneActivities} task undone, ${timeLeft.value} ${timeLeft.unit} left`}</Paragraph>
        <Button mode="contained" style={{marginBottom: 20, marginTop: 14}} onPress={
          () => navigation.navigate('DayInCalendar', {day: DateTime.fromFormat(selectedDate, 'yyyy-MM-dd')})
        }>Open day</Button>
      </View>
    </View>
  );
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  return {logs: selectLogEntities(state), activities: selectActivityEntities(state), dayStartHour}
}

const actionsToProps = {
}

export default connect(mapStateToProps, actionsToProps)(CalendarScreen)
