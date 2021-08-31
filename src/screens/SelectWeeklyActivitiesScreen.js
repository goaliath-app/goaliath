import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor, SelectWeekliesColor } from '../styles/Colors';
import { Header, Checkbox } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, List, Text } from 'react-native-paper';
import { selectAllActivities, selectAllWeekEntriesByActivityId, addEntry, selectActivityEntities, deleteEntry, weekliesSelectedToday, upsertEntry, archiveOrDeleteEntry, createOrUnarchiveEntry } from '../redux';
import { extractActivityList, getToday, getWeeklyStats, getPreferedExpression, newEntry, selectAllActiveActivities, getTodaySelector } from '../util';
import Duration from 'luxon/src/duration.js'
import { WeekView } from '../components';
import { SelectWeekliesItemDue, addEntryThunk, removeEntryThunk } from './../activityHandler'


const SelectWeeklyActivitiesScreen = ({ navigation }) => {
  
  // misc. hooks
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  
  // selectors
  const today = useSelector(getTodaySelector)
  const activities = useSelector(selectAllActivities)


  // state

  // checkboxesState: governs wether the checkboxes should be checked or not
  // {
  //   [activityId]: boolean,
  //   ...
  // }
  // if the key is not present the activity will appear checked iif an entry
  // is present for that activity and day
  const [ checkboxesState, setCheckboxesState ] = React.useState({})
  const [ selectedActivity, setSelectedActivity ] = React.useState(null)
  

  const headerButtons = (
    <Appbar.Action
      icon='check'
      onPress={() => {
        for(let activityId in checkboxesState){
          if(checkboxesState[activityId] == 'checked'){
            dispatch(addEntryThunk(activityId, today))
          } else {
            dispatch(removeEntryThunk(activityId, today))
          }
        }
        dispatch(weekliesSelectedToday())
        navigation.goBack()
      }}
    />
  )

  // computations for the selected activity
  let weekWiew = <WeekView dayOfWeek={today.weekday} daysDone={[]} daysLeft={[]} />
  if(selectedActivity !== null){
    // TODO: call the function of the corresponding activity to get is WeekWiew
  }

  function onCheckboxPress(activityId, status){
    setCheckboxesState({...checkboxesState, [activityId]: status})
  }

  function onActivityPress(activityId){
    setSelectedActivity(activityId)
  }

  return (
    <View style={{flex: 1, backgroundColor: GeneralColor.screenBackground}}>
      <Header 
        title={t('weeklyActivities.headerTitle')} 
        left='back' 
        navigation={navigation}
        buttons={headerButtons}
      />
      { weekWiew }
      { activities.map( (activity) => (
          <SelectWeekliesItemDue 
            activity={activity} today={today} isChecked={checkboxesState[activity.id]} 
            onCheckboxPress={(status)=>onCheckboxPress(activity.id, status)} isSelected={selectedActivity==activity.id} onPress={()=>onActivityPress(activity.id)} 
          />
        ))
      }
      {/* 
      TODO: don't show completed activities in SelectWeekliesItemDue and show them in SelectWeekliesItemCompleted
      or maybe add the completed/due in a prop instead of creating two components?
      { activities.map( (activity) => renderSelectWeekliesItemCompleted(activity, today, checkboxesState[activity.id], ()=>onCheckboxPress(activity.id), false, ()=>{}) )} */}
    </View>
  );
}

export default SelectWeeklyActivitiesScreen;


// LEGACY CODE BELOW
// const WeeklyList = ({activities, status, setStatus, selectedActivity, onActivityPress}) => {
//   const { t, i18n } = useTranslation()

//   function renderDue({item}){
//     let description

//     if(item.goal == 'check'){
//       const daysLeft = item.timesPerWeek - item.weeklyTimes
//       if(status[item.id] == 'checked'){
//         description = (
//           <Text style={{color: SelectWeekliesColor.selectedActivityDescription}}>
//             {t('weeklyActivities.daysLeft', {daysLeft: daysLeft-1})}
//           </Text>
//         )
//       }else{
//         description = t('weeklyActivities.daysLeft', {daysLeft})
//       }
//     } else {
//       const timeGoal = Duration.fromObject({seconds: item.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
//       let timeLeft = timeGoal.minus(item.weeklyTime)
//       timeLeft = timeLeft.as('seconds') >= 0? timeLeft : Duration.fromObject({seconds: 0}).shiftTo('hours', 'minutes', 'seconds')
//       const timeExpr = getPreferedExpression(timeLeft, t)
//       description = t('weeklyActivities.timeLeft', {timeExprValue: timeExpr.value, timeExprLocaleUnit: timeExpr.localeUnit})
//     }

//     function toggleStatus(){
//       setStatus( {...status, [item.id]: (status[item.id]=='checked'? 'unchecked' : 'checked') } )
//     }

//     return(
//       <WeeklyListItem name={item.name} description={description} id={item.id} 
//         status={status[item.id]} onCheckboxPress={() => {
//           toggleStatus()
//           onActivityPress(item.id)
//         }} selected={selectedActivity==item.id} 
//         onPress={() => onActivityPress(item.id)}/> 
//     )
//   }

//   function renderCompleted({item}){
//     let description

//     if(item.goal == 'check'){
//       description = t('weeklyActivities.checkCompleted', {weeklyTimes: item.weeklyTimes})
//     } else {
//       const timeExpr = getPreferedExpression(item.weeklyTime, t)
//       description = t('weeklyActivities.timedCompleted', {unit: timeExpr.value, expression: timeExpr.localeUnit})
//     }

//     return (
//       <WeeklyListItem name={item.name} description={description} id={item.id} status='checked' 
//       checkboxColor='black' onPress={() => onActivityPress(item.id)} selected={selectedActivity==item.id}/>  
//     )
//   }

//   function isCompleted(activity){
//     if(activity.goal == 'check'){
//       const daysLeft = activity.timesPerWeek - activity.weeklyTimes
//       return daysLeft < 1
//     }else{
//       const timeGoal = Duration.fromObject({seconds: activity.timeGoal}).shiftTo('hours', 'minutes', 'seconds')
//       let timeLeft = timeGoal.minus(activity.weeklyTime)
//       return timeLeft < 1
//     }
//   }

//   const completedActivities = activities.filter(activity => isCompleted(activity) )
//   const dueActivities       = activities.filter(activity => !isCompleted(activity))


//   return (
//     <View>
//       <FlatList 
//         data={dueActivities}
//         renderItem={renderDue}    
//       />
//       <FlatList
//         data={completedActivities}
//         renderItem={renderCompleted}
//       />
//     </View>
//   )
// }






// const mapStateToProps = (state) => {
//   const { dayStartHour } = state.settings
//   const today = getToday(dayStartHour)
//   const todayEntries = extractActivityList(state, today)
//   const weeklyEntries = todayEntries.filter(entry => entry.repeatMode=='weekly')
//   const allActivities = selectAllActiveActivities(state)
//   const weeklyActivities = allActivities.filter(activity => activity.repeatMode=='weekly')
  
//   // inyect weeklyTime and weeklyTimes to each activity of weeklyActivities
//   weeklyActivities.forEach((activity, i) => {
//     const { weeklyTime, weeklyTimes, daysDone } = getWeeklyStats(state, today, activity.id)

//     weeklyActivities[i] = {...activity, weeklyTime, weeklyTimes, daysDone}
//   })
//   return { weeklyEntries, weeklyActivities, today }
// }

// const actionsToProps = {
//   addEntry,
//   deleteEntry,
//   weekliesSelectedToday,
//   upsertEntry,
//   archiveOrDeleteEntry,
//   createOrUnarchiveEntry,
// }

// export default connect(mapStateToProps, actionsToProps)(SelectWeeklyActivitiesScreen)
