import React from 'react';
import { Pressable, View } from 'react-native';
import { Dialog, Text, Portal } from 'react-native-paper'
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon'

const DateWheelPicker = ({ 
  // luxon DateTime for the date selected when the picker is created
  initialSelectedDate,
  // function without arguments to be called when the picker is dismissed
  onDismiss, 
  // function to be called when the OK button is pressed. The first day 
  // of the selected month will be passed to this function as a luxon DateTime.
  onOKPress,
  // today luxon DateTime, to calculate the year options to show
  today, 
  // bool, if true the picker is visible
  visible 
  
}) => {

  const { t, i18n } = useTranslation()

  const monthOptions = [t('units.monthNames.january'), t('units.monthNames.february'), t('units.monthNames.march'), 
    t('units.monthNames.april'), t('units.monthNames.may'), t('units.monthNames.june'), t('units.monthNames.july'), 
    t('units.monthNames.august'), t('units.monthNames.september'), t('units.monthNames.october'),
    t('units.monthNames.november'), t('units.monthNames.december')]

  const yearOptions = []
  for(let year=today.year-80; year < today.year+80; year++){
    yearOptions.push(year)
  }
  
  const yearIndex = yearOptions.indexOf(initialSelectedDate.year)
  const monthIndex = initialSelectedDate.month-1

  // selected year, as an integer
  const [ yearPickerValue, setYearPickerValue ] = React.useState()
  // selected month, as an integer (1 to 12)
  const [ monthPickerValue, setMonthPickerValue ] = React.useState()  

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Content style={{alignItems: 'center'}}>
          <View style={{flexDirection:'row'}}>
            {/* Months Picker */}
            <WheelPickerExpo
              items={monthOptions.map(name => ({ label: name, value: '' }))}
              initialSelectedIndex={monthIndex}
              onChange={({ index }) => {setMonthPickerValue(index + 1)}}
            />

            {/* Years Picker */}
            <WheelPickerExpo
              items={yearOptions.map(name => ({ label: name, value: '' }))}
              initialSelectedIndex={yearIndex}
              onChange={({ item }) => {setYearPickerValue(item.label)}}
            /> 
          </View>

          <View style={{flexDirection: 'row', marginTop: 20}}>
            <Pressable onPress={onDismiss} style={{margin: 5, paddingHorizontal: 10}}>
              <Text>{t('dateWheelPicker.dialog.cancel')}</Text>
            </Pressable>
            <Pressable 
              onPress={
                () => {
                  onOKPress(DateTime.fromObject({year: yearPickerValue, month: monthPickerValue, day: 1}))
                  onDismiss()}
              } 
              style={{margin: 5, paddingHorizontal: 10}}
            >
              <Text>{t('dateWheelPicker.dialog.acept')}</Text>
            </Pressable>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  
  );

}

export default DateWheelPicker;