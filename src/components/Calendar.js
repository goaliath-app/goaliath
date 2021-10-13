import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { CalendarWeekItem } from './index'
import { useSelector } from 'react-redux';
import { getTodaySelector } from '../redux/selectors'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const CalendarTwo = ({ startOfWeek=1 }) => {
  const today = useSelector(getTodaySelector)

  const [ selectedDate, setSelectedDate ] = React.useState(today.startOf('month'))

  const weekData = []

  //Get first day of selectedDate week
  const startOfFirstWeek = selectedDate.plus({days: (0 - ((today.weekday % 7) - startOfWeek) % 7)})

  for (let currentDate = startOfFirstWeek; 
    currentDate < selectedDate.plus({month: 1}); 
    currentDate = currentDate.plus({days: 7})) {
      weekData.push(currentDate)
    }
    
  let month = selectedDate.toFormat('LLLL')
  let year = selectedDate.toFormat('y')

  const { t, i18n } = useTranslation()
  
  return(
    <View style={{padding: 20}}>
      <View style={{flexDirection:'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        {/* TODO: Add a picker to select months and years.
                  Add horizontal scroll. */}
        <Pressable onPress={() => setSelectedDate(selectedDate.minus({month: 1}))} style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faChevronLeft} /></Pressable>
        <Title>{month} {year}</Title>
        <Pressable onPress={() => setSelectedDate(selectedDate.plus({month: 1})) } style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faChevronRight} /></Pressable>
      </View>

      <View style={{flexDirection:'row', justifyContent:'space-around', marginBottom: 5}}>
        <Text>{t('units.dayNamesShort2.monday')}</Text>
        <Text>{t('units.dayNamesShort2.tuesday')}</Text>
        <Text>{t('units.dayNamesShort2.wednesday')}</Text>
        <Text>{t('units.dayNamesShort2.thursday')}</Text>
        <Text>{t('units.dayNamesShort2.friday')}</Text>
        <Text>{t('units.dayNamesShort2.saturday')}</Text>
        <Text>{t('units.dayNamesShort2.sunday')}</Text>
      </View>
      
      {weekData.map( date => <CalendarWeekItem date={date} startOfWeek={startOfWeek} today={today} />) }
     
    </View>
  )
}

export default CalendarTwo;