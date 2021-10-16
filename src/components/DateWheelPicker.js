import React from 'react';
import { View } from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { useTranslation } from 'react-i18next';

const DateWheelPicker = ({ today}) => {
  const { t, i18n } = useTranslation()

  const monthOptions = [t('units.monthNames.january'), t('units.monthNames.february'), t('units.monthNames.march'), 
    t('units.monthNames.april'), t('units.monthNames.may'), t('units.monthNames.june'), t('units.monthNames.july'), 
    t('units.monthNames.august'), t('units.monthNames.september'), t('units.monthNames.october'),
    t('units.monthNames.november'), t('units.monthNames.december')]

  const yearOptions = []

  for(let year=today.year-80; year < today.year+80; year++){
    yearOptions.push(year)
  }

  return (
    <View style={{flexDirection:'row'}}>
      {/* Months Picker */}
      <WheelPickerExpo
        items={monthOptions.map(name => ({ label: name, value: '' }))}
      />

      {/* Years Picker */}
      <WheelPickerExpo
      items={yearOptions.map(name => ({ label: name, value: '' }))}
      /> 
    </View>
  );

}

export default DateWheelPicker;