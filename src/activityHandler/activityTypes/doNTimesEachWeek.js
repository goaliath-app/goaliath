import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry, toggleCompleted, stopTodayTimer, upsertEntry } from '../../redux'
import { getWeeklyStats, isActivityRunning, getPreferedExpression, getTodaySelector, getTodayTime } from '../../util'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../components'
import dailyGoals from './dailyGoals'
import { useTranslation } from 'react-i18next';
import { GeneralColor, SelectWeekliesColor } from '../../styles/Colors';
import Duration from 'luxon/src/duration.js'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { List, IconButton, Text } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import CheckboxMultipleBlankOutline from '../../../assets/checkbox-multiple-blank-outline'
import CheckboxMultipleMarked from '../../../assets/checkbox-multiple-marked'
import PauseFilledIcon from '../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../assets/pause-outlined'
import { ActivityListItemColors } from '../../styles/Colors'
import { ActivityListItem, DoubleProgressBar } from '../../components'

// TODO: just done basic visuals, see TODOs below
const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  
  // selector hooks
  const activity = useSelector((state) => selectActivityById(state, activityId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)
  const { repetitionsCount } = useSelector((state) => getWeeklyStats(state, date, activityId))
  
  // alias values
  const weeklyReps = repetitionsCount
  const weeklyRepsGoal = activity.params.repetitions
  const todayReps = entry.repetitions
  
  // compute values
  const totalReps = weeklyReps + todayReps
  const repsLeft = weeklyRepsGoal - totalReps < 0 ? 0 : weeklyRepsGoal - totalReps
  
  // functions
  function addOne(){
    dispatch(upsertEntry({ date, entry: { ...entry, repetitions: todayReps + 1 } }))
  }
  
  // get the correct left component
  let leftSlot
  // TODO: this is a placeholder, use the right icon with the right onPress
  if(entry.completed){
    leftSlot = <IconButton icon={() => <CheckboxMultipleMarked />} onPress={addOne} />
  }else{
    leftSlot = <IconButton icon={() => <CheckboxMultipleBlankOutline />} onPress={addOne} />
  }
  
  const description = `${todayReps} done today - ${repsLeft} of ${weeklyRepsGoal} left this week`
  
  React.useEffect(() => {
    if( totalReps >= weeklyRepsGoal && !entry.completed ){
      console.log('entry.completed', entry.completed)
      dispatch(toggleCompleted({date: date, id: activityId}))
    }
  }, [totalReps, weeklyRepsGoal])
  
  return(
    <View>
      <ActivityListItem
        activity={activity}
        entry={entry}
        date={date}
        left={()=>leftSlot}
        description={description}
      />
    </View>
  )
}

function SelectWeekliesItemDue({ activity, today, isChecked, onCheckboxPress, isSelected, onPress }){
  // misc. hooks
  const { t, i18n } = useTranslation()
  
  // selectors
  const { repetitionsCount } = useSelector((state) => getWeeklyStats(state, today, activity.id))
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))

  // alias values
  const weeklyRepsGoal = activity.params.repetitions
  
  // calculations
  const repsLeft = weeklyRepsGoal - repetitionsCount
  const description = `${repsLeft} of ${weeklyRepsGoal} repetitions remaining`

  return(
    weekCompleted?
      null
      :
      <WeeklyListItem 
        name={activity.name}
        description={description}
        id={activity.id}
        checkboxStatus={isChecked} 
        onCheckboxPress={onCheckboxPress} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
      /> 
  )
}


function SelectWeekliesItemCompleted({ activity, today, isSelected, onPress }){
  const { t, i18n } = useTranslation()
  
  const weekCompleted = useSelector(state => isWeekCompleted(state, activity.id, today))

  const description = `${activity.params.repetitions} repetitions goal met this week`

  return(
    weekCompleted?
      <WeeklyListItem 
        name={activity.name}
        description={description}
        id={activity.id}
        checkboxStatus={'checked'} 
        selected={isSelected} 
        onPress={onPress}
        date={today}
        checkboxColor='grey'
        onCheckboxPress={()=>{}}
      /> 
      :
      null
  )
}


// TODO
// const WeekView = ({ activityId, date, todayChecked }) => {
//   // selectors
//   const { weeklyTime, daysDoneCount, daysDoneList } = useSelector((state) => getWeeklyStats(state, date, activityId))
//   const activity = useSelector( state => selectActivityById(state, activityId) )

//   const daysDone = (
//     todayChecked=='checked'?
//       [ ...daysDoneList, date.weekday ]
//     : 
//       daysDoneList
//   )

//   return (
//     <BaseWeekView dayOfWeek={date.weekday} daysDone={daysDone} daysLeft={[]} />
//   )
// }

// addEntryThunk to add the repetitions field to entries of this activity type
function addEntryThunk( activityId, date ){
  return (dispatch, getState) => {
    dispatch(createOrUnarchiveEntry(date, activityId, { repetitions: 0 }))
  }
}

function getFrequencyString(state, activityId, t){
  const activity = selectActivityById(state, activityId)
  const repetitions = activity.params.repetitions

  return(
    t('activityHandler.activityTypes.doNTimesEachWeek.frequencyString', { repetitions })
  )
}

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  addEntryThunk,
  isWeekCompleted,
  getFrequencyString,
  // WeekView,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { repetitionsCount } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityById(state, activityId)
  const repsTarget = activity.params.repetitions

  return repetitionsCount >= repsTarget
}