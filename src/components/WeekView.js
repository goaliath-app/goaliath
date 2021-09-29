import React from 'react';
import { View } from 'react-native';
import { Subheading } from 'react-native-paper';
import { WeekViewColor } from '../styles/Colors';
import { useTranslation } from 'react-i18next';

const WeekView = ({dayOfWeek, daysDone, daysLeft}) => {
  const { t, i18n } = useTranslation()

  function getDaysState(elementId, dayOfWeek){
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

  function getBarBottomState(elementId, daysDone, daysLeft){
    if(daysDone.includes(elementId)){
      return 'done'
    }
    else if(daysLeft.includes(elementId)){
      return 'left'
    }
    else{
      return 'transparent'
    }

  }

  return(
    <View style= {{ aspectRatio: 7, width: '100%', flexDirection: 'row', justifyContent: 'center', marginVertical: 8 }}>
      <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 8, borderWidth: 1, borderColor: WeekViewColor.borderColor }}>
        <WeekViewItem label={t('units.dayNamesInitials.monday')} state={getDaysState(1, dayOfWeek)} bottomBar={getBarBottomState(1, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.tuesday')} state={getDaysState(2, dayOfWeek)} bottomBar={getBarBottomState(2, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.wednesday')} state={getDaysState(3, dayOfWeek)} bottomBar={getBarBottomState(3, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.thursday')} state={getDaysState(4, dayOfWeek)} bottomBar={getBarBottomState(4, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.friday')} state={getDaysState(5, dayOfWeek)} bottomBar={getBarBottomState(5, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.saturday')} state={getDaysState(6, dayOfWeek)} bottomBar={getBarBottomState(6, daysDone, daysLeft)} borderRightWidth={0.5} />
        <WeekViewItem label={t('units.dayNamesInitials.sunday')} state={getDaysState(7, dayOfWeek)} bottomBar={getBarBottomState(7, daysDone, daysLeft)} borderRightWidth={0} />
      </View>
    </View>
  )
}

const WeekViewItem = ({label, state, bottomBar, borderRightWidth}) => {
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

  let bottomBarBackground

  switch(bottomBar){
    case 'done':
      bottomBarBackground = WeekViewColor.bottomBarDone
      break
    case 'left':
      bottomBarBackground = WeekViewColor.bottomBarLeft
      break
    case 'transparent':
      bottomBarBackground = 'transparent'
      break
  }

  return(
    <View style={{  
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: squareColor,
      borderRightWidth: borderRightWidth,
      borderColor: WeekViewColor.borderColor }}>
        <Subheading style={{color: textColor}}>{label}</Subheading> 
        <View style={{
          position: 'absolute',
          bottom: -5,
          height: 10,
          left: 5,
          right: 5,
          borderRadius: 5,
          backgroundColor: bottomBarBackground
        }}></View>
    </View>
      
  )
}

export default WeekView;