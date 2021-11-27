import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList } from 'react-native';
import { GeneralColor, SelectWeekliesColor } from '../styles/Colors';
import { Header, Checkbox, CalendarWeekItem } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, List, Text, Divider } from 'react-native-paper';
import { 
  selectAllActivities, selectEntriesByDay, weekliesSelectedToday, 
  getTodaySelector 
} from '../redux';
import { SelectWeekliesItemDue, addEntryThunk, removeEntryThunk, SelectWeekliesItemCompleted } from './../activityHandler'


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
      <View style={{ marginHorizontal: 16, marginTop: 8 }}>
        <CalendarWeekItem 
          date={today}
          activityId={selectedActivity}
          showDayNumbers={false}
          softTodayHighlight={false}  
        />
      </View>
      <Divider />
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
