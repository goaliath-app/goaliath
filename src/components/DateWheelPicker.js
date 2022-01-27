import React from 'react';
import { Pressable, View } from 'react-native';
import { Dialog, Text, Portal, Button, withTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon'
import ScrollPicker from 'react-native-wheel-scrollview-picker';


const DateWheelPicker = withTheme(({ 
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
  visible,
  theme
}) => {

  const { t, i18n } = useTranslation()

  const monthOptions = [t('units.monthNames.january'), t('units.monthNames.february'), t('units.monthNames.march'), 
    t('units.monthNames.april'), t('units.monthNames.may'), t('units.monthNames.june'), t('units.monthNames.july'), 
    t('units.monthNames.august'), t('units.monthNames.september'), t('units.monthNames.october'),
    t('units.monthNames.november'), t('units.monthNames.december')]

  const yearOptions = []
  for(let year=today.year-1; year < today.year+10; year++){
    yearOptions.push(year)
  }
  
  const yearIndex = yearOptions.indexOf(initialSelectedDate.year)
  const monthIndex = initialSelectedDate.month-1

  // selected year, as an integer
  const [ yearPickerIndex, setYearPickerIndex ] = React.useState(yearIndex)
  // selected month, as an integer (1 to 12)
  const [ monthPickerIndex, setMonthPickerIndex ] = React.useState(monthIndex)  

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Content style={{alignItems: 'center'}}>
          <View style={{flexDirection:'row', backgroundColor: theme.colors.dialogBackground}}>
            <ScrollPicker
              dataSource={monthOptions}
              selectedIndex={monthPickerIndex}
              renderItem={ (data, index) => <Text>{data}</Text> }
              onValueChange={(data, selectedIndex) => {
                setMonthPickerIndex(selectedIndex)
              }}
              wrapperHeight={180}
              wrapperWidth={150}
              wrapperColor={theme.colors.dialogBackground}
              itemHeight={60}
              highlightColor={theme.colors.outline}
              highlightBorderWidth={2}
            />

            <ScrollPicker
              dataSource={yearOptions}
              selectedIndex={yearPickerIndex}
              renderItem={ (data, index) => <Text>{data}</Text> }
              onValueChange={(data, selectedIndex) => {
                setYearPickerIndex(selectedIndex)
              }}
              wrapperHeight={180}
              wrapperWidth={150}
              wrapperColor={theme.colors.dialogBackground}
              itemHeight={60}
              highlightColor={theme.colors.outline}
              highlightBorderWidth={2}
            />

          </View>

          <View style={{flexDirection: 'row', marginTop: 20}}>
            <Button onPress={onDismiss} style={{margin: 5, paddingHorizontal: 10}}>
              <Text>{t('dateWheelPicker.dialog.cancel')}</Text>
            </Button>
            <Button 
              onPress={
                () => {
                  onOKPress(DateTime.fromObject({year: yearOptions[yearPickerIndex], month: monthPickerIndex+1, day: 1}))
                  onDismiss()}
              } 
              style={{margin: 5, paddingHorizontal: 10}}
            >
              <Text>{t('dateWheelPicker.dialog.acept')}</Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  
  );

})

export default DateWheelPicker;