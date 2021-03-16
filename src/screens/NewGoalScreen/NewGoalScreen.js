import React from 'react';
import { connect } from 'react-redux'
import { View, Alert } from 'react-native'
import { Appbar, TextInput } from 'react-native-paper';
import { Header } from '../../components'
import { createGoal } from '../../redux/GoalsSlice';


const GoalsScreen = ({ navigation, createGoal }) => {

  const [name, setName] = React.useState('')
  const [motivation, setMotivation] = React.useState('')
  
  const validate = ( newGoal ) => {
    if(!newGoal.name){
      Alert.alert("Please enter a name for your goal")
      return false
    }
    return true
  }

  const headerButtons = (
    <Appbar.Action 
      icon='check' 
      onPress={() => {
        const newGoal = {name: name, motivation: motivation}
        if(validate(newGoal)){
          createGoal({name: name, motivation: motivation})
          navigation.navigate('Goals')}
        }
      } 
    />
    
  )

  return(
    <View>
      <Header title='New Goal' left='back' navigation={navigation} buttons={headerButtons} />
      <TextInput label='Goal Name' value={name} onChangeText={setName} />
      <TextInput
        label='Goal Motivation'
        multiline={true}
        numberOfLines={7}
        value={motivation}
        onChangeText={setMotivation}
      />
    </View>
  )
}

const actionsToProps = {
  createGoal,
}

export default connect(null, actionsToProps)(GoalsScreen);