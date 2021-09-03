import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { selectActivityById, selectGoalById, selectEntryByActivityIdAndDate, 
    createOrUnarchiveEntry, archiveOrDeleteEntry, toggleCompleted, stopTodayTimer, upsertEntry } from '../../../redux'
import { getWeeklyStats, isActivityRunning, getPreferedExpression, getTodaySelector, getTodayTime } from '../../../util'
import { WeeklyListItem, WeekView as BaseWeekView } from '../../../components'
import { useTranslation } from 'react-i18next';
import { GeneralColor, SelectWeekliesColor } from '../../../styles/Colors';
import Duration from 'luxon/src/duration.js'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { List, IconButton, Text } from 'react-native-paper'
import * as Progress from 'react-native-progress';
import CheckboxMultipleBlankOutline from '../../../../assets/checkbox-multiple-blank-outline'
import CheckboxMultipleMarked from '../../../../assets/checkbox-multiple-marked'
import PauseFilledIcon from '../../../../assets/pause-filled'
import PauseOutlinedIcon from '../../../../assets/pause-outlined'
import { ActivityListItemColors } from '../../../styles/Colors'
import { ActivityListItem, DoubleProgressBar } from '../../../components'


const TodayScreenItem = ({ activityId, date }) => {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation()

  
  // selector hooks
  const activity = useSelector((state) => selectActivityById(state, activityId))
  const entry = useSelector((state) => selectEntryByActivityIdAndDate(state, activityId, date))
  
  // alias values
  const repsGoal = activity.params.dailyGoal.params.repetitions
  const todayReps = entry.repetitions
  
  // compute values
  const repsLeft = repsGoal - todayReps < 0 ? 0 : repsGoal - todayReps
  
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
  
  const description = `${todayReps} of ${repsGoal} reps done today`
  
  React.useEffect(() => {
    if( entry.repetitions === undefined ){
      dispatch(upsertEntry({ date, entry: { ...entry, repetitions: 0 } }))
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
}

  export default { TodayScreenItem }