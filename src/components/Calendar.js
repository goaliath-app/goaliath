import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { CalendarWeekItem } from './index'
import { useSelector } from 'react-redux';
import { getTodaySelector } from '../redux/selectors'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DateWheelPicker } from '../components'

const CalendarTwo = ({ startOfWeek=1 }) => {
  const today = useSelector(getTodaySelector)

  const [ selectedDate, setSelectedDate ] = React.useState(today.startOf('month'))

  const [ wheelPickerVisible, setwheelPickerVisible] = React.useState(false)

  //Get first day of selectedDate week
  const startOfFirstWeek = selectedDate.plus({days: (0 - ((today.weekday % 7) - startOfWeek) % 7)})
  
  const weekData = []
  for (let currentDate = startOfFirstWeek; 
    currentDate < selectedDate.plus({month: 1}); 
    currentDate = currentDate.plus({days: 7})) {
      weekData.push(currentDate)
    }
    
  const month = selectedDate.toFormat('LLLL')
  const year = selectedDate.toFormat('y')

  const { t, i18n } = useTranslation()
  
  return(
    <View style={{padding: 20}}>
      <View style={{flexDirection:'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        {/* TODO: Add horizontal scroll. */}
        <Pressable onPress={() => setSelectedDate(selectedDate.minus({month: 1}))} style={{paddingHorizontal: 10}}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </Pressable>
        <Pressable onPress={() => setwheelPickerVisible(true)}>
          <Title>{month} {year}</Title>
          {wheelPickerVisible?
          <DateWheelPicker initialSelectedDate={selectedDate} onDismiss={() => setwheelPickerVisible(false)} onOKPress={(newDate) => setSelectedDate(newDate)} today={today} visible={wheelPickerVisible} />
          :
          <></>}
        </Pressable>
        <Pressable onPress={() => setSelectedDate(selectedDate.plus({month: 1})) } style={{paddingHorizontal: 10}}>
          <FontAwesomeIcon icon={faChevronRight} />
        </Pressable>
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