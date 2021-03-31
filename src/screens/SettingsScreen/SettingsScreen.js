import React from 'react';
import { View } from 'react-native'
import { connect } from 'react-redux';
import { Text } from 'react-native-paper'
import { setDayStartHour } from '../../redux'
import { Header } from '../../components' 

const SettingsScreen = ({ settings, setDayStartHour, navigation }) => {
  setDayStartHour(10)
  return (
    <View>
      <Header title='Settings' left='hamburger' navigation={navigation}/>
      <Text>{JSON.stringify(settings)}</Text>
    </View>
  )
}

const mapStateToProps = (state) => {
  const settings = state.settings
  return { settings }
}


const actionToProps = {
    setDayStartHour
}

export default connect(mapStateToProps, actionToProps)(SettingsScreen);