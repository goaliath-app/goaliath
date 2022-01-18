import React from 'react';
import { View, Pressable } from 'react-native';
import { Subheading, withTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next'


const WeekdaySelector = withTheme(({ state, weekDays, setWeekDays, setWeekDaysError }) => {
  const { t, i18n } = useTranslation()
  let items = [
    {id: '1', label: t('units.dayNamesInitials.monday')},
    {id: '2', label: t('units.dayNamesInitials.tuesday')},
    {id: '3', label: t('units.dayNamesInitials.wednesday')},
    {id: '4', label: t('units.dayNamesInitials.thursday')},
    {id: '5', label: t('units.dayNamesInitials.friday')},
    {id: '6', label: t('units.dayNamesInitials.saturday')},
    {id: '7', label: t('units.dayNamesInitials.sunday')},
  ]

  items = items.map( item => ({
    ...item, 
    state: weekDays[item.id]?'pressed':'regular',
    onPress: () => {
      setWeekDays({...weekDays, [item.id]: !weekDays[item.id]})
      setWeekDaysError(false)
    }
  }))

  return(
    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 8}}>
      { items.map( item => <WeekdaySelectorItem { ...item } />) }
    </View>
  )
})

const WeekdaySelectorItem = withTheme(({ label, state, onPress, theme }) => {
  let squareColor = 'transparent', 
      dashColor = 'transparent', 
      textColor = theme.colors.onSurface
  
  switch(state){
    case 'regular': 
      break
    case 'pressed':
      squareColor = theme.colors.primary
      textColor = theme.colors.onPrimary
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
})

export default WeekdaySelector;