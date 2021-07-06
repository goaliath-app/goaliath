import React from 'react';
import { connect } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor } from '../styles/Colors';
import { Header } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, Checkbox, List } from 'react-native-paper';
import { selectAllActivities, selectAllWeekEntriesByActivityId, addEntry, selectActivityEntities, deleteEntry, weekliesSelectedToday, upsertEntry } from '../redux';
import { extractActivityList, getToday, getWeeklyStats, getPreferedExpression, newEntry } from '../util';
import Duration from 'luxon/src/duration.js'


const SelectWeeklyActivitiesScreen = ({navigation, weeklyActivities, weeklyEntries, today, addEntry, deleteEntry, weekliesSelectedToday, upsertEntry}) => {
  const { t, i18n } = useTranslation()

  // status of each of the checkboxes. As boxes are checked, the object will populate.
  // keys will be the id of each activity, values are 'checked' or 'unchecked'
  // if a key is not present the activity will appear as unchecked
  let initialState = {}
  for(let activity of weeklyActivities) {
    if(weeklyEntries.filter(entry => entry.id == activity.id).length == 0){
      initialState[activity.id] = 'unchecked'
    }else{
      initialState[activity.id] = 'checked'
    }
  }
  const [ status, setStatus ] = React.useState(initialState)
  console.log('weeklyentries:')
  console.log(weeklyEntries)
  const headerButtons = (
    <Appbar.Action
      icon='check'
      onPress={() => {
        for(let activityId in status){
          if(status[activityId] == 'checked'){
            // si esa actividad no tiene entry hoy, lo creamos
            console.log(`si la actividad ${activityId} no tiene entry hoy, lo creamos`)
            if(weeklyEntries.filter(entry => entry.id == activityId).length == 0){
              console.log('no tiene entry, asi que lo creamos')
              const activity = weeklyActivities.filter(activity => activity.id == activityId)[0]
              const entry = newEntry(activity)
              addEntry({date: today, entry: entry})
            }else{
              const entry = weeklyEntries.filter(entry => entry.id == activityId)[0]
              if (entry.archived){
                upsertEntry({ date: today, entry: { ...entry, archived: false }})
              }
            }
          }else{
            // si esa actividad tiene entry hoy, lo borramos
            console.log(`si la actividad ${activityId} tiene entry hoy, lo borramos`)
            if(weeklyEntries.filter(entry => entry.id == activityId).length > 0){
              console.log('tiene entry, asi que a borrar!')
              deleteEntry({date: today, entryId: activityId})
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

const WeeklyListItem = ({name, description, id, status, setStatus}) => {
  
  const leftSlot = (
    <Checkbox 
      status={status[id]?status[id]:'unchecked'}
      onPress={() => {
        setStatus( {...status, [id]: (status[id]=='checked'? 'unchecked' : 'checked') } )
      }}
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

  return (
    <FlatList 
      data={activities}
      renderItem={({item})=>{
        let description
        if(item.goal == 'check'){
          const daysLeft = item.timesPerWeek - item.weeklyTimes
          description = t('weeklyActivities.daysLeft', {daysLeft})
        } else {
          const timeGoal = Duration.fromObject({seconds: item.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
          let timeLeft = timeGoal.minus(item.weeklyTime)
          timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
          const timeExpr = getPreferedExpression(timeLeft, t)
          description = t('weeklyActivities.timeLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit})
        }
        return(
          <WeeklyListItem name={item.name} description={description} id={item.id} status={status} setStatus={setStatus} />
        )
      }}    
    />
  )
}

const mapStateToProps = (state) => {
  const { dayStartHour } = state.settings
  const today = getToday(dayStartHour)
  const todayEntries = extractActivityList(state, today)
  const weeklyEntries = todayEntries.filter(entry => entry.repeatMode=='weekly')
  const allActivities = selectAllActivities(state)
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
}

export default connect(mapStateToProps, actionsToProps)(SelectWeeklyActivitiesScreen)
