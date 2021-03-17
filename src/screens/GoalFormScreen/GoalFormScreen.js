import React from 'react';
import { connect } from 'react-redux'
import { View, Alert } from 'react-native'
import { Appbar, TextInput } from 'react-native-paper';
import { Header } from '../../components'
import { createGoal, updateGoal, selectGoalById } from '../../redux/GoalsSlice';


const GoalFormScreen = ({ navigation, createGoal, updateGoal, goal=null }) => {

  const [name, setName] = React.useState(goal?.name?goal.name:'')
  const [motivation, setMotivation] = React.useState(goal?.motivation?goal.motivation:'')
  
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
          if(goal){
            updateGoal({...newGoal, id: goal.id})
          }else{
            createGoal({name: name, motivation: motivation})
          }
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

const mapStateToProps = (state, ownProps) => {
  const goal = selectGoalById(state, ownProps.route.params?.id)
  return { goal }
}

const actionsToProps = {
  createGoal,
  updateGoal
}

export default connect(mapStateToProps, actionsToProps)(GoalFormScreen);