import React, { useState } from 'react';
import { View, Share, StyleSheet } from 'react-native'
import { connect } from 'react-redux';
import { Text, List, Divider, IconButton } from 'react-native-paper'
import { DateTime } from 'luxon'
import { setDayStartHour } from '../../redux'
import { Header } from '../../components'
import DateTimePickerModal from "react-native-modal-datetime-picker"
import email from 'react-native-email'
import { faShareAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

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
      <List.Item
        title='Send feedback'
        description='Send a message to the developers'
        onPress={() => email('jimenaa971@gmail.com')}
      />
      <Divider />
      <List.Item
        title='Share'
        description='Introduce us to your friends'
        onPress={() => Share.share({message:"It's a nice app to achieve your goals, ¡try it!"})}
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