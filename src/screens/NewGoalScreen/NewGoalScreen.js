import React from 'react';
import { View } from 'react-native'
import { Appbar, TextInput } from 'react-native-paper';
import { Header } from '../../components'


const GoalsScreen = ({ navigation }) => {

  const [name, setName] = React.useState('')
  const [motivation, setMotivation] = React.useState('')
  const headerButtons = (
    <Appbar.Action icon='check' onPress={() => navigation.navigate('Goals')} />
    
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

export default GoalsScreen;