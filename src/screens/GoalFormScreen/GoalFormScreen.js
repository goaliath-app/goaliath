import React from 'react';
import { connect } from 'react-redux'
import { View, Alert, StyleSheet } from 'react-native'
import { Appbar, TextInput, Subheading } from 'react-native-paper';
import { Header } from '../../components'
import { createGoal, updateGoal, selectGoalById } from '../../redux';


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
          navigation.goBack()}
        }
      } 
    />
    
  )

  return(
    <View>
      <Header title='New Goal' left='back' navigation={navigation} buttons={headerButtons} />
      <Subheading style={styles.subheading}>What do you want to achieve?</Subheading>
      <TextInput 
        style={styles.textInput}
        mode='outlined' 
        label="Goal Name" 
        value={name} 
        onChangeText={setName} />
      <Subheading style={styles.subheading}>Why do you want to achieve this goal?</Subheading>
      <TextInput
        style={styles.textInput}
        mode='outlined'
        label="Goal Motivation"
        multiline={true}
        numberOfLines={10}
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

const styles = StyleSheet.create ({
  textInput: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    fontSize: 16
  },
  subheading: {
    marginLeft: 16,
    marginTop: 16
  }
})



export default connect(mapStateToProps, actionsToProps)(GoalFormScreen);