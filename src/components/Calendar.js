import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text, Subheading } from 'react-native-paper';
import { CalendarWeekItem } from './index'
import { useSelector } from 'react-redux';
import { getTodaySelector } from '../redux/selectors'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DateWheelPicker } from '../components'
import { CalendarColor } from '../styles/Colors';

// TODO: make startOfWeek prop functional
const Calendar = ({ 
  startOfWeek=1,
  onWeekPress=()=>{},     // this function will receive a date of that week as argument, as a Luxon DateTime
  onDayPress=()=>{},      // this function will receive a date of that day as argument, as a Luxon DateTime
  onDayLongPress=()=>{},  // this function will receive a date of that day as argument, as a Luxon DateTime
}) => {
  const { t, i18n } = useTranslation()

  const today = useSelector(getTodaySelector)

  const [ selectedDate, setSelectedDate ] = React.useState(today.startOf('month'))

  const [ wheelPickerVisible, setwheelPickerVisible] = React.useState(false)

  //Get first day of selectedDate week
  // const startOfFirstWeek = selectedDate.plus({days: (0 - ((today.weekday % 7) - startOfWeek) % 7)})
  const startOfFirstWeek = selectedDate.startOf('week')
  
  const weekData = []
  for (let currentDate = startOfFirstWeek; 
    currentDate < selectedDate.set({month: selectedDate.month + 1}); 
    currentDate = currentDate.plus({days: 7})) {
      weekData.push(currentDate)
    }
  
  const monthLabel = t('units.monthNames.' + selectedDate.toFormat('LLLL').toLowerCase())
  const year = selectedDate.toFormat('y')
  
  return(
    <View style={{ padding: 15 }}>
      <View style={{flexDirection:'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        {/* TODO: Add horizontal scroll. */}
        <Pressable onPress={() => setSelectedDate(selectedDate.minus({month: 1}))} style={{paddingHorizontal: 10}}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </Pressable>
        <Pressable onPress={() => setwheelPickerVisible(true)}>
          <Subheading>{monthLabel} {year}</Subheading>
          {wheelPickerVisible?
          <DateWheelPicker initialSelectedDate={selectedDate} onDismiss={() => setwheelPickerVisible(false)} onOKPress={(newDate) => setSelectedDate(newDate)} today={today} visible={wheelPickerVisible} />
          :
          <></>}
        </Pressable>
        <Pressable onPress={() => setSelectedDate(selectedDate.plus({month: 1})) } style={{paddingHorizontal: 10}}>
          <FontAwesomeIcon icon={faChevronRight} />
        </Pressable>
      </View>

      <View style={{ flexDirection:'row', justifyContent:'space-around', marginBottom: 5 }}>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.monday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.tuesday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.wednesday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.thursday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.friday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.saturday')}</Text>
        <Text style={styles.daysName}>{t('units.dayNamesShort2.sunday')}</Text>
      </View>
      
      {weekData.map( date => 
        <CalendarWeekItem 
          date={date} startOfWeek={startOfWeek} currentMonth={selectedDate} 
          onWeekPress={onWeekPress}
          onDayPress={onDayPress}
          onDayLongPress={onDayLongPress}
        />
      )}
     
    </View>
  )
}

const styles = StyleSheet.create({
  daysName: {
    color: CalendarColor.daysNameColor
  }
})

export default Calendar;