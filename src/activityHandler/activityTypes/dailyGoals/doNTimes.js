import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { 
  selectEntryByActivityIdAndDate, toggleCompleted, upsertEntry, 
  selectActivityByIdAndDate, setRepetitions
} from '../../../redux'
import { useTranslation } from 'react-i18next';
import { View } from 'react-native'
import { IconButton, withTheme } from 'react-native-paper'
import { ActivityListItem } from '../../../components'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'


const TodayScreenItem = withTheme(({ activityId, date, theme }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  
  // selector hooks
  const activity = useSelector((state) => selectActivityByIdAndDate(state, activityId, date))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  
  // alias values
  const repsGoal = activity.params.dailyGoal.params.repetitions
  const todayReps = entry.repetitions? entry.repetitions.length : 0
  
  // compute values
  const repsLeft = repsGoal - todayReps < 0 ? 0 : repsGoal - todayReps
  
  // functions
  function addOne(){
    dispatch(setRepetitions({ date, id: entry.id, repetitions: todayReps + 1 }))
  }
  
  // get the correct left component
  let leftSlot
  // TODO: this is a placeholder, use the right icon with the right onPress
  if(entry.completed){
    leftSlot = <IconButton icon={() => <MaterialCommunityIcons name={"checkbox-multiple-marked"} size={25} color={theme.colors.todayCompletedIcon} />} onPress={addOne} />
  }else{
    leftSlot = <IconButton icon={() => <MaterialCommunityIcons name={"checkbox-multiple-blank-outline"} size={25} color={theme.colors.todayDueIcon} />} onPress={addOne} />
  }
  
  const description = t(
    'activityHandler.dailyGoals.doNTimes.listItemDescription',
    { todayReps, repsGoal }
  )
  
  React.useEffect(() => {
    if( entry.repetitions === undefined ){
      dispatch(upsertEntry({ date, entry: { ...entry, repetitions: [] } }))
    }
    if( todayReps >= repsGoal && !entry.completed ){
      dispatch(toggleCompleted({date: date, id: activityId}))
    }
  }, [todayReps, repsGoal, entry])
  
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
})

function usesRepetitions(state, activityId, date){
  return true
}

function getFrequencyString(state, activityId, t, date=null){
  const activity = selectActivityByIdAndDate(state, activityId, date)
  const repetitions = activity.params.dailyGoal.params.repetitions
  return t('activityHandler.dailyGoals.doNTimes.frequencyString', { repetitions })
}

function getDayActivityCompletionRatio(state, activityId, date){
  const activity = selectActivityByIdAndDate( state, activityId, date )
  const entry = selectEntryByActivityIdAndDate(state, activityId, date)

  if(!entry){
    return 0
  }else if(entry.completed){
    return 1
  }else{
    const repetitionsDone = entry.repetitions?.length ? entry.repetitions.length : 0
    const repetitionsGoal = activity.params.dailyGoal.params.repetitions

    if(repetitionsGoal == 0){
      return 1
    }else{
      return Math.min(1, repetitionsDone / repetitionsGoal)
    }
  }
}

export default { 
  TodayScreenItem, 
  getFrequencyString,
  getDayActivityCompletionRatio,
  usesRepetitions
}