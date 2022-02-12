import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View } from 'react-native';
import { Header, CalendarWeekItem, InfoCard } from '../components';
import { useTranslation } from 'react-i18next';
import { Appbar, Text, Divider, withTheme, Caption } from 'react-native-paper';
import { 
  selectEntriesByDay, weekliesSelectedToday, 
  getTodaySelector , selectAllActiveActivities
} from '../redux';
import { 
  SelectWeekliesItemDue, addEntryThunk, removeEntryThunk, 
  SelectWeekliesItemCompleted, isWeekCompleted, usesSelectWeekliesScreen } from './../activityHandler'


function filterCompletedWeeklyActivitiesSelector(state, activityList, date){
  return activityList.filter(activity => isWeekCompleted(state, activity.id, date))
}

function selectAllActiveWeeklyActivities(state){
  return selectAllActiveActivities(state).filter(
    activity => usesSelectWeekliesScreen(state, activity.id)
  )
}

const SelectWeeklyActivitiesScreen = withTheme(({ navigation, theme }) => {
  
  // misc. hooks
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  
  // selectors
  const today = useSelector(getTodaySelector)
  const activities = useSelector(selectAllActiveWeeklyActivities)
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
      style={{ height: 48, width: 48 }}
    />
  )

  function onCheckboxPress(activityId, status){
    setCheckboxesState({...checkboxesState, [activityId]: status})
    onActivityPress(activityId)
  }

  function onActivityPress(activityId){
    setSelectedActivity(activityId)
  }

  const completedActivities = useSelector(
    state => filterCompletedWeeklyActivitiesSelector(state, activities, today)
  )
  
  const dueActivities = activities.filter( 
    activity => !completedActivities.includes(activity)
  )

  const selectedActivities = dueActivities.filter(
    activity => checkboxesState[activity.id] == 'checked'
  )

  const unselectedActivities = dueActivities.filter(
    activity => checkboxesState[activity.id] != 'checked'
  )

  return (
    <View style={{flex: 1, backgroundColor: theme.colors.selectWeeklyActivitiesScreenBackground}}>
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
          animate='none'
        />
      </View>
      <Divider />
      <Text style={{marginLeft: 10, fontSize:14, marginTop: 10}}>{t('weeklyActivities.selectedCaption')}</Text>
      {
        selectedActivities.length > 0 ?
          selectedActivities.map( activity => (
            <SelectWeekliesItemDue 
              activity={activity} today={today} isChecked={checkboxesState[activity.id]} 
              onCheckboxPress={(status)=>onCheckboxPress(activity.id, status)} isSelected={selectedActivity==activity.id} onPress={()=>onActivityPress(activity.id)} 
              key={activity.id}
            />
          )) : 
          <InfoCard containerStyle={{marginHorizontal: 24, marginVertical: 8}} paragraph={t('weeklyActivities.noSelectedActivities')} /> 

      }
      { 
        unselectedActivities.length > 0 ?
        <>
          <Text style={{marginLeft: 10, fontSize:14, marginTop: 10}}>{t('weeklyActivities.dueCaption')}</Text>
          {unselectedActivities.map( activity => (
            <SelectWeekliesItemDue 
              activity={activity} today={today} isChecked={checkboxesState[activity.id]} 
              onCheckboxPress={(status)=>onCheckboxPress(activity.id, status)} isSelected={selectedActivity==activity.id} onPress={()=>onActivityPress(activity.id)} 
              key={activity.id}
            />
          ))}
        </> : null
      }
      { completedActivities.length > 0 ? 
        <>
        <Text style={{marginLeft: 10, fontSize:14, marginTop: 10}}>{t('weeklyActivities.completedCaption')}</Text>
        { completedActivities.map( activity => (
            <SelectWeekliesItemCompleted 
              activity={activity} today={today} 
              isSelected={selectedActivity==activity.id} 
              onPress={()=>onActivityPress(activity.id)} 
              key={activity.id}
            />
          ))}
        </> : null
      } 
    </View>
  );
})

export default SelectWeeklyActivitiesScreen;
