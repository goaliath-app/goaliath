import React from 'react';
import { View, Pressable } from 'react-native';
import { Subheading } from 'react-native-paper';
import { useTranslation } from 'react-i18next'
import { ActivityFormColor } from '../../styles/Colors';


const WeekdaySelector = ({ state, weekDays, setWeekDays, setWeekDaysError }) => {
  const { t, i18n } = useTranslation()
  let items = [
    {id: '1', label: t('units.dayNamesInitials.monday'), state: 'disabled', onPress: ()=>{}},
    {id: '2', label: t('units.dayNamesInitials.tuesday'), state: 'disabled', onPress: ()=>{}},
    {id: '3', label: t('units.dayNamesInitials.wednesday'), state: 'disabled', onPress: ()=>{}},
    {id: '4', label: t('units.dayNamesInitials.thursday'), state: 'disabled', onPress: ()=>{}},
    {id: '5', label: t('units.dayNamesInitials.friday'), state: 'disabled', onPress: ()=>{}},
    {id: '6', label: t('units.dayNamesInitials.saturday'), state: 'disabled', onPress: ()=>{}},
    {id: '7', label: t('units.dayNamesInitials.sunday'), state: 'disabled', onPress: ()=>{}},
  ]

  switch(state){
    case 'daily':
      items = items.map( item => ({...item, state: 'pressed-disabled'}))
      break
    case 'weekly':
      items = items.map( item => ({...item, state: 'dashed-disabled'}))
      break
    case 'select':
      items = items.map( item => ({
        ...item, 
        state: weekDays[item.id]?'pressed':'regular',
        onPress: () => {
          setWeekDays({...weekDays, [item.id]: !weekDays[item.id]})
          setWeekDaysError(false)
        }
      }))
  }  

  return(
    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 8}}>
      { items.map( item => <WeekdaySelectorItem { ...item } />) }
    </View>
  )
}

const WeekdaySelectorItem = ({ label, state, onPress }) => {
  let squareColor = ActivityFormColor.squareColor, 
      dashColor = ActivityFormColor.dashColor, 
      textColor = ActivityFormColor.textColor
  
  switch(state){
    case 'regular': 
      break
    case 'pressed':
      squareColor = ActivityFormColor.pressedSquareColor
      textColor = ActivityFormColor.pressedTextColor
      break
    case 'disabled':
      textColor = ActivityFormColor.disabledTextColor
      break
    case 'pressed-disabled':
      squareColor = ActivityFormColor.pressedDisabledSquareColor
      textColor = ActivityFormColor.pressedDisabledTextColor
      break
    case 'dashed':
      textColor = ActivityFormColor.dashedDisabledTextColor
      dashColor = ActivityFormColor.dashedDashColor
      break
    case 'dashed-disabled':
      dashColor = ActivityFormColor.dashedDisabledDashColor
      textColor = ActivityFormColor.dashedDisabledTextColor
      break
  }
  
  return(
    <View style={{  
      backgroundColor: dashColor,
      flex: 1,
      aspectRatio: 1.3,
      alignItems: 'center',
      justifyContent: 'center'}}>
      <Pressable onPressIn={onPress}>
        <View style={{
          flex: 1,
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: squareColor,
        }}>
          <Subheading style={{color: textColor}}>{label}</Subheading>
        </View>
      </Pressable>
    </View>
  )
}

export default WeekdaySelector