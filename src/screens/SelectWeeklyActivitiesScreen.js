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
