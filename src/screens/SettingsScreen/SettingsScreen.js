import React, { useState } from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Text, List, Divider } from 'react-native-paper'
import { DateTime } from 'luxon'
import { setDayStartHour } from '../../redux'
import { Header } from '../../components'
import DateTimePickerModal from "react-native-modal-datetime-picker";

const SettingsScreen = ({ settings, setDayStartHour, navigation }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (time) => {
    const dateTime = DateTime.fromJSDate(time)
    hideDatePicker();
    setDayStartHour(dateTime.toISO());
  };

  return (
    <View>
      <Header title='Settings' left='hamburger' navigation={navigation}/>
      <List.Item 
        title="Start of next day"
        description='At this time the daily activities will reset.' 
        onPress={showDatePicker} 
        right={() => <Text style={{marginRight: 10, marginTop: 10, color:'blue', fontSize: 17}}>{DateTime.fromISO(settings.dayStartHour).toFormat('HH:mm')}</Text>} />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={DateTime.fromISO(settings.dayStartHour).toJSDate()}
      />
      <Divider />
    </View>
    
  );
};

const mapStateToProps = (state) => {
  const settings = state.settings
  return { settings }
}


const actionToProps = {
    setDayStartHour
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);