import React from 'react';
import { View, Pressable } from 'react-native'
import { connect } from 'react-redux';
import { Text, Subheading } from 'react-native-paper'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCalendarDay, faCalendarWeek, faSlash } from '@fortawesome/free-solid-svg-icons'
import { DateTime } from 'luxon'
import { selectEntriesByDay, selectActivityById, selectActivityEntities, selectGoalById } from '../../redux'
import { Header, ActivityList } from '../../components' 
import { extractActivityLists, dueToday, newEntry, getToday } from '../../util'
import { useTranslation } from 'react-i18next'
import { CalendarColor, GeneralColor } from '../../styles/Colors';

const DayInCalendarScreen = ({ navigation, dayActivities, weekActivities, day }) => {
  const [ viewMode, setViewMode ] = React.useState('day') // can be 'day' or 'week'

  const { t, i18n } = useTranslation()

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header title={day.toFormat("d MMMM yyyy")} left='back' navigation={navigation}/>
      <View style={{flexDirection: 'row', height: 48, justifyContent: 'space-between', alignItems: 'center'}}>
          <Subheading style={{paddingLeft: 16}}>
            {viewMode=='day'? t('dayInCalendar.dailyActivities'): t('dayInCalendar.weeklyActivities')}
          </Subheading>
          <Pressable onPress={() => {
            setViewMode(viewMode=='day'?'week':'day')
          }} >
            <View style={{flexDirection: 'row', paddingRight: 12, alignItems: 'center'}}>
                <FontAwesomeIcon icon={faCalendarDay} size={20} transform={{up: 10}} color={viewMode=='day'?CalendarColor.iconDayWeekFocused:CalendarColor.iconDayWeek}/>
                <Text style={{fontSize: 30, position: 'relative', top: 4, color: CalendarColor.iconDayWeek}}> / </Text>
                <FontAwesomeIcon icon={faCalendarWeek} size={20} color={viewMode=='week'?CalendarColor.iconDayWeekFocused:CalendarColor.iconDayWeek}/>
            </View>
          </Pressable>
      </View>
      <ActivityList data={viewMode=='day'?dayActivities:weekActivities} disabled={true} />
    </View>
  )
}

function predictEntries(state, day){
  let entries = []

  const activities = selectActivityEntities(state)
  for(let activityId in activities){
    const activity = activities[activityId]
    const goal = selectGoalById(state, activity.goalId)

    if(dueToday(day, activity, goal)){
      entries.push(newEntry(activity))
    }
  }

  return entries
}

const mapStateToProps = (state, ownProps) => {
  const dateString = ownProps.route.params.day
  const day = DateTime.fromFormat(dateString, 'yyyy-MM-dd')

  let dayActivities, weekActivities
  if(day > getToday(state.settings.dayStartHour)){
    const predictedEntries = predictEntries(state, day);
    // automatic semicolon insertion fails when line starts with "opening something"...
    ;({ dayActivities, weekActivities } = extractActivityLists(state, day, predictedEntries));
  }else{
    ;({ dayActivities, weekActivities } = extractActivityLists(state, day));
  }

  return { dayActivities, weekActivities, day }
}


const actionToProps = {
}

export default connect(mapStateToProps, actionToProps)(DayInCalendarScreen);

