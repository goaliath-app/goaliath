import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectEntryByActivityIdAndDate, createOrUnarchiveEntry, toggleCompleted, 
  selectActivityByIdAndDate, getWeeklyStats, getTodaySelector, setRepetitions,
} from '../../redux'
import { WeeklyListItem } from '../../components'
import { useTranslation } from 'react-i18next';
import { View, } from 'react-native'
import { IconButton, } from 'react-native-paper'
import CheckboxMultipleBlankOutline from '../../../assets/checkbox-multiple-blank-outline'
import CheckboxMultipleMarked from '../../../assets/checkbox-multiple-marked'
import { ActivityListItem } from '../../components'

// TODO: just done basic visuals, see TODOs below
const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  
  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  const todayDate = useSelector(getTodaySelector)
  const { repetitionsCount } = useSelector((state) => getWeeklyStats(state, date, activityId))
  
  // alias values
  const weeklyReps = repetitionsCount
  const weeklyRepsGoal = activity.params.repetitions
  const todayReps = entry.repetitions.length
  
  // compute values
  const totalReps = weeklyReps + todayReps
  const repsLeft = weeklyRepsGoal - totalReps < 0 ? 0 : weeklyRepsGoal - totalReps
  
  // functions
  function addOne(){
    dispatch(setRepetitions({date, id: activityId, repetitions: todayReps + 1}))
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
    dispatch(createOrUnarchiveEntry(date, activityId, { repetitions: [] }))
  }
}

function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const repetitions = activity.params.repetitions

  return(
    t('activityHandler.activityTypes.doNTimesEachWeek.frequencyString', { repetitions })
  )
}

export function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)

  if(!entry){
    return 0
  }else if(entry.completed){
    return 1
  }else{
    const todayReps = entry.repetitions.length
    const weeklyRepsGoal = activity.params.repetitions

    return Math.min(1, todayReps / (weeklyRepsGoal / 7) )
  }
}

function getWeekActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const weeklyRepsGoal = activity.params.repetitions

  const weekStartDate = date.startOf('week')
  const weekEndDate = date.endOf('week')

  let repetitionsAccumulator = 0
  for(let day = weekStartDate; day <= weekEndDate; day = day.plus({days: 1})){
    const entry = selectEntryByActivityIdAndDate(state, activityId, day)
    if( entry && !entry.archived ){
      repetitionsAccumulator += entry.repetitions.length
    }
  }

  if( weeklyRepsGoal == 0 ){
    return 1
  } else {
    return Math.min( 1, repetitionsAccumulator / weeklyRepsGoal )
  }
}

export default { 
  SelectWeekliesItemDue,
  SelectWeekliesItemCompleted,
  TodayScreenItem,
  addEntryThunk,
  isWeekCompleted,
  getFrequencyString,
  getDayActivityCompletionRatio,
  getWeekActivityCompletionRatio
  // WeekView,
}

function isWeekCompleted( state, activityId, date ){
  /* returns true if at the beginning of date the activity was completed
  it does not take into account the work put that day */
  const { repetitionsCount } = getWeeklyStats(state, date, activityId)

  const activity = selectActivityByIdAndDate(state, activityId, date)
  const repsTarget = activity.params.repetitions

  return repetitionsCount >= repsTarget
}