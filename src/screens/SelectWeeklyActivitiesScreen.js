import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor, SelectWeekliesColor } from '../styles/Colors';
import { Header, Checkbox } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, List, Text } from 'react-native-paper';
import { selectAllActivities, selectAllWeekEntriesByActivityId, addEntry, selectActivityEntities, deleteEntry, weekliesSelectedToday, upsertEntry, archiveOrDeleteEntry, createOrUnarchiveEntry } from '../redux';
import { extractActivityList, getToday, getWeeklyStats, getPreferedExpression, newEntry, selectAllActiveActivities } from '../util';
import Duration from 'luxon/src/duration.js'


const SelectWeeklyActivitiesScreen = ({navigation, weeklyActivities, weeklyEntries, today, addEntry, deleteEntry, weekliesSelectedToday, upsertEntry, archiveOrDeleteEntry, createOrUnarchiveEntry}) => {
  const { t, i18n } = useTranslation()

  // status of each of the checkboxes. As boxes are checked, the object will populate.
  // keys will be the id of each activity, values are 'checked' or 'unchecked'
  // if a key is not present the activity will appear as unchecked
  let initialState = {}
  for(let activity of weeklyActivities) {
    if(weeklyEntries.filter(entry => entry.id == activity.id && !entry.archived).length == 0){
      initialState[activity.id] = 'unchecked'
    }else{
      initialState[activity.id] = 'checked'
    }
  }
  const [ status, setStatus ] = React.useState(initialState)
  const headerButtons = (
    <Appbar.Action
      icon='check'
      onPress={() => {
        for(let activityId in status){
          if(status[activityId] == 'checked'){
            // si esa actividad no tiene entry hoy, lo creamos
            createOrUnarchiveEntry(today, activityId)
          }else{
            // si esa actividad tiene entry hoy, lo borramos
            if(weeklyEntries.filter(entry => entry.id == activityId).length > 0){
              archiveOrDeleteEntry(today, activityId)
            }
          }
        }
        weekliesSelectedToday()
        navigation.goBack()
      }}
    />
  )

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('weeklyActivities.headerTitle')} 
        left='back' 
        navigation={navigation}
        buttons={headerButtons}
      />
      <WeeklyList activities={weeklyActivities} status={status} setStatus={setStatus}/> 
    </View>
  );
}

const WeeklyListItem = ({name, description, id, status, onCheckboxPress, checkboxColor}) => {
  const leftSlot = (
    <Checkbox 
      color={checkboxColor}
      status={status}
      onPress={onCheckboxPress}
    />
  )

  return (
    <List.Item 
      left={() => leftSlot}
      title={name}
      description={description}
      onPress={()=>{}}
    />
  )
}

const WeeklyList = ({activities, status, setStatus}) => {
  const { t, i18n } = useTranslation()

  function renderDue({item}){
    let description

    if(item.goal == 'check'){
      const daysLeft = item.timesPerWeek - item.weeklyTimes
      if(status[item.id] == 'checked'){
        description = (
          <Text style={{color: SelectWeekliesColor.selectedActivityDescription}}>
            {t('weeklyActivities.daysLeft', {daysLeft: daysLeft-1})}
          </Text>
        )
      }else{
        description = t('weeklyActivities.daysLeft', {daysLeft})
      }
    } else {
      const timeGoal = Duration.fromObject({seconds: item.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
      let timeLeft = timeGoal.minus(item.weeklyTime)
      timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
      const timeExpr = getPreferedExpression(timeLeft, t)
      description = t('weeklyActivities.timeLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit})
    }

    function toggleStatus(){
      setStatus( {...status, [item.id]: (status[item.id]=='checked'? 'unchecked' : 'checked') } )
    }

    return(
      <WeeklyListItem name={item.name} description={description} id={item.id} status={status[item.id]} onCheckboxPress={toggleStatus}/>      
    )
  }

  function renderCompleted({item}){
    let description

    if(item.goal == 'check'){
      description = t('weeklyActivities.checkCompleted', {weeklyTimes: item.weeklyTimes})
    } else {
      const timeExpr = getPreferedExpression(item.weeklyTime, t)
      description = t('weeklyActivities.timedCompleted', {unit: timeExpr.value, expression: timeExpr.localeUnit})
    }

    return (
      <WeeklyListItem name={item.name} description={description} id={item.id} status='checked' checkboxColor='black'/>  
    )
  }

  function isCompleted(activity){
    if(activity.goal == 'check'){
      const daysLeft = activity.timesPerWeek - activity.weeklyTimes
      return daysLeft < 1
    }else{
      const timeGoal = Duration.fromObject({seconds: activity.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
      let timeLeft = timeGoal.minus(activity.weeklyTime)
      return timeLeft < 1
    }
  }

  const completedActivities = activities.filter(activity => isCompleted(activity) )
  const dueActivities       = activities.filter(activity => !isCompleted(activity))


  return (
    <View>
      <FlatList 
        data={dueActivities}
        renderItem={renderDue}    
      />
      <FlatList
        data={completedActivities}
        renderItem={renderCompleted}
      />
    </View>
  )
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const today = getToday(dayStartHour)
  const todayEntries = extractActivityList(state, today)
  const weeklyEntries = todayEntries.filter(entry => entry.repeatMode=='weekly')
  const allActivities = selectAllActiveActivities(state)
  const weeklyActivities = allActivities.filter(activity => activity.repeatMode=='weekly')
  
  // inyect weeklyTime and weeklyTimes to each activity of weeklyActivities
  weeklyActivities.forEach((activity, i) => {
    const { weeklyTime, weeklyTimes } = getWeeklyStats(state, today, activity.id)
    weeklyActivities[i] = {...activity, weeklyTime, weeklyTimes}
  })
  return { weeklyEntries, weeklyActivities, today }
}

const actionsToProps = {
  addEntry,
  deleteEntry,
  weekliesSelectedToday,
  upsertEntry,
  archiveOrDeleteEntry,
  createOrUnarchiveEntry,
}

export default connect(mapStateToProps, actionsToProps)(SelectWeeklyActivitiesScreen)
