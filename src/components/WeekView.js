import React from 'react';
import { View, Pressable } from 'react-native';
import { Subheading } from 'react-native-paper';
import { WeekViewColor } from '../styles/Colors';
import { useTranslation } from 'react-i18next';

const WeekView = ({dayOfWeek}) => {
  const { t, i18n } = useTranslation()

  function getState(elementId, dayOfWeek){
    if(dayOfWeek==elementId){
      return 'today'
    }
    else if (dayOfWeek<elementId){
      return 'nextDay'
    }
    else{
      return 'pastDay'
    }
  }

  return(
    <View style= {{flexDirection: 'row', justifyContent: 'space-around', margin: 8 }}>
      <WeekViewItem label={t('units.dayNamesInitials.monday')} state={getState(1, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.tuesday')} state={getState(2, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.wednesday')} state={getState(3, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.thursday')} state={getState(4, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.friday')} state={getState(5, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.saturday')} state={getState(6, dayOfWeek)} />
      <WeekViewItem label={t('units.dayNamesInitials.sunday')} state={getState(7, dayOfWeek)} />
    </View>
  )
}

const WeekViewItem = ({label, id, state}) => {
  let squareColor = WeekViewColor.squareColor,
        textColor = WeekViewColor.textColor
  
 
  switch(state){
    case 'today':
      squareColor = WeekViewColor.todayBackground
      textColor = WeekViewColor.todayText
      break
    case 'pastDay':
      squareColor = WeekViewColor.pastDaysBackground
      textColor = WeekViewColor.pastDaysText
      break
    case 'nextDay':
      squareColor = WeekViewColor.nextDaysBackground
      textColor = WeekViewColor.nextDaysText
      break
  }

  return(
    <View style={{  
    backgroundColor: WeekViewColor.pastDaysBackground,
    flex: 1,
    aspectRatio: 1.3,
    alignItems: 'center',
    justifyContent: 'center'}}>
      <Pressable onPress={() => {}}>
        <View style={{
          flex: 1,
          aspectRatio: 1.3,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: squareColor
        }}>
          <Subheading style={{color: textColor}}>{label}</Subheading>
        </View>
      </Pressable>
    </View>
  )
  
}

export default WeekView;