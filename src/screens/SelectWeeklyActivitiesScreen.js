import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor, SelectWeekliesColor } from '../styles/Colors';
import { Header, Checkbox } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, List, Text } from 'react-native-paper';
import { 
  selectAllActivities, selectEntriesByDay, weekliesSelectedToday, 
  getTodaySelector 
} from '../redux';
import { WeekView } from '../components';
import { SelectWeekliesItemDue, addEntryThunk, removeEntryThunk, WeekView as ActivityHandlerWeekView, SelectWeekliesItemCompleted } from './../activityHandler'


const SelectWeeklyActivitiesScreen = ({ navigation }) => {
  
  // misc. hooks
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  
  // selectors
  const today = useSelector(getTodaySelector)
  const activities = useSelector(selectAllActivities)
  const entries = useSelector((state) => selectEntriesByDay(state, today))

  // state

  // checkboxesState: governs wether the checkboxes should be checked or not
  // {
  //   [activityId]: 'checked' or 'unchecked',
  //   ...
  // }
  let initialCheckboxState = {}
  for( let activity of activities ){
    if(entries.filter(e => e.id == activity.id && !e.archived).length > 0){
      initialCheckboxState[activity.id] = 'checked'
    }else{
      initialCheckboxState[activity.id] = 'unchecked'
    }
  }

  const [ checkboxesState, setCheckboxesState ] = React.useState(initialCheckboxState)
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
  let weekView
  if(selectedActivity !== null){
    weekView = <ActivityHandlerWeekView activityId={selectedActivity} date={today} todayChecked={checkboxesState[selectedActivity]} />
  }else{
    weekView = <WeekView dayOfWeek={today.weekday} daysDone={[]} daysLeft={[]} />
  }

  function onCheckboxPress(activityId, status){
    setCheckboxesState({...checkboxesState, [activityId]: status})
    onActivityPress(activityId)
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
      { weekView }
      { activities.map( (activity) => (
          <SelectWeekliesItemDue 
            activity={activity} today={today} isChecked={checkboxesState[activity.id]} 
            onCheckboxPress={(status)=>onCheckboxPress(activity.id, status)} isSelected={selectedActivity==activity.id} onPress={()=>onActivityPress(activity.id)} 
          />
        ))
      }
      { activities.map( (activity) => ( 
          <SelectWeekliesItemCompleted 
            activity={activity} today={today} 
            isSelected={selectedActivity==activity.id} 
            onPress={()=>onActivityPress(activity.id)} 
          /> 
        ))
      } 
    </View>
  );
}

export default SelectWeeklyActivitiesScreen;


// LEGACY CODE BELOW
// const WeeklyList = ({activities, status, setStatus, selectedActivity, onActivityPress}) => {
//   const { t, i18n } = useTranslation()

//   function renderDue({item}){
//     let description

//     } else { RENDER DUE FOR WEEKLY TIME ACTIVITIES
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
